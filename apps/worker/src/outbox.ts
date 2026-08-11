import { workerConfig } from './config.js';
import { workerPool, workerTx } from './db.js';
import { materializeNotifications, processDeliveries, type OutboxEvent } from './notifications.js';
import { materializeSpecialNotifications } from './special-notifications.js';
import { handleHermesEvent } from './hermes.js';
import { applyAutomaticRewards } from './rewards.js';
import { runSchedulers } from './scheduler.js';

async function claimEvents():Promise<OutboxEvent[]>{
  return workerTx(async client=>{
    const rows=await client.query(`select id,topic,aggregate_type,aggregate_id,payload,attempt_count from outbox_events where processed_at is null and available_at<=now() and (locked_at is null or locked_at<now()-interval '5 minutes') order by id for update skip locked limit $1`,[workerConfig.WORKER_BATCH_SIZE]);
    if(rows.rowCount)await client.query(`update outbox_events set locked_at=now() where id=any($1::bigint[])`,[rows.rows.map(r=>r.id)]);
    return rows.rows as OutboxEvent[];
  });
}

async function complete(id:number){await workerPool.query(`update outbox_events set processed_at=now(),locked_at=null,last_error=null where id=$1`,[id]);}
async function fail(event:OutboxEvent,error:unknown){
  const attempts=Number(event.attempt_count??0)+1;const message=String((error as any)?.stack||(error as any)?.message||error).slice(0,4000);
  if(attempts>=10){await workerTx(async client=>{await client.query(`update outbox_events set attempt_count=$1,last_error=$2,processed_at=now(),locked_at=null where id=$3`,[attempts,message,event.id]);await client.query(`insert into ops_events(kind,severity,source,message,data) values('outbox.poison_event','ERROR','worker',$1,$2::jsonb)`,[message,JSON.stringify({eventId:event.id,topic:event.topic})]);await client.query(`insert into outbox_events(topic,aggregate_type,aggregate_id,payload,dedupe_key) values('ops.outbox_poison','ops',$1,$2::jsonb,$3) on conflict(dedupe_key) do nothing`,[String(event.id),JSON.stringify({title:'Outbox event gagal permanen',message,eventId:event.id,topic:event.topic}),`ops-poison:${event.id}`]);});return;}
  const delay=Math.min(3600,Math.pow(2,attempts)*15);await workerPool.query(`update outbox_events set attempt_count=$1,last_error=$2,available_at=now()+($3||' seconds')::interval,locked_at=null where id=$4`,[attempts,message,String(delay),event.id]);
}

export async function runWorkerCycle(){
  await runSchedulers();
  const events=await claimEvents();
  for(const event of events){
    try{
      if(event.topic.startsWith('hermes.'))await handleHermesEvent(event);
      await applyAutomaticRewards(event);
      await materializeNotifications(event);
      await materializeSpecialNotifications(event);
      await complete(event.id);
    }catch(error){await fail(event,error);}
  }
  await processDeliveries(workerConfig.WORKER_BATCH_SIZE*2);
  return {events:events.length};
}
