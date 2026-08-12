import { execFile } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { promisify } from 'node:util';
import { workerConfig } from './config.js';
import { workerTx } from './db.js';
import type { OutboxEvent } from './notifications.js';

const execFileAsync=promisify(execFile);

export function hermesBuildCommands(profileName:string,workspacePath:string){
  const create=[workerConfig.HERMES_BIN,'profile','create',profileName,'--no-alias'];
  if(workerConfig.HERMES_TEMPLATE_PROFILE)create.push('--clone','--clone-from',workerConfig.HERMES_TEMPLATE_PROFILE);
  const commands:string[][]=[create,[workerConfig.HERMES_BIN,'-p',profileName,'config','set','terminal.cwd',workspacePath]];
  if(workerConfig.HERMES_START_GATEWAY)commands.push(hermesStartCommand(profileName));
  return commands;
}
export function hermesStartCommand(profileName:string){return [workerConfig.HERMES_BIN,'-p',profileName,'gateway','start'];}
export function hermesStopCommand(profileName:string){return [workerConfig.HERMES_BIN,'-p',profileName,'gateway','stop'];}

async function runCommand(command:string[]){const [bin,...args]=command;return execFileAsync(bin,args,{timeout:120000,maxBuffer:1024*1024});}

export async function handleHermesEvent(event:OutboxEvent){
  const p=event.payload??{};
  if(event.topic==='hermes.profile.build'){
    const profileId=p.profileId as string;const jobId=p.jobId as string;
    if(!workerConfig.HERMES_ENABLED){await workerTx(async client=>{await client.query(`update hermes_profiles set status='FAILED',last_error='Hermes runtime is disabled',updated_at=now() where id=$1`,[profileId]);await client.query(`update hermes_workspaces set status='FAILED',updated_at=now() where profile_id=$1`,[profileId]);await client.query(`update hermes_build_jobs set status='FAILED',last_error='Hermes runtime is disabled',finished_at=now(),attempt_count=attempt_count+1 where id=$1`,[jobId]);});return;}
    await workerTx(async client=>{await client.query(`update hermes_profiles set status='BUILDING',last_error=null,updated_at=now() where id=$1`,[profileId]);await client.query(`update hermes_build_jobs set status='RUNNING',started_at=now(),attempt_count=attempt_count+1 where id=$1`,[jobId]);});
    try{
      await mkdir(p.workspacePath,{recursive:true});
      for(const command of hermesBuildCommands(p.profileName,p.workspacePath))await runCommand(command);
      const readyStatus=workerConfig.HERMES_START_GATEWAY?'RUNNING':'READY';
      await workerTx(async client=>{await client.query(`update hermes_profiles set status=$1,last_error=null,updated_at=now() where id=$2`,[readyStatus,profileId]);await client.query(`update hermes_workspaces set status='READY',updated_at=now() where profile_id=$1`,[profileId]);await client.query(`update hermes_build_jobs set status='SUCCEEDED',finished_at=now(),last_error=null where id=$1`,[jobId]);});
    }catch(error:any){const message=String(error?.stderr||error?.message||error).slice(0,2000);await workerTx(async client=>{await client.query(`update hermes_profiles set status='FAILED',last_error=$1,updated_at=now() where id=$2`,[message,profileId]);await client.query(`update hermes_workspaces set status='FAILED',updated_at=now() where profile_id=$1`,[profileId]);await client.query(`update hermes_build_jobs set status='FAILED',last_error=$1,finished_at=now() where id=$2`,[message,jobId]);await client.query(`insert into ops_events(kind,severity,source,message,data) values('hermes.build_failed','ERROR','worker',$1,$2::jsonb)`,[message,JSON.stringify({profileId,jobId})]);});}
    return;
  }
  if(event.topic==='hermes.profile.start'||event.topic==='hermes.profile.stop'){
    const action=event.topic.endsWith('.start')?'start':'stop';
    const profile=await workerTx(async client=>{const r=await client.query(`select id,profile_name,status from hermes_profiles where id=$1 for update`,[p.profileId]);return r.rows[0]??null;});
    if(!profile||profile.status==='ARCHIVED')return;
    if(!workerConfig.HERMES_ENABLED)throw new Error('Hermes runtime is disabled');
    try{
      if(action==='start')await runCommand([workerConfig.HERMES_BIN,'-p',profile.profile_name,'gateway','install']); // idempotent: ensures the user systemd unit exists before start
      await runCommand(action==='start'?hermesStartCommand(profile.profile_name):hermesStopCommand(profile.profile_name));
      await workerTx(async client=>{await client.query(`update hermes_profiles set status=$1,last_error=null,updated_at=now() where id=$2`,[action==='start'?'RUNNING':'STOPPED',profile.id]);});
    }catch(error:any){const message=String(error?.stderr||error?.message||error).slice(0,2000);await workerTx(async client=>{await client.query(`update hermes_profiles set last_error=$1,updated_at=now() where id=$2`,[message,profile.id]);await client.query(`insert into ops_events(kind,severity,source,message,data) values($1,'ERROR','worker',$2,$3::jsonb)`,[`hermes.${action}_failed`,message,JSON.stringify({profileId:profile.id})]);});throw error;}
    return;
  }
  if(event.topic==='hermes.profile.archive'){
    const profile=await workerTx(async client=>{const r=await client.query(`select id,profile_name from hermes_profiles where id=$1 for update`,[p.profileId]);return r.rows[0]??null;});if(!profile)return;
    if(workerConfig.HERMES_ENABLED){try{await runCommand(hermesStopCommand(profile.profile_name));}catch{/* gateway may already be stopped */}}
    await workerTx(async client=>{await client.query(`update hermes_profiles set status='ARCHIVED',archived_at=now(),updated_at=now() where id=$1`,[p.profileId]);await client.query(`update hermes_workspaces set status='ARCHIVED',archived_at=now(),updated_at=now() where profile_id=$1`,[p.profileId]);});return;
  }
  if(event.topic==='hermes.user.archive'){
    const profiles=await workerTx(async client=>(await client.query(`select id,profile_name from hermes_profiles where user_id=$1 and status<>'ARCHIVED'`,[p.userId])).rows);
    for(const profile of profiles){if(workerConfig.HERMES_ENABLED){try{await runCommand(hermesStopCommand(profile.profile_name));}catch{}}await workerTx(async client=>{await client.query(`update hermes_profiles set status='ARCHIVED',archived_at=now(),updated_at=now() where id=$1`,[profile.id]);await client.query(`update hermes_workspaces set status='ARCHIVED',archived_at=now(),updated_at=now() where profile_id=$1`,[profile.id]);});}
  }
}
