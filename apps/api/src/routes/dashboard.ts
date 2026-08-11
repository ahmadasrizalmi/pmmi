import type { FastifyInstance } from 'fastify';
import { pool } from '../db.js';
import { requireAuth } from '../security/authz.js';

export async function registerDashboardRoutes(app:FastifyInstance){
  app.get('/v1/dashboard',async(request,reply)=>{
    const user=await requireAuth(request,reply);if(!user)return;
    if(user.role==='ADMIN'){
      const [students,applications,pending,ai,hermes,ops]=await Promise.all([
        pool.query(`select status,count(*)::int count from students group by status order by status`),
        pool.query(`select status,count(*)::int count from applications group by status order by status`),
        pool.query(`select count(*)::int count from submissions s left join grades g on g.submission_id=s.id where g.id is null or s.status in ('submitted','resubmitted')`),
        pool.query(`select coalesce(sum(credits_charged),0)::bigint credits,count(*)::int requests from ai_usage_logs where created_at>=date_trunc('day',now()) and status='SUCCEEDED'`),
        pool.query(`select status,count(*)::int count from hermes_profiles group by status`),
        pool.query(`select count(*)::int count from ops_events where resolved_at is null and severity in ('ERROR','CRITICAL')`),
      ]);
      return {role:user.role,students:students.rows,applications:applications.rows,pendingSubmissions:pending.rows[0].count,aiToday:ai.rows[0],hermes:hermes.rows,openOpsAlerts:ops.rows[0].count};
    }
    if(user.role==='USTADZ'){
      const [classes,pending,sessions]=await Promise.all([
        pool.query(`select c.id,c.name,co.name course_name from classes c join courses co on co.id=c.course_id where c.teacher_user_id=$1 order by c.created_at desc`,[user.sub]),
        pool.query(`select s.id,s.submitted_at,u.full_name student_name,a.title assignment_title,c.name class_name from submissions s join users u on u.id=s.student_user_id join assignments a on a.id=s.assignment_id join classes c on c.id=a.class_id left join grades g on g.submission_id=s.id where c.teacher_user_id=$1 and (g.id is null or s.status in ('submitted','resubmitted')) order by s.submitted_at`,[user.sub]),
        pool.query(`select cs.*,c.name class_name from class_sessions cs join classes c on c.id=cs.class_id where c.teacher_user_id=$1 and cs.starts_at>=now() order by cs.starts_at limit 10`,[user.sub]),
      ]);
      return {role:user.role,classes:classes.rows,pendingSubmissions:pending.rows,upcomingSessions:sessions.rows};
    }
    const [assignments,grades,wallet,agents,certificates,notifications]=await Promise.all([
      pool.query(`select a.id,a.title,a.due_at,a.max_score,c.name class_name,s.status submission_status from assignments a join classes c on c.id=a.class_id join enrollments e on e.class_id=c.id left join submissions s on s.assignment_id=a.id and s.student_user_id=e.student_user_id where e.student_user_id=$1 and e.status='active' order by a.due_at nulls last limit 20`,[user.sub]),
      pool.query(`select g.score,g.feedback,g.revision_required,g.revision_due_at,a.title assignment_title from grades g join submissions s on s.id=g.submission_id join assignments a on a.id=s.assignment_id where s.student_user_id=$1 order by g.graded_at desc limit 10`,[user.sub]),
      pool.query(`select balance from ai_credit_wallets where user_id=$1`,[user.sub]),
      pool.query(`select id,display_name,profile_name,status,last_error from hermes_profiles where user_id=$1 order by created_at desc`,[user.sub]),
      pool.query(`select id,title,certificate_no,issued_at from certificates where student_user_id=$1 order by issued_at desc`,[user.sub]),
      pool.query(`select count(*)::int count from notifications where user_id=$1 and read_at is null`,[user.sub]),
    ]);
    return {role:user.role,assignments:assignments.rows,grades:grades.rows,aiWallet:wallet.rows[0]??{balance:0},agents:agents.rows,certificates:certificates.rows,unreadNotifications:notifications.rows[0].count};
  });
}
