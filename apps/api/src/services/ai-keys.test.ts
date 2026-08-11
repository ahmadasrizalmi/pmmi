import assert from 'node:assert/strict';
import test from 'node:test';
import { generateAiKeySecret, hashAiKey } from './ai-keys.js';

test('Developer Key secrets use the PMMI prefix and hash deterministically', () => {
  const secret = generateAiKeySecret('DEVELOPER');
  assert.match(secret, /^pmmi_dev_[A-Za-z0-9_-]+$/);
  assert.equal(hashAiKey(secret), hashAiKey(secret));
  assert.notEqual(hashAiKey(secret), secret);
});

test('Agent and service credentials use separate prefixes', () => {
  assert.match(generateAiKeySecret('AGENT'), /^pmmi_agent_/);
  assert.match(generateAiKeySecret('SERVICE'), /^pmmi_svc_/);
});
