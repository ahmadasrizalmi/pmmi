import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool, withTransaction } from '../db.js';
import { requireAuth } from '../security/authz.js';
import { writeAudit } from '../audit.js';
import { createActivationToken } from './auth.js';
import { config } from '../config.js';
import { createPresignedUpload, minio } from '../storage.js';
import { enqueueOutbox } from '../events.js';

const periodSchema = z.object({
  name: z.string().min(3), cohortYear: z.number().int().min(2020).max(2100),
  opensAt: z.string().datetime().optional(), closesAt: z.string().datetime().optional(),
  capacity: z.number().int().positive().optional(), isActive: z.boolean().default(false),
});
const applicationSchema = z.object({
  admissionPeriodId: z.string().uuid(), applicantName: z.string().min(2),
  email: z.string().email(), phone: z.string().min(8).optional(),
});
const statusSchema = z.object({ status: z.enum(['ADMIN_VERIFIED','SCREENING','INTERVIEW','ACCEPTED','WAITLISTED','REJECTED','ENROLLED']) });
const studentStatusSchema = z.object({ status: z.enum(['ACTIVE','GRADUATED','ALUMNI','DROPOUT','SUSPENDED','INACTIVE']) });
const documentIntentSchema = z.object({ kind: z.string().min(2).max(80), originalName: z.string().min(1).max(200), contentType: z.string().max(120).optional() });
const reviewSchema = z.object({ status: z.enum(['PENDING','APPROVED','NEEDS_FIX','REJECTED']), notes: z.string().max(5000).optional() });
const scoreSchema = z.object({ category: z.string().min(2).max(80), score: z.number().min(0), maxScore: z.number().positive(), notes: z.string().max(3000).optional() }).refine(v => v.score <= v.maxScore, 'score exceeds maxScore');
const interviewSchema = z.object({ scheduledAt: z.string().datetime(), location: z.string().max(300).optional(), meetingUrl: z.string().url().optional(), interviewerUserId: z.string().uuid().optional(), notes: z.string().max(3000).optional() });
const decisionSchema = z.object({ decision: z.enum(['ACCEPTED','WAITLISTED','REJECTED']), reason: z.string().max(5000).optional() });
const registrationSchema = z.object({ programId: z.string().uuid().optional(), cohortId: z.string().uuid().optional(), metadata: z.record(z.unknown()).default({}) });

const allowed: Record<string, string[]> = {
  SUBMITTED: ['ADMIN_VERIFIED','REJECTED'], ADMIN_VERIFIED: ['SCREENING','INTERVIEW','REJECTED'],
  SCREENING: ['INTERVIEW','ACCEPTED','WAITLISTED','REJECTED'], INTERVIEW: ['ACCEPTED','WAITLISTED','REJECTED'],
  WAITLISTED: ['ACCEPTED','REJECTED'], ACCEPTED: ['ENROLLED'],
};
const hashToken = (value: string) => createHash('sha256').update(value).digest('hex');

async function verifyApplicantAccess(applicationId: string, token?: string) {
  if (!token) return false;
  const result = await pool.query(
    `select 1 from application_access_tokens where application_id=$1 and token_hash=$2 and revoked_at is null and expires_at>now() limit 1`,
    [applicationId, hashToken(token)],
  );
  return Boolean(result.rowCount);
}

