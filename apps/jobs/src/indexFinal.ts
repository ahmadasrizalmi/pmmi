import { cfg } from './config.js';
import { pool } from './db.js';
import { scheduleBlueprintReminders } from './reminders.js';
import { runCycle } from './worker.js';

let stopping=false;let lastBlueprintSchedule=0;
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{stopping=true});
console.log(`PMMI final jobs worker ${cfg.INSTANCE_ID} started`);
while(!stopping){
  try{
    if(Date.now()-lastBlueprintSchedule>60_000){await scheduleBlueprintReminders();lastBlueprintSchedule=Date.now();}
    const work=await runCycle();if(work===0)await new Promise(r=>setTimeout(r,cfg.POLL_MS));
  }catch(error){console.error('final jobs cycle failed',error);await new Promise(r=>setTimeout(r,cfg.POLL_MS));}
}
await pool.end();
