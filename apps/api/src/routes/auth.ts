import { createHash, randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config } from '../config.js';
import { pool, withTransaction } from '../db.js';
import { hashPassword, verifyPassword } from '../security/password.js';
import { requireAuth } from '../security/authz.js';
import { writeAudit } from '../audit.js';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const bootstrapSchema = loginSchema.extend({ fullName: z.string().min(2) });
const activateSchema = z.object({ token: z.string().min(32), password: z.string().min(8) });
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post('/v1/auth/bootstrap-admin', async (request, reply) => {
    if (!config.BOOTSTRAP_ADMIN_TOKEN || request.headers['x-bootstrap-token'] !== config.BOOTSTRAP_ADMIN_TOKEN) {
      return reply.code(403).send({ error: 'bootstrap disabled or invalid token' });
    }
    const parsed = bootstrapSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid payload', issues: parsed.error.flatten() });

    const existing = await pool.query(`select 1 from users where role = 'ADMIN' limit 1`);
    if (existing.rowCount) return reply.code(409).send({ error: 'admin already exists' });

    const passwordHash = await hashPassword(parsed.data.password);
    const result = await pool.query(
      `insert into users(email, password_hash, full_name, role)
       values (lower($1), $2, $3, 'ADMIN') returning id, email, full_name, role`,
      [parsed.data.email, passwordHash, parsed.data.fullName],
    );
    return reply.code(201).send(result.rows[0]);
  });

  app.post('/v1/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid credentials' });

    const result = await pool.query(
      `select id, email, full_name, role, password_hash, is_active from users where email = lower($1) limit 1`,
      [parsed.data.email],
    );
    const user = result.rows[0];
    if (!user?.password_hash || !user.is_active || !(await verifyPassword(parsed.data.password, user.password_hash))) {
      return reply.code(401).send({ error: 'invalid credentials' });
    }

    const token = app.jwt.sign({ sub: user.id, role: user.role, name: user.full_name }, { expiresIn: '12h' });
    return { token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } };
  });

  app.post('/v1/auth/activate', async (request, reply) => {
    const parsed = activateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid payload' });
    const passwordHash = await hashPassword(parsed.data.password);

    const activated = await withTransaction(async (client) => {
      const tokenResult = await client.query(
        `select id, user_id from account_activation_tokens
         where token_hash = $1 and used_at is null and expires_at > now()
         for update`,
        [tokenHash(parsed.data.token)],
      );
      if (!tokenResult.rowCount) return null;
      const record = tokenResult.rows[0];
      await client.query(`update users set password_hash = $1, is_active = true, updated_at = now() where id = $2`, [passwordHash, record.user_id]);
      await client.query(`update account_activation_tokens set used_at = now() where id = $1`, [record.id]);
      await writeAudit(client, record.user_id, 'account.activated', 'user', record.user_id);
      return record.user_id as string;
    });
    if (!activated) return reply.code(400).send({ error: 'activation token invalid or expired' });
    return { activated: true };
  });

  app.get('/v1/auth/me', async (request, reply) => {
    const session = await requireAuth(request, reply);
    if (!session) return;
    const result = await pool.query(
      `select id, email, full_name, role, is_active from users where id = $1`,
      [session.sub],
    );
    if (!result.rowCount) return reply.code(404).send({ error: 'user not found' });
    return result.rows[0];
  });
}

export async function createActivationToken(client: import('pg').PoolClient, userId: string) {
  const token = randomBytes(32).toString('hex');
  await client.query(
    `insert into account_activation_tokens(user_id, token_hash, expires_at)
     values ($1, $2, now() + interval '48 hours')`,
    [userId, tokenHash(token)],
  );
  return token;
}
