import * as Minio from 'minio';
import { workerPool } from './db.js';

function clientFromEnv(){
  const endpoint=process.env.MINIO_ENDPOINT;const accessKey=process.env.MINIO_ACCESS_KEY;const secretKey=process.env.MINIO_SECRET_KEY;
  if(!endpoint||!accessKey||!secretKey)return null;
  const u=new URL(endpoint);
  return new Minio.Client({endPoint:u.hostname,port:u.port?Number(u.port):(u.protocol==='https:'?443:80),useSSL:u.protocol==='https:',accessKey,secretKey});
}

async function removeExpired(table:'submission_upload_intents'|'application_upload_intents',limit=100){
  const client=clientFromEnv();if(!client)return 0;
  const rows=await workerPool.query(`select id,bucket,object_key from ${table} where completed_at is null and expires_at<now() order by expires_at limit $1`,[limit]);
  let removed=0;
  for(const row of rows.rows){
    try{await client.removeObject(row.bucket,row.object_key);}catch(error:any){
      const code=String(error?.code??'');
      if(!['NoSuchKey','NoSuchObject','NotFound'].includes(code))continue;
    }
    await workerPool.query(`delete from ${table} where id=$1 and completed_at is null`,[row.id]);removed++;
  }
  return removed;
}

let lastCleanup=0;
export async function cleanupExpiredUploads(force=false){
  const now=Date.now();if(!force&&now-lastCleanup<60_000)return {removed:0};lastCleanup=now;
  const submissions=await removeExpired('submission_upload_intents');
  const applications=await removeExpired('application_upload_intents');
  return {removed:submissions+applications};
}
