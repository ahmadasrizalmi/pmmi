import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { buildApp } from './app.js';
import { closeDatabase } from './db.js';

const json = (response: any) => response.json() as any;

async function routerMock() {
  const server = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    if (req.url === '/v1/models') {
      res.end(JSON.stringify({ object: 'list', data: [{ id: 'test/model', object: 'model' }] }));
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'not found' }));
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(20129, '127.0.0.1', resolve);
  });
  return server;
}

test('Developer Key authenticates only the LLM-compatible API surface', async () => {
  const router = await routerMock();
  const app = await buildApp();
  await app.ready();
  try {
    let response = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: { email: 'santri@example.com', password: 'Santri12345!' },
    });
    assert.equal(response.statusCode, 200, response.body);
    const jwt = json(response).token as string;
    const jwtHeaders = { authorization: `Bearer ${jwt}` };

    response = await app.inject({
      method: 'POST',
      url: '/v1/ai/api-keys',
      headers: jwtHeaders,
      payload: { name: 'CI Developer Key', expiresInDays: 30 },
    });
    assert.equal(response.statusCode, 201, response.body);
    const created = json(response);
    assert.match(created.secret, /^pmmi_dev_/);
    assert.ok(created.key_prefix);
    assert.equal(created.key_hash, undefined, 'hash must never be returned');

    const developerHeaders = { authorization: `Bearer ${created.secret}` };
    response = await app.inject({ method: 'GET', url: '/v1/models', headers: developerHeaders });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(json(response).data[0].id, 'test/model');

    response = await app.inject({ method: 'GET', url: '/v1/admin/users', headers: developerHeaders });
    assert.equal(response.statusCode, 401, response.body);

    response = await app.inject({ method: 'DELETE', url: `/v1/ai/api-keys/${created.id}`, headers: jwtHeaders });
    assert.equal(response.statusCode, 200, response.body);

    response = await app.inject({ method: 'GET', url: '/v1/models', headers: developerHeaders });
    assert.equal(response.statusCode, 401, response.body);
  } finally {
    await app.close();
    await new Promise<void>(resolve => router.close(() => resolve()));
    await closeDatabase();
  }
});
