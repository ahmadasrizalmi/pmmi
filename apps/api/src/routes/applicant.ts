import { createHash } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { pool } from '../db.js';

const hashToken=(value:string)=>createHash('sha256').update(value).digest('hex');

async function authorized(applicationId:string,token:unknown){
  if(typeof token!=='string'||!token)return false;
  const result=await pool.query(`select 1 from application_access_tokens where application_id=$1 and token_hash=$2 and revoked_at is null and expires_at>now() limit 1`,[applicationId,hashToken(token)]);
  return Boolean(result.rowCount);
}

export async function registerApplicantRoutes(app:FastifyInstance){
  app.get('/v1/admissions/applications/:id/self',async(request,reply)=>{
    const {id}=request.params as {id:string};
    if(!(await authorized(id,request.headers['x-applicant-token'])))return reply.code(401).send({error:'invalid applicant token'});
    const application=await pool.query(`select a.id,a.applicant_name,a.email,a.phone,a.status,a.submitted_at,a.decision_at,p.name period_name,p.cohort_year from applications a join admission_periods p on p.id=a.admission_period_id where a.id=$1`,[id]);
    if(!application.rowCount)return reply.code(404).send({error:'application not found'});
    const [documents,decision,registration,programs,cohorts,interviews]=await Promise.all([
      pool.query(`select id,kind,original_name,content_type,size_bytes,verified_at,created_at from application_documents where application_id=$1 order by created_at desc`,[id]),
      pool.query(`select decision,reason,decided_at from admission_decisions where application_id=$1`,[id]),
      pool.query(`select r.id,r.status,r.completed_at,r.metadata,r.program_id,r.cohort_id,p.name program_name,c.name cohort_name from registrations r left join programs p on p.id=r.program_id left join cohorts c on c.id=r.cohort_id where r.application_id=$1`,[id]),
      pool.query(`select id,code,name,description from programs where is_active=true order by name`),
      pool.query(`select id,name,year,starts_at,ends_at from cohorts where is_active=true order by year desc,name`),
      pool.query(`select scheduled_at,location,meeting_url,status from interviews where application_id=$1 order by scheduled_at desc`,[id]),
    ]);
    return {...application.rows[0],documents:documents.rows,decision:decision.rows[0]??null,registration:registration.rows[0]??null,interviews:interviews.rows,programs:programs.rows,cohorts:cohorts.rows};
  });
}
