import { workerPool } from './db.js';
import { workerConfig } from './config.js';

async function emit(topic:string,aggregateType:string,aggregateId:string,payload:Record<string,unknown>,dedupe:string){
  await workerPool.query(`insert into outbox_events(topic,aggregate_type,aggregate_id,payload,dedupe_key) values($1,$2,$3,$4::jsonb,$5) on conflict(dedupe_key) do nothing`,[topic,aggregateType,aggregateId,JSON.stringify(payload),dedupe]);
}

export async function runSchedulers(now=new Date()){
  const nowIso=now.toISOString();
  for(const hours of workerConfig.ASSIGNMENT_REMINDER_HOURS){
    const rows=await workerPool.query(`select a.id,a.title,a.due_at,a.class_id from assignments a where a.due_at is not null and a.due_at>=$1::timestamptz and a.due_at<=$1::timestamptz+($2||' hours')::interval`,[nowIso,String(hours)]);
    for(const a of rows.rows)await emit('assignment.reminder','assignment',a.id,{assignmentId:a.id,classId:a.class_id,title:a.title,dueAt:a.due_at,hoursBefore:hours},`assignment-reminder:${a.id}:${hours}`);
  }

  const missing=await workerPool.query(`select a.id assignment_id,a.title,a.due_at,e.student_user_id from assignments a join enrollments e on e.class_id=a.class_id and e.status='active' left join submissions s on s.assignment_id=a.id and s.student_user_id=e.student_user_id where a.due_at is not null and a.due_at<$1::timestamptz and s.id is null`,[nowIso]);
  for(const r of missing.rows)await emit('assignment.missing','assignment',r.assignment_id,{assignmentId:r.assignment_id,userId:r.student_user_id,title:r.title,dueAt:r.due_at},`assignment-missing:${r.assignment_id}:${r.student_user_id}`);

  const sessions=await workerPool.query(`select id,class_id,title,starts_at from class_sessions where status='SCHEDULED' and starts_at>=$1::timestamptz and starts_at<=$1::timestamptz+($2||' minutes')::interval`,[nowIso,String(workerConfig.CLASS_REMINDER_MINUTES)]);
  for(const s of sessions.rows)await emit('class.session_reminder','class_session',s.id,{sessionId:s.id,classId:s.class_id,title:s.title,startsAt:s.starts_at,minutesBefore:workerConfig.CLASS_REMINDER_MINUTES},`class-reminder:${s.id}:${workerConfig.CLASS_REMINDER_MINUTES}`);

  for(const threshold of workerConfig.AI_CREDIT_THRESHOLDS){
    const wallets=await workerPool.query(`select user_id,balance from ai_credit_wallets where balance<=$1`,[threshold]);
    const month=nowIso.slice(0,7);
    for(const w of wallets.rows)await emit('ai.credit_threshold','ai_wallet',w.user_id,{userId:w.user_id,balance:Number(w.balance),threshold},`ai-threshold:${w.user_id}:${threshold}:${month}`);
  }

  const teachers=await workerPool.query(`select c.teacher_user_id user_id,count(*)::int pending from submissions s join assignments a on a.id=s.assignment_id join classes c on c.id=a.class_id left join grades g on g.submission_id=s.id where c.teacher_user_id is not null and (g.id is null or s.status in ('submitted','resubmitted')) group by c.teacher_user_id having count(*)>0`);
  const day=nowIso.slice(0,10);
  for(const t of teachers.rows)await emit('digest.ustadz.daily','user',t.user_id,{userId:t.user_id,pending:Number(t.pending),day},`ustadz-digest:${t.user_id}:${day}`);

  const outbox=await workerPool.query(`select count(*)::int pending from outbox_events where processed_at is null and available_at<=now()`);const pending=Number(outbox.rows[0].pending);
  if(pending>500)await emit('ops.outbox_backlog','ops','outbox',{title:'Outbox backlog tinggi',message:`${pending} event menunggu diproses.`,pending},`ops-outbox:${day}`);
}
