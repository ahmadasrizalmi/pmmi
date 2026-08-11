import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool, withTransaction } from '../db.js';
import { requireAuth } from '../security/authz.js';
import { enqueueOutbox } from '../events.js';
import { writeAudit } from '../audit.js';

export async function registerAdminExtraRoutes(app:FastifyInstance){
  app.get('/v1/admin/audit-logs',async(request,reply)=>{
    const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;
    const parsed=z.object({limit:z.coerce.number().int().min(1).max(500).default(100),action:z.string().optional()}).safeParse(request.query);if(!parsed.success)return reply.code(400).send({error:'invalid query'});
    const result=await pool.query(`select a.*,u.full_name actor_name,u.email actor_email from audit_logs a left join users u on u.id=a.actor_user_id where ($1::text is null or a.action=$1) order by a.created_at desc limit $2`,[parsed.data.action??null,parsed.data.limit]);
    return {items:result.rows};
  });

  app.get('/v1/admin/hermes',async(request,reply)=>{
    const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;
    const result=await pool.query(`select p.id,p.user_id,p.profile_name,p.display_name,p.status,p.last_error,p.created_at,p.updated_at,u.full_name,u.email,w.path workspace_path,w.quota_bytes,w.status workspace_status,(select j.status from hermes_build_jobs j where j.profile_id=p.id order by j.created_at desc limit 1) build_status from hermes_profiles p join users u on u.id=p.user_id left join hermes_workspaces w on w.profile_id=p.id order by p.created_at desc`);
    return {items:result.rows};
  });

  app.post('/v1/admin/hermes/:id/retry',async(request,reply)=>{
    const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const {id}=request.params as {id:string};
    const result=await withTransaction(async client=>{
      const p=await client.query(`select p.id,p.user_id,p.profile_name,p.display_name,p.status,w.path from hermes_profiles p join hermes_workspaces w on w.profile_id=p.id where p.id=$1 for update of p`,[id]);if(!p.rowCount)return null;const row=p.rows[0];
      if(!['FAILED','PENDING'].includes(row.status))return {invalid:true,status:row.status};
      const job=await client.query(`insert into hermes_build_jobs(profile_id,status) values($1,'QUEUED') returning id`,[id]);
      await client.query(`update hermes_profiles set status='PENDING',last_error=null,updated_at=now() where id=$1`,[id]);
      await client.query(`update hermes_workspaces set status='PENDING',updated_at=now() where profile_id=$1`,[id]);
      await enqueueOutbox(client,'hermes.profile.build','hermes_profile',id,{profileId:id,userId:row.user_id,profileName:row.profile_name,workspacePath:row.path,jobId:job.rows[0].id},`hermes-build-retry:${job.rows[0].id}`);
      await writeAudit(client,admin.sub,'hermes.build_retried','hermes_profile',id,{jobId:job.rows[0].id});
      return {id,jobId:job.rows[0].id,status:'PENDING'};
    });
    if(!result)return reply.code(404).send({error:'Hermes profile not found'});if('invalid' in result)return reply.code(409).send({error:`cannot retry profile in ${result.status}`});return reply.code(202).send(result);
  });

  app.post('/v1/admin/notification-channels/:id/verify',async(request,reply)=>{
    const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const {id}=request.params as {id:string};
    const result=await pool.query(`update user_notification_channels set verified_at=coalesce(verified_at,now()),enabled=true,updated_at=now() where id=$1 returning id,user_id,channel,address_or_external_id,verified_at,enabled`,[id]);
    if(!result.rowCount)return reply.code(404).send({error:'channel not found'});return result.rows[0];
  });
}
