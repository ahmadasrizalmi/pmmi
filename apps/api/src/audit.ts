import type pg from 'pg';

export async function writeAudit(
  client: pg.PoolClient,
  actorUserId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
) {
  await client.query(
    `insert into audit_logs(actor_user_id, action, entity_type, entity_id, metadata)
     values ($1, $2, $3, $4, $5::jsonb)`,
    [actorUserId, action, entityType, entityId, JSON.stringify(metadata)],
  );
}
