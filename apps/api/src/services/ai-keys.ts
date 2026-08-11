import { createHash, randomBytes } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool } from '../db.js';
import type { SessionUser } from '../security/authz.js';

export type AiKeyKind = 'DEVELOPER' | 'AGENT' | 'SERVICE';

type CreateAiKeyInput = {
  userId: string;
  name: string;
  kind: AiKeyKind;
  createdBy: string;
  expiresAt?: Date | null;
};

function secretPrefix(kind: AiKeyKind) {
  if (kind === 'AGENT') return 'pmmi_agent_';
  if (kind === 'SERVICE') return 'pmmi_svc_';
  return 'pmmi_dev_';
}

export function hashAiKey(secret: string) {
  return createHash('sha256').update(secret).digest('hex');
}

export function generateAiKeySecret(kind: AiKeyKind) {
  return `${secretPrefix(kind)}${randomBytes(32).toString('base64url')}`;
}

export async function createAiKey(client: PoolClient, input: CreateAiKeyInput) {
  const secret = generateAiKeySecret(input.kind);
  const hash = hashAiKey(secret);
  const keyPrefix = `${secret.slice(0, 16)}…${secret.slice(-4)}`;
  const result = await client.query(
    `insert into ai_api_keys(user_id,name,kind,key_prefix,key_hash,expires_at,created_by)
     values($1,$2,$3,$4,$5,$6,$7)
     returning id,user_id,name,kind,key_prefix,expires_at,last_used_at,revoked_at,created_at`,
    [input.userId, input.name, input.kind, keyPrefix, hash, input.expiresAt ?? null, input.createdBy],
  );
  return { ...result.rows[0], secret };
}

export async function lookupAiKey(secret: string): Promise<SessionUser | null> {
  if (!secret.startsWith('pmmi_')) return null;
  const keyHash = hashAiKey(secret);
  const result = await pool.query(
    `select k.id,k.user_id,k.kind,u.role,u.full_name
       from ai_api_keys k
       join users u on u.id=k.user_id
      where k.key_hash=$1
        and k.revoked_at is null
        and (k.expires_at is null or k.expires_at>now())
        and u.is_active=true
      limit 1`,
    [keyHash],
  );
  if (!result.rowCount) return null;
  const row = result.rows[0];
  if (!['ADMIN', 'USTADZ', 'SANTRI'].includes(row.role)) return null;
  await pool.query(`update ai_api_keys set last_used_at=now() where id=$1`, [row.id]);
  return { sub: row.user_id, role: row.role, name: row.full_name } as SessionUser;
}