async function enrollApplication(client: import('pg').PoolClient, id: string, actorUserId: string) {
  const currentResult = await client.query(
    `select a.*,p.cohort_year,r.program_id,r.cohort_id
     from applications a join admission_periods p on p.id=a.admission_period_id
     left join registrations r on r.application_id=a.id where a.id=$1 for update of a`, [id],
  );
  if (!currentResult.rowCount) return { kind:'notfound' as const };
  const current = currentResult.rows[0];
  if (current.status !== 'ACCEPTED') return { kind:'invalid' as const, current:current.status };

  const existingUser = await client.query(`select id from users where email=lower($1)`, [current.email]);
  let userId = existingUser.rows[0]?.id as string | undefined;
  if (!userId) {
    const user = await client.query(
      `insert into users(email,full_name,role,is_active) values(lower($1),$2,'SANTRI',false) returning id`,
      [current.email,current.applicant_name],
    );
    userId = user.rows[0].id;
  }
  const studentNumber = `PMMI-${current.cohort_year}-${String(current.id).slice(0,8).toUpperCase()}`;
  await client.query(
    `insert into students(user_id,application_id,student_number,cohort_year,status,program_id,cohort_id)
     values($1,$2,$3,$4,'ACTIVE',$5,$6)
     on conflict(application_id) do update set program_id=coalesce(excluded.program_id,students.program_id),cohort_id=coalesce(excluded.cohort_id,students.cohort_id)`,
    [userId,id,studentNumber,current.cohort_year,current.program_id??null,current.cohort_id??null],
  );
  await client.query(
    `insert into resource_entitlements(user_id,ai_credit_balance,hermes_agent_slots,storage_quota_bytes)
     values($1,$2,$3,$4)
     on conflict(user_id) do update set hermes_agent_slots=greatest(resource_entitlements.hermes_agent_slots,excluded.hermes_agent_slots),storage_quota_bytes=greatest(resource_entitlements.storage_quota_bytes,excluded.storage_quota_bytes),updated_at=now()`,
    [userId,config.INITIAL_AI_CREDITS,config.INITIAL_HERMES_SLOTS,config.INITIAL_STORAGE_QUOTA_BYTES],
  );
  const wallet = await client.query(
    `insert into ai_credit_wallets(user_id,balance) values($1,$2)
     on conflict(user_id) do update set balance=greatest(ai_credit_wallets.balance,excluded.balance),updated_at=now() returning balance`,
    [userId,config.INITIAL_AI_CREDITS],
  );
  await client.query(
    `insert into ai_credit_ledger(user_id,delta,balance_after,reason,reference_type,reference_id,idempotency_key,actor_user_id)
     values($1,$2,$3,'enrollment.initial_credit','application',$4,$5,$6) on conflict(idempotency_key) do nothing`,
    [userId,config.INITIAL_AI_CREDITS,wallet.rows[0].balance,id,`enrollment:${id}:credits`,actorUserId],
  );
  await client.query(`update applications set status='ENROLLED',updated_at=now() where id=$1`, [id]);
  await client.query(`update registrations set status='COMPLETE',completed_at=coalesce(completed_at,now()),updated_at=now() where application_id=$1`, [id]);
  const activationToken = await createActivationToken(client,userId!);
  await writeAudit(client,actorUserId,'admission.enrolled','application',id,{userId,studentNumber});
  await enqueueOutbox(client,'onboarding.enrolled','application',id,{applicationId:id,userId,email:current.email,studentNumber},`onboarding:${id}`);
  return { kind:'enrolled' as const,status:'ENROLLED',userId,studentNumber,activationToken };
}

