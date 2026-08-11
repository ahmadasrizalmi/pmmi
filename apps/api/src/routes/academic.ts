import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool, withTransaction } from '../db.js';
import { requireAuth, type SessionUser } from '../security/authz.js';
import { createPresignedUpload, minio } from '../storage.js';
import { config } from '../config.js';
import { writeAudit } from '../audit.js';

const courseSchema = z.object({ code: z.string().min(2).max(32), name: z.string().min(2), description: z.string().optional() });
const classSchema = z.object({ courseId: z.string().uuid(), teacherUserId: z.string().uuid().optional(), name: z.string().min(2), startsAt: z.string().datetime().optional(), endsAt: z.string().datetime().optional() });
const assignmentSchema = z.object({ classId: z.string().uuid(), title: z.string().min(2), description: z.string().optional(), dueAt: z.string().datetime().optional(), maxScore: z.number().positive().default(100), allowLate: z.boolean().default(true) });
const uploadSchema = z.object({ originalName: z.string().min(1).max(200), contentType: z.string().max(120).optional() });
const submissionSchema = z.object({ uploadIds: z.array(z.string().uuid()).min(1).max(10), notes: z.string().max(5000).optional() });
const gradeSchema = z.object({ score: z.number().min(0), feedback: z.string().max(10000).optional(), revisionRequired: z.boolean().default(false), revisionDueAt: z.string().datetime().optional() });
const featureSchema = z.object({ title: z.string().min(2), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), summary: z.string().max(3000).optional() });
const certificateSchema = z.object({ studentUserId: z.string().uuid(), title: z.string().min(2), certificateNo: z.string().min(3), objectKey: z.string().optional(), metadata: z.record(z.unknown()).default({}) });

async function teacherCanManageClass(session: SessionUser, classId: string) {
  if (session.role === 'ADMIN') return true;
  if (session.role !== 'USTADZ') return false;
  const result = await pool.query(`select 1 from classes where id=$1 and teacher_user_id=$2`, [classId, session.sub]);
  return Boolean(result.rowCount);
}

async function studentIsEnrolled(userId: string, classId: string) {
  const result = await pool.query(`select 1 from enrollments where class_id=$1 and student_user_id=$2 and status='active'`, [classId,userId]);
  return Boolean(result.rowCount);
}

