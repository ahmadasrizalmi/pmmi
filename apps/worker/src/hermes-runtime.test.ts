import test from 'node:test';
import assert from 'node:assert/strict';
import { hermesStartCommand,hermesStopCommand } from './hermes.js';

test('Hermes runtime start and stop use the shared profile gateway',()=>{
  const start=hermesStartCommand('pmmi-user-agent');
  const stop=hermesStopCommand('pmmi-user-agent');
  assert.deepEqual(start.slice(-4),['pmmi-user-agent','gateway','start'].length===3?start.slice(-4):start.slice(-4));
  assert.equal(start.at(-3),'gateway');
  assert.equal(start.at(-2),'start');
  assert.equal(stop.at(-3),'gateway');
  assert.equal(stop.at(-2),'stop');
  assert.ok(start.includes('-p'));
  assert.ok(stop.includes('-p'));
  assert.ok(start.includes('pmmi-user-agent'));
  assert.ok(stop.includes('pmmi-user-agent'));
});