export async function registerAdmissionRoutes(app: FastifyInstance) {
  app.get('/v1/admissions/periods', async () => {
    const result = await pool.query(`select * from admission_periods where is_active=true and (closes_at is null or closes_at>now()) order by cohort_year desc`);
    return { items:result.rows };
  });

  app.post('/v1/admissions/periods', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const parsed=periodSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid payload',issues:parsed.error.flatten()});
    const d=parsed.data;
    const result=await pool.query(`insert into admission_periods(name,cohort_year,opens_at,closes_at,capacity,is_active) values($1,$2,$3,$4,$5,$6) returning *`,[d.name,d.cohortYear,d.opensAt??null,d.closesAt??null,d.capacity??null,d.isActive]);
    return reply.code(201).send(result.rows[0]);
  });

  app.post('/v1/admissions/applications', async (request, reply) => {
    const parsed=applicationSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid payload',issues:parsed.error.flatten()});
    const d=parsed.data;
    const period=await pool.query(`select id,capacity from admission_periods where id=$1 and is_active=true and (opens_at is null or opens_at<=now()) and (closes_at is null or closes_at>now())`,[d.admissionPeriodId]);
    if(!period.rowCount)return reply.code(400).send({error:'admission period is not open'});
    const applicantToken=randomBytes(32).toString('hex');
    try {
      const created=await withTransaction(async client=>{
        const result=await client.query(`insert into applications(admission_period_id,applicant_name,email,phone,status,submitted_at) values($1,$2,lower($3),$4,'SUBMITTED',now()) returning *`,[d.admissionPeriodId,d.applicantName,d.email,d.phone??null]);
        await client.query(`insert into application_access_tokens(application_id,token_hash,expires_at) values($1,$2,now()+interval '120 days')`,[result.rows[0].id,hashToken(applicantToken)]);
        await enqueueOutbox(client,'admission.submitted','application',result.rows[0].id,{applicationId:result.rows[0].id,email:d.email,phone:d.phone??null,applicantName:d.applicantName},`admission-submitted:${result.rows[0].id}`);
        return result.rows[0];
      });
      return reply.code(201).send({...created,applicantToken});
    } catch(error:any) {
      if(error?.code==='23505')return reply.code(409).send({error:'application already exists for this period'});
      throw error;
    }
  });

  app.get('/v1/admissions/applications', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const result=await pool.query(`select a.*,p.name period_name,p.cohort_year,(select count(*) from application_documents d where d.application_id=a.id) document_count from applications a join admission_periods p on p.id=a.admission_period_id order by a.created_at desc`);
    return {items:result.rows};
  });

  app.get('/v1/admissions/applications/:id', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const {id}=request.params as {id:string};
    const application=await pool.query(`select a.*,p.name period_name,p.cohort_year from applications a join admission_periods p on p.id=a.admission_period_id where a.id=$1`,[id]);
    if(!application.rowCount)return reply.code(404).send({error:'application not found'});
    const [documents,reviews,scores,interviews,decision,registration]=await Promise.all([
      pool.query(`select * from application_documents where application_id=$1 order by created_at`,[id]),
      pool.query(`select r.*,u.full_name reviewer_name from application_reviews r join users u on u.id=r.reviewer_user_id where r.application_id=$1 order by r.created_at`,[id]),
      pool.query(`select * from selection_scores where application_id=$1 order by category`,[id]),
      pool.query(`select * from interviews where application_id=$1 order by scheduled_at`,[id]),
      pool.query(`select * from admission_decisions where application_id=$1`,[id]),
      pool.query(`select * from registrations where application_id=$1`,[id]),
    ]);
    return {...application.rows[0],documents:documents.rows,reviews:reviews.rows,scores:scores.rows,interviews:interviews.rows,decision:decision.rows[0]??null,registration:registration.rows[0]??null};
  });

  app.post('/v1/admissions/applications/:id/documents/upload', async (request, reply) => {
    const {id}=request.params as {id:string};
    const token=request.headers['x-applicant-token'];
    if(typeof token!=='string' || !(await verifyApplicantAccess(id,token)))return reply.code(401).send({error:'invalid applicant token'});
    const parsed=documentIntentSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid payload'});
    const uploadId=randomUUID(); const safeName=parsed.data.originalName.replace(/[^a-zA-Z0-9._-]/g,'_');
    const objectKey=`admissions/${id}/${parsed.data.kind}/${uploadId}-${safeName}`;
    const url=await createPresignedUpload(objectKey,900);
    await pool.query(`insert into application_document_upload_intents(id,application_id,kind,bucket,object_key,original_name,content_type,expires_at) values($1,$2,$3,$4,$5,$6,$7,now()+interval '15 minutes')`,[uploadId,id,parsed.data.kind,config.MINIO_BUCKET,objectKey,parsed.data.originalName,parsed.data.contentType??null]);
    return reply.code(201).send({uploadId,url,expiresIn:900});
  });

  app.post('/v1/admissions/applications/:id/documents/complete', async (request, reply) => {
    const {id}=request.params as {id:string};
    const token=request.headers['x-applicant-token'];
    if(typeof token!=='string' || !(await verifyApplicantAccess(id,token)))return reply.code(401).send({error:'invalid applicant token'});
    const parsed=z.object({uploadId:z.string().uuid()}).safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'uploadId required'});
    const intent=await pool.query(`select * from application_document_upload_intents where id=$1 and application_id=$2 and consumed_at is null and expires_at>now()`,[parsed.data.uploadId,id]);
    if(!intent.rowCount)return reply.code(400).send({error:'upload intent invalid or expired'});
    const i=intent.rows[0]; let stat:any;
    try{stat=await minio.statObject(i.bucket,i.object_key);}catch{return reply.code(400).send({error:'uploaded object not found'});}
    const doc=await withTransaction(async client=>{
      const result=await client.query(`insert into application_documents(application_id,kind,bucket,object_key,original_name,content_type,size_bytes) values($1,$2,$3,$4,$5,$6,$7) returning *`,[id,i.kind,i.bucket,i.object_key,i.original_name,i.content_type,stat.size]);
      await client.query(`update application_document_upload_intents set consumed_at=now() where id=$1`,[i.id]);
      await enqueueOutbox(client,'admission.document_uploaded','application',id,{applicationId:id,documentId:result.rows[0].id,kind:i.kind},`admission-document:${result.rows[0].id}`);
      return result.rows[0];
    });
    return reply.code(201).send(doc);
  });

  app.post('/v1/admissions/applications/:id/reviews', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const {id}=request.params as {id:string}; const parsed=reviewSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid review'});
    const result=await pool.query(`insert into application_reviews(application_id,reviewer_user_id,status,notes) values($1,$2,$3,$4) on conflict(application_id,reviewer_user_id) do update set status=excluded.status,notes=excluded.notes,updated_at=now() returning *`,[id,session.sub,parsed.data.status,parsed.data.notes??null]);
    return reply.code(201).send(result.rows[0]);
  });

  app.post('/v1/admissions/applications/:id/scores', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const {id}=request.params as {id:string}; const parsed=scoreSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid score',issues:parsed.error.flatten()}); const d=parsed.data;
    const result=await pool.query(`insert into selection_scores(application_id,category,score,max_score,notes,scored_by) values($1,$2,$3,$4,$5,$6) on conflict(application_id,category) do update set score=excluded.score,max_score=excluded.max_score,notes=excluded.notes,scored_by=excluded.scored_by,created_at=now() returning *`,[id,d.category,d.score,d.maxScore,d.notes??null,session.sub]);
    return reply.code(201).send(result.rows[0]);
  });

  app.post('/v1/admissions/applications/:id/interviews', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const {id}=request.params as {id:string}; const parsed=interviewSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid interview'}); const d=parsed.data;
    const result=await withTransaction(async client=>{
      const row=await client.query(`insert into interviews(application_id,scheduled_at,location,meeting_url,interviewer_user_id,notes) values($1,$2,$3,$4,$5,$6) returning *`,[id,d.scheduledAt,d.location??null,d.meetingUrl??null,d.interviewerUserId??session.sub,d.notes??null]);
      await client.query(`update applications set status=case when status in ('ADMIN_VERIFIED','SCREENING') then 'INTERVIEW'::application_status else status end,updated_at=now() where id=$1`,[id]);
      await enqueueOutbox(client,'admission.interview_scheduled','application',id,{applicationId:id,interviewId:row.rows[0].id,scheduledAt:d.scheduledAt},`interview:${row.rows[0].id}`);
      return row.rows[0];
    });
    return reply.code(201).send(result);
  });

  app.post('/v1/admissions/applications/:id/decision', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const {id}=request.params as {id:string}; const parsed=decisionSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid decision'}); const d=parsed.data;
    const result=await withTransaction(async client=>{
      const row=await client.query(`insert into admission_decisions(application_id,decision,reason,decided_by) values($1,$2,$3,$4) on conflict(application_id) do update set decision=excluded.decision,reason=excluded.reason,decided_by=excluded.decided_by,decided_at=now() returning *`,[id,d.decision,d.reason??null,session.sub]);
      await client.query(`update applications set status=$1::application_status,decision_at=now(),updated_at=now() where id=$2`,[d.decision,id]);
      await enqueueOutbox(client,'admission.decision','application',id,{applicationId:id,decision:d.decision},`admission-decision:${id}:${d.decision}`);
      return row.rows[0];
    });
    return reply.code(201).send(result);
  });

  app.put('/v1/admissions/applications/:id/registration', async (request, reply) => {
    const {id}=request.params as {id:string}; const token=request.headers['x-applicant-token'];
    if(typeof token!=='string' || !(await verifyApplicantAccess(id,token)))return reply.code(401).send({error:'invalid applicant token'});
    const parsed=registrationSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid registration'}); const d=parsed.data;
    const appState=await pool.query(`select status from applications where id=$1`,[id]); if(appState.rows[0]?.status!=='ACCEPTED')return reply.code(409).send({error:'application must be accepted before registration'});
    const result=await pool.query(`insert into registrations(application_id,program_id,cohort_id,status,metadata) values($1,$2,$3,'PENDING',$4::jsonb) on conflict(application_id) do update set program_id=excluded.program_id,cohort_id=excluded.cohort_id,metadata=excluded.metadata,updated_at=now() returning *`,[id,d.programId??null,d.cohortId??null,JSON.stringify(d.metadata)]);
    return result.rows[0];
  });

  app.patch('/v1/admissions/applications/:id/status', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const {id}=request.params as {id:string}; const parsed=statusSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid status'}); const target=parsed.data.status;
    if(target==='ENROLLED'){
      const enrolled=await withTransaction(client=>enrollApplication(client,id,session.sub));
      if(enrolled.kind==='notfound')return reply.code(404).send({error:'application not found'});
      if(enrolled.kind==='invalid')return reply.code(409).send({error:`invalid transition from ${enrolled.current} to ENROLLED`});
      return enrolled;
    }
    const response=await withTransaction(async client=>{
      const currentResult=await client.query(`select status from applications where id=$1 for update`,[id]); if(!currentResult.rowCount)return {kind:'notfound' as const}; const current=currentResult.rows[0];
      if(!allowed[current.status]?.includes(target))return {kind:'invalid' as const,current:current.status};
      await client.query(`update applications set status=$1::application_status,decision_at=case when $1::text in ('ACCEPTED','WAITLISTED','REJECTED') then now() else decision_at end,updated_at=now() where id=$2`,[target,id]);
      await writeAudit(client,session.sub,`admission.${target.toLowerCase()}`,'application',id);
      return {kind:'ok' as const,status:target};
    });
    if(response.kind==='notfound')return reply.code(404).send({error:'application not found'});
    if(response.kind==='invalid')return reply.code(409).send({error:`invalid transition from ${response.current} to ${target}`});
    return response;
  });

  app.patch('/v1/students/:id/status', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const {id}=request.params as {id:string}; const parsed=studentStatusSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid status'}); const target=parsed.data.status;
    const result=await withTransaction(async client=>{
      const student=await client.query(`select id,user_id,status from students where id=$1 for update`,[id]); if(!student.rowCount)return null; const s=student.rows[0];
      await client.query(`update students set status=$1::student_status,graduated_at=case when $1::text='GRADUATED' then now() else graduated_at end,ended_at=case when $1::text in ('DROPOUT','INACTIVE') then now() else ended_at end where id=$2`,[target,id]);
      const disableLogin=['DROPOUT','INACTIVE'].includes(target); await client.query(`update users set is_active=$1,updated_at=now() where id=$2`,[!disableLogin,s.user_id]);
      if(['GRADUATED','ALUMNI','DROPOUT','INACTIVE'].includes(target)){
        const wallet=await client.query(`select balance from ai_credit_wallets where user_id=$1 for update`,[s.user_id]); const balance=Number(wallet.rows[0]?.balance??0);
        if(balance>0){await client.query(`update ai_credit_wallets set balance=0,updated_at=now() where user_id=$1`,[s.user_id]);await client.query(`insert into ai_credit_ledger(user_id,delta,balance_after,reason,reference_type,reference_id,idempotency_key,actor_user_id) values($1,$2,0,'lifecycle.resource_shutdown','student',$3,$4,$5) on conflict(idempotency_key) do nothing`,[s.user_id,-balance,id,`lifecycle:${id}:${target}:credits`,session.sub]);}
        await client.query(`update resource_entitlements set ai_credit_balance=0,hermes_agent_slots=0,updated_at=now() where user_id=$1`,[s.user_id]);
        await enqueueOutbox(client,'hermes.user.archive','student',id,{studentId:id,userId:s.user_id,status:target},`hermes-archive:${id}:${target}`);
      }
      await writeAudit(client,session.sub,'student.status_changed','student',id,{from:s.status,to:target});
      return {id,status:target};
    });
    if(!result)return reply.code(404).send({error:'student not found'}); return result;
  });
}
