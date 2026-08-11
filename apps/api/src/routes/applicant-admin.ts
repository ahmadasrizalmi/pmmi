import { createHash, randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { pool, withTransaction } from '../db.js';
import { requireAuth } from '../security/authz.js';
import { writeAudit } from '../audit.js';

const hashToken=(value:string)=>createHash('sha256').update(value).digest('hex');

export async function registerApplicantAdminRoutes(app:FastifyInstance){
  app.post('/v1/admin/admissions/applications/:id/access-token',async(request,reply)=>{
    const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const {id}=request.params as {id:string};
    const exists=await pool.query(`select id,status from applications where id=$1`,[id]);if(!exists.rowCount)return reply.code(404).send({error:'application not found'});
    if(exists.rows[0].status==='ENROLLED')return reply.code(409).send({error:'applicant access is no longer reissued after enrollment'});
    const token=randomBytes(32).toString('hex');
    await withTransaction(async client=>{await client.query(`update application_access_tokens set revoked_at=now() where application_id=$1 and revoked_at is null`,[id]);await client.query(`insert into application_access_tokens(application_id,token_hash,expires_at) values($1,$2,now()+interval '120 days')`,[id,hashToken(token)]);await writeAudit(client,admin.sub,'admission.access_token_reissued','application',id);});
    return {applicationId:id,applicantToken:token,expiresInDays:120};
  });
}
