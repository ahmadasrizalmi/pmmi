import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { withTransaction, pool } from '../db.js';
import { requireAuth } from '../security/authz.js';
import { enqueueOutbox } from '../events.js';
import { writeAudit } from '../audit.js';

const communicationSchema=z.object({
  title:z.string().min(3).max(200),
  body:z.string().min(10).max(10000),
  channels:z.array(z.enum(['EMAIL','WHATSAPP','TELEGRAM'])).min(1).max(3).default(['EMAIL']),
});

export async function registerLifecycleRoutes(app:FastifyInstance){
  app.get('/v1/students/:id/lifecycle-communications',async(request,reply)=>{
    const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const {id}=request.params as {id:string};
    const rows=await pool.query(`select lc.*,u.full_name approved_by_name from lifecycle_communications lc join users u on u.id=lc.approved_by where lc.student_id=$1 order by lc.created_at desc`,[id]);
    return {items:rows.rows};
  });

  app.post('/v1/students/:id/lifecycle-communications',async(request,reply)=>{
    const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const {id}=request.params as {id:string};
    const parsed=communicationSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid communication',issues:parsed.error.flatten()});
    const result=await withTransaction(async client=>{
      const student=await client.query(`select s.id,s.user_id,s.status,u.email,u.full_name from students s join users u on u.id=s.user_id where s.id=$1 for update of s`,[id]);
      if(!student.rowCount)return {kind:'missing' as const};const s=student.rows[0];
      if(!['DROPOUT','SUSPENDED','INACTIVE'].includes(String(s.status)))return {kind:'not_sensitive' as const,status:s.status};
      const comm=await client.query(`insert into lifecycle_communications(student_id,user_id,lifecycle_status,title,body,channels,approved_by) values($1,$2,$3,$4,$5,$6::text[],$7) returning *`,[id,s.user_id,s.status,parsed.data.title,parsed.data.body,parsed.data.channels,admin.sub]);
      await enqueueOutbox(client,'student.lifecycle_communication_approved','lifecycle_communication',comm.rows[0].id,{communicationId:comm.rows[0].id,studentId:id,userId:s.user_id,status:s.status,email:s.email,title:parsed.data.title,body:parsed.data.body,channels:parsed.data.channels},`lifecycle-communication:${comm.rows[0].id}`);
      await writeAudit(client,admin.sub,'student.lifecycle_communication_approved','student',id,{communicationId:comm.rows[0].id,status:s.status,channels:parsed.data.channels});
      return {kind:'ok' as const,communication:comm.rows[0]};
    });
    if(result.kind==='missing')return reply.code(404).send({error:'student not found'});
    if(result.kind==='not_sensitive')return reply.code(409).send({error:`formal review flow is only required for sensitive states; current status ${result.status}`});
    return reply.code(201).send(result.communication);
  });
}