export async function registerAcademicRoutes(app: FastifyInstance) {
  app.post('/v1/academic/courses', async (request, reply) => {
    const session = await requireAuth(request, reply, ['ADMIN']); if (!session) return;
    const parsed = courseSchema.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ error:'invalid payload', issues:parsed.error.flatten() });
    const d=parsed.data;
    const result=await pool.query(`insert into courses(code,name,description) values (upper($1),$2,$3) returning *`,[d.code,d.name,d.description??null]);
    return reply.code(201).send(result.rows[0]);
  });

  app.post('/v1/academic/classes', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const parsed=classSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid payload',issues:parsed.error.flatten()});
    const d=parsed.data;
    const result=await pool.query(`insert into classes(course_id,teacher_user_id,name,starts_at,ends_at) values($1,$2,$3,$4,$5) returning *`,[d.courseId,d.teacherUserId??null,d.name,d.startsAt??null,d.endsAt??null]);
    return reply.code(201).send(result.rows[0]);
  });

  app.post('/v1/academic/classes/:classId/enroll', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const {classId}=request.params as {classId:string};
    const parsed=z.object({studentUserId:z.string().uuid()}).safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'studentUserId required'});
    const result=await pool.query(`insert into enrollments(class_id,student_user_id,status) values($1,$2,'active') on conflict(class_id,student_user_id) do update set status='active' returning *`,[classId,parsed.data.studentUserId]);
    return reply.code(201).send(result.rows[0]);
  });

  app.get('/v1/academic/classes', async (request, reply) => {
    const session=await requireAuth(request,reply); if(!session)return;
    let query=`select c.*, co.code course_code, co.name course_name from classes c join courses co on co.id=c.course_id`;
    const params:string[]=[];
    if(session.role==='USTADZ'){query+=' where c.teacher_user_id=$1';params.push(session.sub);}
    if(session.role==='SANTRI'){query+=' join enrollments e on e.class_id=c.id where e.student_user_id=$1 and e.status=\'active\'';params.push(session.sub);}
    query+=' order by c.created_at desc';
    const result=await pool.query(query,params); return {items:result.rows};
  });

  app.post('/v1/academic/assignments', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN','USTADZ']); if(!session)return;
    const parsed=assignmentSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid payload',issues:parsed.error.flatten()});
    const d=parsed.data;
    if(!(await teacherCanManageClass(session,d.classId)))return reply.code(403).send({error:'cannot manage this class'});
    const result=await pool.query(`insert into assignments(class_id,title,description,due_at,max_score,allow_late,created_by) values($1,$2,$3,$4,$5,$6,$7) returning *`,[d.classId,d.title,d.description??null,d.dueAt??null,d.maxScore,d.allowLate,session.sub]);
    return reply.code(201).send(result.rows[0]);
  });

  app.get('/v1/academic/classes/:classId/assignments', async (request, reply) => {
    const session=await requireAuth(request,reply); if(!session)return;
    const {classId}=request.params as {classId:string};
    if(session.role==='SANTRI' && !(await studentIsEnrolled(session.sub,classId)))return reply.code(403).send({error:'not enrolled'});
    if(session.role==='USTADZ' && !(await teacherCanManageClass(session,classId)))return reply.code(403).send({error:'cannot access class'});
    const result=await pool.query(`select * from assignments where class_id=$1 order by due_at nulls last, created_at desc`,[classId]); return {items:result.rows};
  });

  app.post('/v1/academic/assignments/:assignmentId/uploads', async (request, reply) => {
    const session=await requireAuth(request,reply,['SANTRI']); if(!session)return;
    const {assignmentId}=request.params as {assignmentId:string};
    const parsed=uploadSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid payload'});
    const assignment=await pool.query(`select a.id,a.class_id,a.due_at,a.allow_late from assignments a where a.id=$1`,[assignmentId]);
    if(!assignment.rowCount)return reply.code(404).send({error:'assignment not found'});
    if(!(await studentIsEnrolled(session.sub,assignment.rows[0].class_id)))return reply.code(403).send({error:'not enrolled'});
    if(!assignment.rows[0].allow_late && assignment.rows[0].due_at && new Date(assignment.rows[0].due_at)<new Date())return reply.code(409).send({error:'assignment closed'});
    const uploadId=randomUUID();
    const safeName=parsed.data.originalName.replace(/[^a-zA-Z0-9._-]/g,'_');
    const objectKey=`submissions/${session.sub}/${assignmentId}/${uploadId}-${safeName}`;
    const url=await createPresignedUpload(objectKey,900);
    await pool.query(`insert into submission_upload_intents(id,assignment_id,student_user_id,bucket,object_key,original_name,content_type,expires_at) values($1,$2,$3,$4,$5,$6,$7,now()+interval '15 minutes')`,[uploadId,assignmentId,session.sub,config.MINIO_BUCKET,objectKey,parsed.data.originalName,parsed.data.contentType??null]);
    return reply.code(201).send({uploadId,url,objectKey,expiresIn:900});
  });

  app.post('/v1/academic/assignments/:assignmentId/submissions', async (request, reply) => {
    const session=await requireAuth(request,reply,['SANTRI']); if(!session)return;
    const {assignmentId}=request.params as {assignmentId:string};
    const parsed=submissionSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid payload',issues:parsed.error.flatten()});
    const assignment=await pool.query(`select class_id,due_at,allow_late from assignments where id=$1`,[assignmentId]);
    if(!assignment.rowCount)return reply.code(404).send({error:'assignment not found'});
    if(!(await studentIsEnrolled(session.sub,assignment.rows[0].class_id)))return reply.code(403).send({error:'not enrolled'});

    const intents=await pool.query(`select * from submission_upload_intents where id=any($1::uuid[]) and assignment_id=$2 and student_user_id=$3 and consumed_at is null and expires_at>now()`,[parsed.data.uploadIds,assignmentId,session.sub]);
    if(intents.rowCount!==parsed.data.uploadIds.length)return reply.code(400).send({error:'one or more upload intents invalid or expired'});
    const stats=new Map<string,{size:number;etag?:string}>();
    for(const intent of intents.rows){
      try{const stat=await minio.statObject(intent.bucket,intent.object_key); stats.set(intent.id,{size:stat.size,etag:stat.etag});}
      catch{return reply.code(400).send({error:`uploaded object missing for ${intent.original_name}`});}
    }

    const result=await withTransaction(async client=>{
      const existing=await client.query(`select id,status from submissions where assignment_id=$1 and student_user_id=$2 for update`,[assignmentId,session.sub]);
      let submissionId:string;
      if(existing.rowCount){submissionId=existing.rows[0].id; await client.query(`update submissions set status=case when status='revision_requested' then 'resubmitted' else 'submitted' end,notes=$1,submitted_at=now(),updated_at=now() where id=$2`,[parsed.data.notes??null,submissionId]); await client.query(`delete from submission_files where submission_id=$1`,[submissionId]);}
      else{const created=await client.query(`insert into submissions(assignment_id,student_user_id,status,notes,submitted_at) values($1,$2,'submitted',$3,now()) returning id`,[assignmentId,session.sub,parsed.data.notes??null]);submissionId=created.rows[0].id;}
      for(const intent of intents.rows){const stat=stats.get(intent.id)!;await client.query(`insert into submission_files(submission_id,bucket,object_key,original_name,content_type,size_bytes) values($1,$2,$3,$4,$5,$6)`,[submissionId,intent.bucket,intent.object_key,intent.original_name,intent.content_type,stat.size]);}
      await client.query(`update submission_upload_intents set consumed_at=now() where id=any($1::uuid[])`,[parsed.data.uploadIds]);
      await writeAudit(client,session.sub,'submission.submitted','submission',submissionId,{assignmentId});
      return {id:submissionId,status:existing.rowCount?'resubmitted':'submitted'};
    });
    return reply.code(201).send(result);
  });

  app.post('/v1/academic/submissions/:submissionId/grade', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN','USTADZ']); if(!session)return;
    const {submissionId}=request.params as {submissionId:string};
    const parsed=gradeSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid payload',issues:parsed.error.flatten()});
    const submission=await pool.query(`select s.id,a.class_id,a.max_score from submissions s join assignments a on a.id=s.assignment_id where s.id=$1`,[submissionId]);
    if(!submission.rowCount)return reply.code(404).send({error:'submission not found'});
    if(!(await teacherCanManageClass(session,submission.rows[0].class_id)))return reply.code(403).send({error:'cannot grade this submission'});
    if(parsed.data.score>Number(submission.rows[0].max_score))return reply.code(400).send({error:'score exceeds max score'});
    const d=parsed.data;
    const result=await withTransaction(async client=>{
      const grade=await client.query(`insert into grades(submission_id,score,feedback,revision_required,revision_due_at,graded_by,graded_at) values($1,$2,$3,$4,$5,$6,now()) on conflict(submission_id) do update set score=excluded.score,feedback=excluded.feedback,revision_required=excluded.revision_required,revision_due_at=excluded.revision_due_at,graded_by=excluded.graded_by,graded_at=now(),updated_at=now() returning *`,[submissionId,d.score,d.feedback??null,d.revisionRequired,d.revisionDueAt??null,session.sub]);
      await client.query(`update submissions set status=$1,updated_at=now() where id=$2`,[d.revisionRequired?'revision_requested':'graded',submissionId]);
      await writeAudit(client,session.sub,d.revisionRequired?'submission.revision_requested':'submission.graded','submission',submissionId,{score:d.score}); return grade.rows[0];
    });
    return result;
  });

  app.post('/v1/academic/submissions/:submissionId/feature', async (request, reply) => {
    const session=await requireAuth(request,reply,['ADMIN','USTADZ']); if(!session)return;
    const {submissionId}=request.params as {submissionId:string};
    const parsed=featureSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid payload',issues:parsed.error.flatten()});
    const submission=await pool.query(`select s.student_user_id,a.class_id from submissions s join assignments a on a.id=s.assignment_id where s.id=$1`,[submissionId]);
    if(!submission.rowCount)return reply.code(404).send({error:'submission not found'});
    if(!(await teacherCanManageClass(session,submission.rows[0].class_id)))return reply.code(403).send({error:'cannot feature this submission'});
    const d=parsed.data;
    const result=await pool.query(`insert into portfolio_projects(student_user_id,submission_id,title,slug,summary,featured,published_at,featured_by) values($1,$2,$3,$4,$5,true,now(),$6) returning *`,[submission.rows[0].student_user_id,submissionId,d.title,d.slug,d.summary??null,session.sub]);
    return reply.code(201).send({...result.rows[0],requiresStudentApproval:false});
  });

  app.get('/v1/portfolio', async ()=>{
    const result=await pool.query(`select p.id,p.title,p.slug,p.summary,p.published_at,u.full_name student_name from portfolio_projects p join users u on u.id=p.student_user_id where p.featured=true and p.published_at is not null order by p.published_at desc`); return {items:result.rows};
  });

  app.post('/v1/academic/certificates', async (request, reply)=>{
    const session=await requireAuth(request,reply,['ADMIN']); if(!session)return;
    const parsed=certificateSchema.safeParse(request.body); if(!parsed.success)return reply.code(400).send({error:'invalid payload',issues:parsed.error.flatten()});
    const d=parsed.data; const result=await pool.query(`insert into certificates(student_user_id,title,certificate_no,bucket,object_key,metadata) values($1,$2,$3,$4,$5,$6::jsonb) returning *`,[d.studentUserId,d.title,d.certificateNo,d.objectKey?config.MINIO_BUCKET:null,d.objectKey??null,JSON.stringify(d.metadata)]); return reply.code(201).send(result.rows[0]);
  });

  app.get('/v1/academic/my/grades', async (request,reply)=>{
    const session=await requireAuth(request,reply,['SANTRI']); if(!session)return;
    const result=await pool.query(`select a.title assignment_title,g.score,g.feedback,g.revision_required,g.revision_due_at,g.graded_at from submissions s join assignments a on a.id=s.assignment_id left join grades g on g.submission_id=s.id where s.student_user_id=$1 order by s.updated_at desc`,[session.sub]); return {items:result.rows};
  });
}
