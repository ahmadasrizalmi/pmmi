import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool, withTransaction } from '../db.js';
import { requireAuth } from '../security/authz.js';
import { config } from '../config.js';
import { enqueueOutbox } from '../events.js';
import { writeAudit } from '../audit.js';

const buildSchema=z.object({displayName:z.string().min(2).max(80)});

function profileName(userId:string,id:string){return `pmmi-${userId.slice(0,8)}-${id.slice(0,8)}`.toLowerCase();}

export async function registerHermesRoutes(app:FastifyInstance){
  app.get('/v1/hermes/agents',async(request,reply)=>{
    const user=await requireAuth(request,reply);if(!user)return;
    const result=await pool.query(`select p.*,w.path workspace_path,w.quota_bytes,w.status workspace_status,(select status from hermes_build_jobs j where j.profile_id=p.id order by created_at desc limit 1) build_status from hermes_profiles p left join hermes_workspaces w on w.profile_id=p.id where p.user_id=$1 order by p.created_at desc`,[user.sub]);
    const ent=await pool.query(`select hermes_agent_slots,storage_quota_bytes from resource_entitlements where user_id=$1`,[user.sub]);
    return {items:result.rows,entitlement:ent.rows[0]??{hermes_agent_slots:0,storage_quota_bytes:0}};
  });

  app.post('/v1/hermes/agents',async(request,reply)=>{
    const user=await requireAuth(request,reply,['SANTRI','USTADZ']);if(!user)return;
    const parsed=buildSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid agent'});
    const result=await withTransaction(async client=>{
      if(user.role==='SANTRI'){
        const student=await client.query(`select status from students where user_id=$1 for update`,[user.sub]);
        if(!student.rowCount||student.rows[0].status!=='ACTIVE')return {kind:'inactive' as const};
      }
      const ent=await client.query(`select hermes_agent_slots,storage_quota_bytes from resource_entitlements where user_id=$1 for update`,[user.sub]);
      if(!ent.rowCount)return {kind:'no_entitlement' as const};
      const count=await client.query(`select count(*)::int count from hermes_profiles where user_id=$1 and status<>'ARCHIVED'`,[user.sub]);
      if(Number(count.rows[0].count)>=Number(ent.rows[0].hermes_agent_slots))return {kind:'slots' as const,slots:Number(ent.rows[0].hermes_agent_slots)};
      const id=randomUUID();const name=profileName(user.sub,id);const path=`${config.HERMES_WORKSPACE_ROOT.replace(/\/$/,'')}/${user.sub}/${id}`;
      await client.query(`insert into hermes_profiles(id,user_id,profile_name,display_name,status) values($1,$2,$3,$4,'PENDING')`,[id,user.sub,name,parsed.data.displayName]);
      await client.query(`insert into hermes_workspaces(profile_id,path,quota_bytes,status) values($1,$2,$3,'PENDING')`,[id,path,Number(ent.rows[0].storage_quota_bytes)]);
      const job=await client.query(`insert into hermes_build_jobs(profile_id,status) values($1,'QUEUED') returning id`,[id]);
      await enqueueOutbox(client,'hermes.profile.build','hermes_profile',id,{profileId:id,userId:user.sub,profileName:name,workspacePath:path,jobId:job.rows[0].id},`hermes-build:${id}`);
      await writeAudit(client,user.sub,'hermes.build_requested','hermes_profile',id,{profileName:name});
      return {kind:'ok' as const,id,profileName:name,workspacePath:path,status:'PENDING',jobId:job.rows[0].id};
    });
    if(result.kind==='inactive')return reply.code(403).send({error:'student must be ACTIVE'});
    if(result.kind==='no_entitlement')return reply.code(403).send({error:'Hermes entitlement not provisioned'});
    if(result.kind==='slots')return reply.code(409).send({error:'Hermes agent slot limit reached',slots:result.slots});
    return reply.code(202).send(result);
  });

  async function queueRuntimeAction(request:any,reply:any,action:'start'|'stop'){
    const user=await requireAuth(request,reply);if(!user)return;
    const {id}=request.params as {id:string};
    const result=await withTransaction(async client=>{
      const p=await client.query(`select id,user_id,status,updated_at from hermes_profiles where id=$1 for update`,[id]);
      if(!p.rowCount)return {kind:'missing' as const};
      const profile=p.rows[0];
      if(user.role!=='ADMIN'&&profile.user_id!==user.sub)return {kind:'forbidden' as const};
      if(action==='start'&&user.role==='SANTRI'){
        const student=await client.query(`select status from students where user_id=$1`,[user.sub]);
        if(!student.rowCount||student.rows[0].status!=='ACTIVE')return {kind:'inactive' as const};
      }
      const allowed=action==='start'?['READY','STOPPED']:['READY','RUNNING'];
      if(!allowed.includes(profile.status))return {kind:'invalid' as const,status:profile.status};
      const version=new Date(profile.updated_at).getTime();
      await enqueueOutbox(client,`hermes.profile.${action}`,'hermes_profile',id,{profileId:id,userId:profile.user_id},`hermes-${action}:${id}:${version}`);
      await writeAudit(client,user.sub,`hermes.${action}_requested`,'hermes_profile',id,{status:profile.status});
      return {kind:'ok' as const,id,status:`${action.toUpperCase()}_QUEUED`};
    });
    if(result?.kind==='missing')return reply.code(404).send({error:'agent not found'});
    if(result?.kind==='forbidden')return reply.code(403).send({error:'forbidden'});
    if(result?.kind==='inactive')return reply.code(403).send({error:'student must be ACTIVE'});
    if(result?.kind==='invalid')return reply.code(409).send({error:`cannot ${action} agent from ${result.status}`,status:result.status});
    return reply.code(202).send(result);
  }

  app.post('/v1/hermes/agents/:id/start',async(request,reply)=>queueRuntimeAction(request,reply,'start'));
  app.post('/v1/hermes/agents/:id/stop',async(request,reply)=>queueRuntimeAction(request,reply,'stop'));

  app.post('/v1/hermes/agents/:id/archive',async(request,reply)=>{
    const user=await requireAuth(request,reply);if(!user)return;const {id}=request.params as {id:string};
    const result=await withTransaction(async client=>{
      const p=await client.query(`select id,user_id,status from hermes_profiles where id=$1 for update`,[id]);if(!p.rowCount)return {kind:'missing' as const};
      if(user.role!=='ADMIN'&&p.rows[0].user_id!==user.sub)return {kind:'forbidden' as const};
      if(p.rows[0].status==='ARCHIVED')return {kind:'ok' as const,id,status:'ARCHIVED'};
      await enqueueOutbox(client,'hermes.profile.archive','hermes_profile',id,{profileId:id,userId:p.rows[0].user_id},`hermes-profile-archive:${id}`);
      await writeAudit(client,user.sub,'hermes.archive_requested','hermes_profile',id);
      return {kind:'ok' as const,id,status:'ARCHIVE_QUEUED'};
    });
    if(result.kind==='missing')return reply.code(404).send({error:'agent not found'});if(result.kind==='forbidden')return reply.code(403).send({error:'forbidden'});return reply.code(202).send(result);
  });

  app.post('/v1/hermes/slots/grant',async(request,reply)=>{
    const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;
    const parsed=z.object({userId:z.string().uuid(),slots:z.number().int().min(0).max(20)}).safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid grant'});
    const result=await pool.query(`insert into resource_entitlements(user_id,hermes_agent_slots) values($1,$2) on conflict(user_id) do update set hermes_agent_slots=excluded.hermes_agent_slots,updated_at=now() returning hermes_agent_slots`,[parsed.data.userId,parsed.data.slots]);
    return result.rows[0];
  });
}
