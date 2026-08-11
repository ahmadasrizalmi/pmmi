import { workerConfig } from './config.js';
import { workerPool } from './db.js';
import { runWorkerCycle } from './outbox.js';
import { cleanupExpiredUploads } from './storage-cleanup.js';

let stopping=false;
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));

async function tick(){
  try{
    const result=await runWorkerCycle();
    const cleanup=await cleanupExpiredUploads();
    if(result.events||cleanup.removed)console.log('PMMI worker cycle', {...result,expiredUploadsRemoved:cleanup.removed});
  }catch(error){console.error('PMMI worker cycle failed',error);}
}

process.on('SIGTERM',()=>{stopping=true;});
process.on('SIGINT',()=>{stopping=true;});

console.log('PMMI worker started');
try{
  while(!stopping){await tick();await sleep(workerConfig.WORKER_INTERVAL_MS);}
}finally{
  await workerPool.end();
  console.log('PMMI worker stopped');
}
