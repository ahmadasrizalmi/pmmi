import type { FastifyReply, FastifyRequest } from 'fastify';

export type Role = 'ADMIN' | 'USTADZ' | 'SANTRI';
export type SessionUser = { sub: string; role: Role; name: string };

export async function requireAuth(request: FastifyRequest, reply: FastifyReply, roles?: Role[]): Promise<SessionUser | null> {
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
