import type pg from 'pg';
import { workerTx } from './db.js';
import type { OutboxEvent } from './notifications.js';

async function eventUserId(client:pg.PoolClient,event:OutboxEvent){
  const p=event.payload??{};
  if(event.topic==='grade.changed'){
    const r=await client.query(`select s.student_user_id from grades g join submissions s on s.id=g.submission_id where g.id=$1`,[p.id??event.aggregate_id]);return r.rows[0]?.student_user_id as string|undefined;
  }
  if(event.topic==='portfolio.featured')return p.student_user_id as string|undefined;
  if(event.topic==='student.lifecycle_changed'){
    const r=await client.query(`select user_id from students where id=$1`,[p.id??event.aggregate_id]);return r.rows[0]?.user_id as string|undefined;
  }
  return p.userId??p.user_id;
}

function matches(rule:any,event:OutboxEvent){
  const m=rule.metadata??{};const p=event.payload??{};
  if(m.minScore!==undefined && Number(p.score)<Number(m.minScore))return false;
  if(m.status!==undefined && String(p.status)!==String(m.status))return false;
  if(m.revisionRequired!==undefined && Boolean(p.revision_required)!==Boolean(m.revisionRequired))return false;
  return true;
}

export async function applyAutomaticRewards(event:OutboxEvent){
  await workerTx(async client=>{
    const rules=await client.query(`select * from reward_rules where enabled=true and trigger_type=$1`,[event.topic]);if(!rules.rowCount)return;
    const userId=await eventUserId(client,event);if(!userId)return;
    for(const rule of rules.rows){
      if(!matches(rule,event))continue;
      const sourceId=String(event.aggregate_id??event.id);
      const achievement=await client.query(`insert into achievements(user_id,reward_rule_id,source_type,source_id,metadata) values($1,$2,$3,$4,$5::jsonb) on conflict(user_id,reward_rule_id,source_type,source_id) do nothing returning id`,[userId,rule.id,event.topic,sourceId,JSON.stringify({automatic:true,eventId:event.id})]);
      if(!achievement.rowCount)continue;const achievementId=achievement.rows[0].id;
      if(Number(rule.ai_credits)>0){const w=await client.query(`insert into ai_credit_wallets(user_id,balance) values($1,$2) on conflict(user_id) do update set balance=ai_credit_wallets.balance+excluded.balance,updated_at=now() returning balance`,[userId,rule.ai_credits]);const balance=Number(w.rows[0].balance);await client.query(`update resource_entitlements set ai_credit_balance=$1,updated_at=now() where user_id=$2`,[balance,userId]);await client.query(`insert into ai_credit_ledger(user_id,delta,balance_after,reason,reference_type,reference_id,idempotency_key) values($1,$2,$3,'reward.automatic','achievement',$4,$5)`,[userId,rule.ai_credits,balance,achievementId,`reward:${achievementId}:credits`]);}
      if(Number(rule.hermes_slots)>0)await client.query(`insert into resource_entitlements(user_id,hermes_agent_slots) values($1,$2) on conflict(user_id) do update set hermes_agent_slots=resource_entitlements.hermes_agent_slots+excluded.hermes_agent_slots,updated_at=now()`,[userId,rule.hermes_slots]);
      await client.query(`insert into outbox_events(topic,aggregate_type,aggregate_id,payload,dedupe_key) values('reward.achievement_unlocked','achievement',$1,$2::jsonb,$3) on conflict(dedupe_key) do nothing`,[achievementId,JSON.stringify({achievementId,userId,rewardCode:rule.code,rewardName:rule.name,aiCredits:Number(rule.ai_credits),hermesSlots:Number(rule.hermes_slots)}),`reward-notify:${achievementId}`]);
    }
  });
}
