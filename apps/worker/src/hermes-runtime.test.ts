import test from 'node:test';
import assert from 'node:assert/strict';
import { hermesStartCommand,hermesStopCommand } from './hermes.js';

test('Hermes runtime start and stop use the shared profile gateway',()=>{
  const start=hermesStartCommand('pmmi-user-agent');
  const stop=hermesStopCommand('pmmi-user-agent');
  assert.equal(start.at(-3),'pmmi-user-agent');
  assert.equal(start.at(-2),'gateway');
  assert.equal(start.at(-1),'start');
  assert.equal(stop.at(-3),'pmmi-user-agent');
  assert.equal(stop.at(-2),'gateway');
  assert.equal(stop.at(-1),'stop');
  assert.ok(start.includes('-p'));
  assert.ok(stop.includes('-p'));
});
