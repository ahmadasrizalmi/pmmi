import { workerTx } from './db.js';
import type { OutboxEvent } from './notifications.js';

async function insertNotification(client:import('pg').PoolClient,args:{userId:string;type:string;category:string;title:string;body:string;dedupe:string;channels?:string[];priority?:string;email?:string|null}){
  const n=await client.query(`insert into notifications(user_id,type,category,title,body,recipient,priority,dedupe_key) values($1,$2,$3,$4,$5,$6::jsonb,$7,$8) on conflict(user_id,dedupe_key) where dedupe_key is not null do nothing returning id`,[args.userId,args.type,args.category,args.title,args.body,JSON.stringify({email:args.email??null}),args.priority??'NORMAL',args.dedupe]);
  if(!n.rowCount)return;
  const id=n.rows[0].id;await client.query(`insert into notification_deliveries(notification_id,channel,status,sent_at) values($1,'IN_APP','SENT',now()) on conflict do nothing`,[id]);
  for(const channel of args.channels??[]){await client.query(`insert into notification_deliveries(notification_id,channel,status) values($1,$2,'PENDING') on conflict do nothing`,[id,channel]);}
}

export async function materializeSpecialNotifications(event:OutboxEvent){
  if(event.topic==='student.lifecycle_communication_approved'){
    const p=event.payload??{};await workerTx(async client=>{await insertNotification(client,{userId:p.userId,type:event.topic,category:'lifecycle',title:p.title,body:p.body,dedupe:`lifecycle-approved:${p.communicationId}`,channels:Array.isArray(p.channels)?p.channels:[],priority:'HIGH',email:p.email??null});await client.query(`update lifecycle_communications set status='QUEUED' where id=$1`,[p.communicationId]);});return;
  }
  if(event.topic==='hermes.profile.build'){
    const p=event.payload??{};await workerTx(async client=>{const profile=await client.query(`select p.status,p.last_error,p.display_name,u.email from hermes_profiles p join users u on u.id=p.user_id where p.id=$1`,[p.profileId]);if(!profile.rowCount)return;const row=profile.rows[0];const ok=row.status==='READY';await insertNotification(client,{userId:p.userId,type:ok?'hermes.ready':'hermes.failed',category:'hermes',title:ok?`AI Agent siap: ${row.display_name}`:`Build AI Agent gagal: ${row.display_name}`,body:ok?'Agent sudah siap digunakan dari dashboard PMMI.':`Build gagal. ${row.last_error??'Hubungi admin bila masalah berlanjut.'}`,dedupe:`hermes-build-result:${p.jobId}:${row.status}`,channels:[],priority:ok?'NORMAL':'HIGH',email:row.email});});
  }
}
