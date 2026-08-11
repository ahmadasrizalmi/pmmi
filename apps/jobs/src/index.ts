import { cfg } from './config.js';
import { pool } from './db.js';
import { runCycle } from './worker.js';
let stopping=false;
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{stopping=true});
console.log(`PMMI jobs worker ${cfg.INSTANCE_ID} started`);
while(!stopping){try{const work=await runCycle();if(work===0)await new Promise(r=>setTimeout(r,cfg.POLL_MS));}catch(error){console.error('jobs cycle failed',error);await new Promise(r=>setTimeout(r,cfg.POLL_MS));}}
await pool.end();
