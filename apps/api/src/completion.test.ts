import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from './app.js';
import { closeDatabase,pool } from './db.js';

const json=(response:any)=>response.json() as any;
async function login(app:any,email:string,password:string){const r=await app.inject({method:'POST',url:'/v1/auth/login',payload:{email,password}});assert.equal(r.statusCode,200,r.body);return {authorization:`Bearer ${json(r).token}`};}

test('completion surfaces are enforceable at API runtime',async()=>{
  const app=await buildApp();await app.ready();
  try{
    const admin=await login(app,'admin@pondokmultimedia.id','Admin12345!');
    const ustadz=await login(app,'ustadz@pondokmultimedia.id','Ustadz12345!');
    const santri=await login(app,'santri@example.com','Santri12345!');

    const classRow=await pool.query(`select c.id from classes c join users u on u.id=c.teacher_user_id where u.email='ustadz@pondokmultimedia.id' order by c.created_at desc limit 1`);assert.ok(classRow.rowCount,'canonical class missing');
    let response=await app.inject({method:'GET',url:`/v1/academic/classes/${classRow.rows[0].id}/roster`,headers:ustadz});assert.equal(response.statusCode,200,response.body);assert.ok(json(response).items.some((item:any)=>item.email==='santri@example.com'),'santri missing from teacher roster');

    const profile=await pool.query(`select p.id from hermes_profiles p join users u on u.id=p.user_id where u.email='santri@example.com' order by p.created_at desc limit 1`);assert.ok(profile.rowCount,'canonical Hermes profile missing');
    await pool.query(`update hermes_profiles set status='READY',updated_at=now() where id=$1`,[profile.rows[0].id]);
    response=await app.inject({method:'POST',url:`/v1/hermes/agents/${profile.rows[0].id}/start`,headers:santri});assert.equal(response.statusCode,202,response.body);
    let event=await pool.query(`select topic from outbox_events where aggregate_id=$1 and topic='hermes.profile.start' order by id desc limit 1`,[profile.rows[0].id]);assert.equal(event.rows[0]?.topic,'hermes.profile.start');
    await pool.query(`update hermes_profiles set status='RUNNING',updated_at=now() where id=$1`,[profile.rows[0].id]);
    response=await app.inject({method:'POST',url:`/v1/hermes/agents/${profile.rows[0].id}/stop`,headers:santri});assert.equal(response.statusCode,202,response.body);
    event=await pool.query(`select topic from outbox_events where aggregate_id=$1 and topic='hermes.profile.stop' order by id desc limit 1`,[profile.rows[0].id]);assert.equal(event.rows[0]?.topic,'hermes.profile.stop');

    response=await app.inject({method:'OPTIONS',url:'/v1',headers:{origin:'https://app.pondokmultimedia.id','access-control-request-method':'GET'}});assert.equal(response.statusCode,204,response.body);assert.equal(response.headers['access-control-allow-origin'],'https://app.pondokmultimedia.id');
    response=await app.inject({method:'OPTIONS',url:'/v1',headers:{origin:'https://evil.example','access-control-request-method':'GET'}});assert.equal(response.statusCode,204,response.body);assert.equal(response.headers['access-control-allow-origin'],undefined);

    response=await app.inject({method:'GET',url:'/v1/admin/users',headers:admin});assert.equal(response.statusCode,200,response.body);
  }finally{await app.close();await closeDatabase();}
});
