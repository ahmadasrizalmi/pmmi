import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../db.js';
import { minio } from '../storage.js';
import { config } from '../config.js';
import { requireAuth } from '../security/authz.js';

async function nineRouterHealth(){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),3000);
  try{const headers:Record<string,string>={};if(config.NINE_ROUTER_API_KEY)headers.authorization=`Bearer ${config.NINE_ROUTER_API_KEY}`;const r=await fetch(`${config.NINE_ROUTER_URL.replace(/\/$/,'')}/v1/models`,{headers,signal:controller.signal});return {ok:r.ok,status:r.status};}catch(error:any){return {ok:false,error:error?.name??'unreachable'};}finally{clearTimeout(timer);}
}

export async function registerOpsRoutes(app:FastifyInstance){
  app.get('/health/ready',async(_request,reply)=>{
    try{await pool.query('select 1');const bucket=await minio.bucketExists(config.MINIO_BUCKET);if(!bucket)return reply.code(503).send({status:'not_ready',postgres:true,minio:false});return {status:'ready',postgres:true,minio:true};}catch{return reply.code(503).send({status:'not_ready'});}
  });

  app.get('/v1/ops/health',async(request,reply)=>{
    const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;
    let postgres=false,minioOk=false;try{await pool.query('select 1');postgres=true;}catch{}try{minioOk=await minio.bucketExists(config.MINIO_BUCKET);}catch{}
    const nineRouter=await nineRouterHealth();
    const hermes=await pool.query(`select status,count(*)::int count from hermes_profiles group by status`);
    const outbox=await pool.query(`select count(*)::int pending from outbox_events where processed_at is null and available_at<=now()`);
    return {postgres,minio:minioOk,nineRouter,hermes:hermes.rows,outboxPending:outbox.rows[0].pending};
  });

  app.get('/v1/ops/events',async(request,reply)=>{const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;return {items:(await pool.query(`select * from ops_events order by created_at desc limit 200`)).rows};});
  app.patch('/v1/ops/events/:id/resolve',async(request,reply)=>{const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const {id}=request.params as {id:string};const r=await pool.query(`update ops_events set resolved_at=now() where id=$1 returning *`,[id]);if(!r.rowCount)return reply.code(404).send({error:'event not found'});return r.rows[0];});
  app.get('/v1/ops/backups',async(request,reply)=>{const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;return {items:(await pool.query(`select * from backup_runs order by started_at desc limit 100`)).rows};});

  app.post('/v1/ops/events',async(request,reply)=>{
    if(!config.OPS_TOKEN||request.headers['x-ops-token']!==config.OPS_TOKEN)return reply.code(403).send({error:'invalid ops token'});
    const parsed=z.object({kind:z.string().min(1),severity:z.enum(['INFO','WARN','ERROR','CRITICAL']),source:z.string().min(1),message:z.string().min(1),data:z.record(z.unknown()).default({})}).safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid event'});const d=parsed.data;
    const r=await pool.query(`insert into ops_events(kind,severity,source,message,data) values($1,$2,$3,$4,$5::jsonb) returning *`,[d.kind,d.severity,d.source,d.message,JSON.stringify(d.data)]);return reply.code(201).send(r.rows[0]);
  });
}
