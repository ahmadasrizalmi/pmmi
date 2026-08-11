import pg from 'pg';
import { workerConfig } from './config.js';

const {Pool}=pg;
export const workerPool=new Pool({connectionString:workerConfig.DATABASE_URL,max:5});

export async function workerTx<T>(fn:(client:pg.PoolClient)=>Promise<T>):Promise<T>{
  const client=await workerPool.connect();
  try{await client.query('begin');const result=await fn(client);await client.query('commit');return result;}
  catch(error){await client.query('rollback');throw error;}
  finally{client.release();}
}
