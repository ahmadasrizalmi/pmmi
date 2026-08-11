import type { FastifyReply, FastifyRequest } from 'fastify';
import { lookupAiKey } from '../services/ai-keys.js';

export type Role = 'ADMIN' | 'USTADZ' | 'SANTRI';
export type SessionUser = { sub: string; role: Role; name: string };

const API_KEY_ALLOWED_PATHS = new Set([
  '/v1/models',
  '/v1/chat/completions',
  '/v1/ai/models',
  '/v1/ai/chat/completions',
]);

function bearerToken(request: FastifyRequest) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply, roles?: Role[]): Promise<SessionUser | null> {
  const path = request.url.split('?')[0];
  const token = bearerToken(request);

  if (token?.startsWith('pmmi_') && API_KEY_ALLOWED_PATHS.has(path)) {
    const apiUser = await lookupAiKey(token);
    if (!apiUser) {
      await reply.code(401).send({ error: 'invalid or expired API key' });
      return null;
    }
    if (roles && !roles.includes(apiUser.role)) {
      await reply.code(403).send({ error: 'forbidden' });
      return null;
    }
    return apiUser;
  }

  try {
    await request.jwtVerify();
  } catch {
    await reply.code(401).send({ error: 'unauthorized' });
    return null;
  }
  const user = request.user as SessionUser;
  if (roles && !roles.includes(user.role)) {
    await reply.code(403).send({ error: 'forbidden' });
    return null;
  }
  return user;
}
