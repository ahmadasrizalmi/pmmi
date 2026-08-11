import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool, withTransaction } from '../db.js';
import { requireAuth, type SessionUser } from '../security/authz.js';
import { enqueueOutbox } from '../events.js';

const sessionSchema=z.object({classId:z.string().uuid(),title:z.string().max(200).optional(),startsAt:z.string().datetime(),endsAt:z.string().datetime(),location:z.string().max(300).optional(),meetingUrl:z.string().url().optional()}).refine(d=>new Date(d.endsAt)>new Date(d.startsAt),'endsAt must be after startsAt');
const attendanceSchema=z.object({records:z.array(z.object({studentUserId:z.string().uuid(),status:z.enum(['PRESENT','LATE','EXCUSED','ABSENT']),notes:z.string().max(1000).optional()})).min(1).max(200)});

async function teacherCanManage(session:SessionUser,classId:string){
  if(session.role==='ADMIN')return true;
  if(session.role!=='USTADZ')return false;
  const r=await pool.query(`select 1 from classes where id=$1 and teacher_user_id=$2`,[classId,session.sub]);return Boolean(r.rowCount);
}

export async function registerAcademicExtraRoutes(app:FastifyInstance){
  app.post('/v1/academic/sessions',async(request,reply)=>{
    const user=await requireAuth(request,reply,['ADMIN','USTADZ']);if(!user)return;
    const parsed=sessionSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid session',issues:parsed.error.flatten()});const d=parsed.data;
    if(!(await teacherCanManage(user,d.classId)))return reply.code(403).send({error:'cannot manage class'});
    const result=await pool.query(`insert into class_sessions(class_id,title,starts_at,ends_at,location,meeting_url,created_by) values($1,$2,$3,$4,$5,$6,$7) returning *`,[d.classId,d.title??null,d.startsAt,d.endsAt,d.location??null,d.meetingUrl??null,user.sub]);
    return reply.code(201).send(result.rows[0]);
  });

  app.get('/v1/academic/schedule',async(request,reply)=>{
    const user=await requireAuth(request,reply);if(!user)return;
    let sql=`select s.*,c.name class_name,co.name course_name from class_sessions s join classes c on c.id=s.class_id join courses co on co.id=c.course_id`;
    const params:any[]=[];
    if(user.role==='USTADZ'){sql+=` where c.teacher_user_id=$1`;params.push(user.sub);}
    else if(user.role==='SANTRI'){sql+=` join enrollments e on e.class_id=c.id where e.student_user_id=$1 and e.status='active'`;params.push(user.sub);}
    sql+=` order by s.starts_at asc`;
    return {items:(await pool.query(sql,params)).rows};
  });

  app.put('/v1/academic/sessions/:sessionId/attendance',async(request,reply)=>{
    const user=await requireAuth(request,reply,['ADMIN','USTADZ']);if(!user)return;
    const {sessionId}=request.params as {sessionId:string};
    const session=await pool.query(`select class_id from class_sessions where id=$1`,[sessionId]);if(!session.rowCount)return reply.code(404).send({error:'session not found'});
    if(!(await teacherCanManage(user,session.rows[0].class_id)))return reply.code(403).send({error:'cannot manage class'});
    const parsed=attendanceSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid attendance',issues:parsed.error.flatten()});
    await withTransaction(async client=>{
      for(const r of parsed.data.records){
        const enrolled=await client.query(`select 1 from enrollments where class_id=$1 and student_user_id=$2 and status='active'`,[session.rows[0].class_id,r.studentUserId]);
        if(!enrolled.rowCount)throw new Error(`student ${r.studentUserId} is not enrolled`);
        await client.query(`insert into attendance_records(session_id,student_user_id,status,notes,marked_by) values($1,$2,$3,$4,$5) on conflict(session_id,student_user_id) do update set status=excluded.status,notes=excluded.notes,marked_by=excluded.marked_by,marked_at=now()`,[sessionId,r.studentUserId,r.status,r.notes??null,user.sub]);
      }
      await enqueueOutbox(client,'attendance.updated','class_session',sessionId,{sessionId,classId:session.rows[0].class_id},`attendance:${sessionId}:${Date.now()}`);
    });
    return {updated:parsed.data.records.length};
  });

  app.get('/v1/academic/sessions/:sessionId/attendance',async(request,reply)=>{
    const user=await requireAuth(request,reply);if(!user)return;
    const {sessionId}=request.params as {sessionId:string};
    const s=await pool.query(`select class_id from class_sessions where id=$1`,[sessionId]);if(!s.rowCount)return reply.code(404).send({error:'session not found'});
    if(user.role==='USTADZ' && !(await teacherCanManage(user,s.rows[0].class_id)))return reply.code(403).send({error:'forbidden'});
    if(user.role==='SANTRI'){
      const r=await pool.query(`select a.*,u.full_name from attendance_records a join users u on u.id=a.student_user_id where a.session_id=$1 and a.student_user_id=$2`,[sessionId,user.sub]);return {items:r.rows};
    }
    const r=await pool.query(`select a.*,u.full_name from attendance_records a join users u on u.id=a.student_user_id where a.session_id=$1 order by u.full_name`,[sessionId]);return {items:r.rows};
  });

  app.get('/v1/academic/submissions/pending',async(request,reply)=>{
    const user=await requireAuth(request,reply,['ADMIN','USTADZ']);if(!user)return;
    const params:any[]=[];let teacherFilter='';if(user.role==='USTADZ'){teacherFilter=' and c.teacher_user_id=$1';params.push(user.sub);}
    const result=await pool.query(`select s.*,a.title assignment_title,a.due_at,c.name class_name,u.full_name student_name from submissions s join assignments a on a.id=s.assignment_id join classes c on c.id=a.class_id join users u on u.id=s.student_user_id left join grades g on g.submission_id=s.id where (g.id is null or s.status in ('submitted','resubmitted'))${teacherFilter} order by s.submitted_at asc`,params);
    return {items:result.rows};
  });

  app.get('/v1/academic/my/certificates',async(request,reply)=>{
    const user=await requireAuth(request,reply,['SANTRI']);if(!user)return;
    const result=await pool.query(`select id,title,certificate_no,bucket,object_key,issued_at,metadata from certificates where student_user_id=$1 order by issued_at desc`,[user.sub]);return {items:result.rows};
  });

  app.get('/v1/portfolio/:slug',async(request,reply)=>{
    const {slug}=request.params as {slug:string};
    const result=await pool.query(`select p.*,u.full_name student_name from portfolio_projects p join users u on u.id=p.student_user_id where p.slug=$1 and p.featured=true and p.published_at is not null`,[slug]);if(!result.rowCount)return reply.code(404).send({error:'portfolio not found'});return result.rows[0];
  });
}
