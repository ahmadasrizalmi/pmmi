import { workerConfig } from './config.js';
import { workerPool } from './db.js';
import { runWorkerCycle } from './outbox.js';

let stopping=false;
async function tick(){if(stopping)return;try{await runWorkerCycle();}catch(error){console.error('PMMI worker cycle failed',error);}}

console.log(`PMMI worker started, interval=${workerConfig.WORKER_INTERVAL_MS}ms`);
await tick();
const timer=setInterval(()=>{void tick();},workerConfig.WORKER_INTERVAL_MS);

async function shutdown(){stopping=true;clearInterval(timer);await workerPool.end();process.exit(0);}
process.on('SIGINT',()=>{void shutdown();});
process.on('SIGTERM',()=>{void shutdown();});
