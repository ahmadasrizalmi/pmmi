import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool, withTransaction } from '../db.js';
import { requireAuth } from '../security/authz.js';
import { createAiKey, type AiKeyKind } from '../services/ai-keys.js';
import { writeAudit } from '../audit.js';

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  expiresInDays: z.number().int().min(1).max(365).default(90),
});

const adminCreateSchema = createSchema.extend({
  userId: z.string().uuid(),
  kind: z.enum(['DEVELOPER', 'AGENT', 'SERVICE']).default('DEVELOPER'),
});

function expiry(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function registerApiKeyRoutes(app: FastifyInstance) {
  app.get('/v1/ai/api-keys', async (request, reply) => {
    const user = await requireAuth(request, reply, ['ADMIN', 'USTADZ', 'SANTRI']);
    if (!user) return;
    const result = await pool.query(
      `select id,name,kind,key_prefix,expires_at,last_used_at,revoked_at,created_at
         from ai_api_keys
        where user_id=$1 and kind='DEVELOPER'
        order by created_at desc`,
      [user.sub],
    );
    return { items: result.rows };
  });

  app.post('/v1/ai/api-keys', async (request, reply) => {
    const user = await requireAuth(request, reply, ['USTADZ', 'SANTRI']);
    if (!user) return;
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid API key request', issues: parsed.error.flatten() });
    const active = await pool.query(
      `select count(*)::int count from ai_api_keys where user_id=$1 and kind='DEVELOPER' and revoked_at is null and (expires_at is null or expires_at>now())`,
      [user.sub],
    );
    if (Number(active.rows[0].count) >= 5) return reply.code(409).send({ error: 'maximum 5 active Developer Keys' });
    const created = await withTransaction(async client => {
      const key = await createAiKey(client, {
        userId: user.sub,
        name: parsed.data.name,
        kind: 'DEVELOPER',
        createdBy: user.sub,
        expiresAt: expiry(parsed.data.expiresInDays),
      });
      await writeAudit(client, user.sub, 'ai.api_key.created', 'ai_api_key', key.id, { kind: 'DEVELOPER', name: parsed.data.name });
      return key;
    });
    return reply.code(201).send(created);
  });

  app.post('/v1/ai/api-keys/:id/rotate', async (request, reply) => {
    const user = await requireAuth(request, reply, ['USTADZ', 'SANTRI']);
    if (!user) return;
    const { id } = request.params as { id: string };
    const existing = await pool.query(
      `select id,name,user_id from ai_api_keys where id=$1 and user_id=$2 and kind='DEVELOPER' and revoked_at is null`,
      [id, user.sub],
    );
    if (!existing.rowCount) return reply.code(404).send({ error: 'API key not found' });
    const rotated = await withTransaction(async client => {
      await client.query(`update ai_api_keys set revoked_at=now() where id=$1`, [id]);
      const key = await createAiKey(client, {
        userId: user.sub,
        name: existing.rows[0].name,
        kind: 'DEVELOPER',
        createdBy: user.sub,
        expiresAt: expiry(90),
      });
      await writeAudit(client, user.sub, 'ai.api_key.rotated', 'ai_api_key', key.id, { previousId: id });
      return key;
    });
    return reply.code(201).send(rotated);
  });

  app.delete('/v1/ai/api-keys/:id', async (request, reply) => {
    const user = await requireAuth(request, reply, ['ADMIN', 'USTADZ', 'SANTRI']);
    if (!user) return;
    const { id } = request.params as { id: string };
    const params = user.role === 'ADMIN' ? [id] : [id, user.sub];
    const where = user.role === 'ADMIN' ? 'id=$1' : 'id=$1 and user_id=$2';
    const result = await pool.query(`update ai_api_keys set revoked_at=coalesce(revoked_at,now()) where ${where} returning id,user_id,kind`, params);
    if (!result.rowCount) return reply.code(404).send({ error: 'API key not found' });
    await withTransaction(async client => writeAudit(client, user.sub, 'ai.api_key.revoked', 'ai_api_key', id, { kind: result.rows[0].kind }));
    return { revoked: true, id };
  });

  app.get('/v1/admin/ai/api-keys', async (request, reply) => {
    const admin = await requireAuth(request, reply, ['ADMIN']);
    if (!admin) return;
    const result = await pool.query(
      `select k.id,k.user_id,u.full_name,u.email,k.name,k.kind,k.key_prefix,k.expires_at,k.last_used_at,k.revoked_at,k.created_at
         from ai_api_keys k join users u on u.id=k.user_id
        order by k.created_at desc limit 250`,
    );
    return { items: result.rows };
  });

  app.post('/v1/admin/ai/api-keys', async (request, reply) => {
    const admin = await requireAuth(request, reply, ['ADMIN']);
    if (!admin) return;
    const parsed = adminCreateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid API key request', issues: parsed.error.flatten() });
    const target = await pool.query(`select id from users where id=$1 and is_active=true`, [parsed.data.userId]);
    if (!target.rowCount) return reply.code(404).send({ error: 'user not found' });
    const created = await withTransaction(async client => {
      const key = await createAiKey(client, {
        userId: parsed.data.userId,
        name: parsed.data.name,
        kind: parsed.data.kind as AiKeyKind,
        createdBy: admin.sub,
        expiresAt: expiry(parsed.data.expiresInDays),
      });
      await writeAudit(client, admin.sub, 'ai.api_key.admin_created', 'ai_api_key', key.id, { userId: parsed.data.userId, kind: parsed.data.kind });
      return key;
    });
    return reply.code(201).send(created);
  });
}
