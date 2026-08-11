import test from 'node:test';
import assert from 'node:assert/strict';
import { hermesBuildCommands } from './hermes.js';
import { runWorkerCycle } from './outbox.js';
import { workerPool } from './db.js';

test('Hermes provisioning command contract uses one shared installation and per-profile cwd',()=>{
  const commands=hermesBuildCommands('pmmi-user-agent','/srv/pmmi/workspaces/u/a');
  assert.deepEqual(commands[0].slice(0,4),[process.env.HERMES_BIN??'hermes','profile','create','pmmi-user-agent']);
  assert.ok(commands[0].includes('--no-alias'));
  assert.deepEqual(commands[1],[process.env.HERMES_BIN??'hermes','-p','pmmi-user-agent','config','set','terminal.cwd','/srv/pmmi/workspaces/u/a']);
});

test('worker drains transactional outbox, materializes notifications and automatic rewards',async()=>{
  try{
    for(let i=0;i<8;i++)await runWorkerCycle();
    const pending=await workerPool.query(`select count(*)::int count from outbox_events where processed_at is null and available_at<=now()`);
    assert.equal(pending.rows[0].count,0);
    const notifications=await workerPool.query(`select count(*)::int count from notifications`);assert.ok(notifications.rows[0].count>0);
    const sent=await workerPool.query(`select count(*)::int count from notification_deliveries where status in ('SENT','DELIVERED')`);assert.ok(sent.rows[0].count>0);
    const reward=await workerPool.query(`select count(*)::int count from achievements a join reward_rules r on r.id=a.reward_rule_id join users u on u.id=a.user_id where r.code='GRADE_EXCELLENCE' and u.email='santri@example.com'`);assert.ok(reward.rows[0].count>=1);
    const hermes=await workerPool.query(`select status,last_error from hermes_profiles p join users u on u.id=p.user_id where u.email='santri@example.com' order by p.created_at desc limit 1`);assert.equal(hermes.rows[0].status,'FAILED');assert.match(hermes.rows[0].last_error,/disabled/i);
  } finally {await workerPool.end();}
});
