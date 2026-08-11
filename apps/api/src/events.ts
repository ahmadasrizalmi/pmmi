import type pg from 'pg';

export async function enqueueOutbox(
  client: pg.PoolClient,
  topic: string,
  aggregateType: string,
  aggregateId: string,
  payload: Record<string, unknown>,
  dedupeKey?: string,
) {
  await client.query(
    `insert into outbox_events(topic,aggregate_type,aggregate_id,payload,dedupe_key)
     values($1,$2,$3,$4::jsonb,$5)
     on conflict(dedupe_key) do nothing`,
    [topic, aggregateType, aggregateId, JSON.stringify(payload), dedupeKey ?? null],
  );
}
