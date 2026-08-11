import pg from 'pg';
import { cfg } from './config.js';
export const pool=new pg.Pool({connectionString:cfg.DATABASE_URL,max:5});
export async function tx<T>(fn:(client:pg.PoolClient)=>Promise<T>){const c=await pool.connect();try{await c.query('begin');const r=await fn(c);await c.query('commit');return r}catch(e){await c.query('rollback');throw e}finally{c.release()}}
export async function heartbeat(metadata:Record<string,unknown>={}){await pool.query(`insert into service_heartbeats(service,instance_id,metadata,last_seen_at) values('jobs',$1,$2::jsonb,now()) on conflict(service) do update set instance_id=excluded.instance_id,metadata=excluded.metadata,last_seen_at=now()`,[cfg.INSTANCE_ID,JSON.stringify(metadata)]);}
