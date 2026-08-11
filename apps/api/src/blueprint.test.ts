import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { buildApp } from './app.js';
import { closeDatabase, pool } from './db.js';

const json=(r:any)=>r.json() as any;
const post=(app:any,url:string,payload:any,headers:any={})=>app.inject({method:'POST',url,headers,payload});
const patch=(app:any,url:string,payload:any,headers:any={})=>app.inject({method:'PATCH',url,headers,payload});

async function routerMock(){
  const server=http.createServer((req,res)=>{
    res.setHeader('content-type','application/json');
    if(req.url==='/v1/models'){res.end(JSON.stringify({object:'list',data:[{id:'test/model',object:'model'}]}));return;}
    if(req.url==='/v1/chat/completions'&&req.method==='POST'){
      let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{const body=JSON.parse(raw||'{}');res.end(JSON.stringify({id:'chatcmpl-pmmi',model:body.model,provider:'mock',choices:[{index:0,message:{role:'assistant',content:'Jawaban AI PMMI'},finish_reason:'stop'}],usage:{prompt_tokens:100,completion_tokens:50,total_tokens:150}}));});return;
    }
    res.statusCode=404;res.end(JSON.stringify({error:'not found'}));
  });
  await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(20129,'127.0.0.1',resolve);});return server;
}

async function makeApplicant(app:any,periodId:string,name:string,email:string,phone:string,admin:any,programId:string,cohortId:string){
  let r=await post(app,'/v1/admissions/applications',{admissionPeriodId:periodId,applicantName:name,email,phone});assert.equal(r.statusCode,201,r.body);const application=json(r);let applicant={'x-applicant-token':application.applicantToken};
  r=await app.inject({method:'GET',url:`/v1/admissions/applications/${application.id}/self`,headers:applicant});assert.equal(r.statusCode,200,r.body);
  r=await post(app,`/v1/admin/admissions/applications/${application.id}/access-token`,{},admin);assert.equal(r.statusCode,200,r.body);const recovered=json(r).applicantToken;
  r=await app.inject({method:'GET',url:`/v1/admissions/applications/${application.id}/self`,headers:applicant});assert.equal(r.statusCode,401,r.body);applicant={'x-applicant-token':recovered};
  r=await post(app,`/v1/admissions/applications/${application.id}/documents/upload`,{kind:'IDENTITY',originalName:`${name}.txt`,contentType:'text/plain'},applicant);assert.equal(r.statusCode,201,r.body);const upload=json(r);const put=await fetch(upload.url,{method:'PUT',body:name,headers:{'content-type':'text/plain'}});assert.ok(put.ok);
  r=await post(app,`/v1/admissions/applications/${application.id}/documents/complete`,{uploadId:upload.uploadId},applicant);assert.equal(r.statusCode,201,r.body);
  r=await post(app,`/v1/admissions/applications/${application.id}/reviews`,{status:'APPROVED',notes:'Verified'},admin);assert.equal(r.statusCode,201,r.body);
  for(const status of ['ADMIN_VERIFIED','SCREENING']){r=await patch(app,`/v1/admissions/applications/${application.id}/status`,{status},admin);assert.equal(r.statusCode,200,r.body);}
  r=await post(app,`/v1/admissions/applications/${application.id}/scores`,{category:'PORTFOLIO',score:90,maxScore:100},admin);assert.equal(r.statusCode,201,r.body);
  r=await post(app,`/v1/admissions/applications/${application.id}/interviews`,{scheduledAt:new Date(Date.now()+86400000).toISOString(),location:'PMMI'},admin);assert.equal(r.statusCode,201,r.body);
  r=await post(app,`/v1/admissions/applications/${application.id}/decision`,{decision:'ACCEPTED',reason:'Lulus seleksi'},admin);assert.equal(r.statusCode,201,r.body);
  r=await app.inject({method:'PUT',url:`/v1/admissions/applications/${application.id}/registration`,headers:applicant,payload:{programId,cohortId,metadata:{source:'e2e'}}});assert.equal(r.statusCode,200,r.body);
  r=await app.inject({method:'GET',url:`/v1/admissions/applications/${application.id}/self`,headers:applicant});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).registration.program_id,programId);
  return {application,applicant};
}

test('PMMI Digital Campus blueprint canonical flow',async()=>{
  await pool.query(`truncate table users,admission_periods,courses,cohorts,programs,reward_rules,outbox_events,notifications,ops_events,backup_runs restart identity cascade`);
  await pool.query(`insert into ai_model_permissions(role,model_pattern,enabled,max_requests_per_hour) values('ADMIN','*',true,null),('USTADZ','*',true,null),('SANTRI','*',true,1) on conflict(role,model_pattern) do update set enabled=true,max_requests_per_hour=excluded.max_requests_per_hour`);
  const router=await routerMock();const app=await buildApp();await app.ready();
  try{
    let r=await post(app,'/v1/auth/bootstrap-admin',{email:'admin@pondokmultimedia.id',password:'Admin12345!',fullName:'PMMI Admin'},{'x-bootstrap-token':process.env.BOOTSTRAP_ADMIN_TOKEN!});assert.equal(r.statusCode,201,r.body);
    r=await post(app,'/v1/auth/login',{email:'admin@pondokmultimedia.id',password:'Admin12345!'});assert.equal(r.statusCode,200,r.body);const admin={authorization:`Bearer ${json(r).token}`};

    r=await post(app,'/v1/admin/users',{email:'ustadz@pondokmultimedia.id',fullName:'Ustadz Test',role:'USTADZ',aiCredits:25,hermesSlots:1},admin);assert.equal(r.statusCode,201,r.body);const ustadz=json(r);
    r=await post(app,'/v1/auth/activate',{token:ustadz.activationToken,password:'Ustadz12345!'});assert.equal(r.statusCode,200,r.body);
    r=await post(app,'/v1/auth/login',{email:'ustadz@pondokmultimedia.id',password:'Ustadz12345!'});assert.equal(r.statusCode,200,r.body);const ustadzAuth={authorization:`Bearer ${json(r).token}`};

    r=await post(app,'/v1/catalog/programs',{code:'PROGRAMMER',name:'Programmer'},admin);const programId=json(r).id;assert.equal(r.statusCode,201,r.body);
    r=await post(app,'/v1/catalog/cohorts',{name:'Angkatan 2027',year:2027,isActive:true},admin);const cohortId=json(r).id;assert.equal(r.statusCode,201,r.body);
    r=await post(app,'/v1/admissions/periods',{name:'Penerimaan 2027',cohortYear:2027,isActive:true},admin);const periodId=json(r).id;assert.equal(r.statusCode,201,r.body);

    const primary=await makeApplicant(app,periodId,'Santri Test','santri@example.com','628123456789',admin,programId,cohortId);
    r=await patch(app,`/v1/admissions/applications/${primary.application.id}/status`,{status:'ENROLLED'},admin);assert.equal(r.statusCode,200,r.body);const enrolled=json(r);assert.ok(enrolled.activationToken);assert.ok(enrolled.userId);
    r=await post(app,'/v1/auth/activate',{token:enrolled.activationToken,password:'Santri12345!'});assert.equal(r.statusCode,200,r.body);
    r=await post(app,'/v1/auth/login',{email:'santri@example.com',password:'Santri12345!'});assert.equal(r.statusCode,200,r.body);const santri={authorization:`Bearer ${json(r).token}`};

    r=await post(app,'/v1/rewards/rules',{code:'GRADE_EXCELLENCE',name:'Nilai Istimewa',triggerType:'grade.changed',aiCredits:20,hermesSlots:0,metadata:{minScore:90}},admin);assert.equal(r.statusCode,201,r.body);
    r=await post(app,'/v1/academic/courses',{code:'WEB101',name:'Web Development'},admin);const courseId=json(r).id;assert.equal(r.statusCode,201,r.body);
    r=await post(app,'/v1/academic/classes',{courseId,teacherUserId:ustadz.id,name:'Web Angkatan 2027'},admin);const classId=json(r).id;assert.equal(r.statusCode,201,r.body);
    r=await post(app,`/v1/academic/classes/${classId}/enroll`,{studentUserId:enrolled.userId},admin);assert.equal(r.statusCode,201,r.body);
    r=await post(app,'/v1/academic/sessions',{classId,title:'Kelas Web',startsAt:new Date(Date.now()+1800000).toISOString(),endsAt:new Date(Date.now()+5400000).toISOString(),location:'Lab PMMI'},ustadzAuth);const sessionId=json(r).id;assert.equal(r.statusCode,201,r.body);
    r=await app.inject({method:'PUT',url:`/v1/academic/sessions/${sessionId}/attendance`,headers:ustadzAuth,payload:{records:[{studentUserId:enrolled.userId,status:'PRESENT'}]}});assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'GET',url:'/v1/academic/schedule',headers:santri});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).items.length,1);

    r=await post(app,'/v1/academic/assignments',{classId,title:'Landing Page Masjid',maxScore:100,dueAt:new Date(Date.now()+7200000).toISOString()},ustadzAuth);const assignmentId=json(r).id;assert.equal(r.statusCode,201,r.body);
    r=await post(app,`/v1/academic/assignments/${assignmentId}/uploads`,{originalName:'index.html',contentType:'text/html'},santri);const upload=json(r);assert.equal(r.statusCode,201,r.body);const put=await fetch(upload.url,{method:'PUT',body:'<html>PMMI</html>',headers:{'content-type':'text/html'}});assert.ok(put.ok);
    r=await post(app,`/v1/academic/assignments/${assignmentId}/submissions`,{uploadIds:[upload.uploadId],notes:'Tugas pertama'},santri);const submissionId=json(r).id;assert.equal(r.statusCode,201,r.body);
    r=await post(app,`/v1/academic/submissions/${submissionId}/grade`,{score:92,feedback:'Bagus',revisionRequired:false},ustadzAuth);assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'GET',url:'/v1/academic/my/grades',headers:santri});assert.equal(json(r).items[0].score,'92.00');
    r=await post(app,`/v1/academic/submissions/${submissionId}/feature`,{title:'Landing Page Masjid',slug:'landing-page-masjid',summary:'Karya santri'},ustadzAuth);assert.equal(r.statusCode,201,r.body);assert.equal(json(r).requiresStudentApproval,false);
    r=await post(app,'/v1/academic/certificates',{studentUserId:enrolled.userId,title:'Web Development',certificateNo:'PMMI-2027-001'},admin);assert.equal(r.statusCode,201,r.body);
    r=await app.inject({method:'GET',url:'/v1/academic/my/certificates',headers:santri});assert.equal(json(r).items.length,1);

    r=await app.inject({method:'GET',url:'/v1/models',headers:santri});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).data[0].id,'test/model');
    r=await app.inject({method:'GET',url:'/v1/ai/wallet',headers:santri});const before=Number(json(r).balance);assert.ok(before>0);
    r=await post(app,'/v1/chat/completions',{model:'test/model',messages:[{role:'user',content:'Halo'}],stream:false,max_tokens:100},santri);assert.equal(r.statusCode,200,r.body);assert.equal(json(r).choices[0].message.content,'Jawaban AI PMMI');
    r=await post(app,'/v1/chat/completions',{model:'test/model',messages:[{role:'user',content:'Kedua'}],stream:false,max_tokens:100},santri);assert.equal(r.statusCode,429,r.body);

    r=await post(app,'/v1/hermes/agents',{displayName:'Coding Agent'},santri);assert.equal(r.statusCode,202,r.body);assert.ok(json(r).profileName.startsWith('pmmi-'));
    r=await app.inject({method:'GET',url:'/v1/admin/hermes',headers:admin});assert.equal(json(r).items.length,1);
    r=await app.inject({method:'GET',url:'/v1/admin/audit-logs?limit=200',headers:admin});assert.ok(json(r).items.some((x:any)=>x.action==='hermes.build_requested'));

    r=await app.inject({method:'GET',url:'/v1/dashboard',headers:santri});assert.equal(json(r).role,'SANTRI');
    r=await app.inject({method:'GET',url:'/v1/dashboard',headers:ustadzAuth});assert.equal(json(r).role,'USTADZ');
    r=await app.inject({method:'GET',url:'/v1/dashboard',headers:admin});assert.equal(json(r).role,'ADMIN');
    r=await app.inject({method:'GET',url:'/v1/portfolio/landing-page-masjid'});assert.equal(r.statusCode,200,r.body);

    const secondary=await makeApplicant(app,periodId,'Lifecycle Test','lifecycle@example.com','628111111111',admin,programId,cohortId);
    r=await patch(app,`/v1/admissions/applications/${secondary.application.id}/status`,{status:'ENROLLED'},admin);assert.equal(r.statusCode,200,r.body);const lifecycleUser=json(r);
    const student=await pool.query(`select id from students where user_id=$1`,[lifecycleUser.userId]);
    r=await patch(app,`/v1/students/${student.rows[0].id}/status`,{status:'ALUMNI'},admin);assert.equal(r.statusCode,200,r.body);let wallet=await pool.query(`select balance from ai_credit_wallets where user_id=$1`,[lifecycleUser.userId]);assert.equal(Number(wallet.rows[0].balance),0);
    r=await patch(app,`/v1/students/${student.rows[0].id}/status`,{status:'DROPOUT'},admin);assert.equal(r.statusCode,200,r.body);
    r=await post(app,`/v1/students/${student.rows[0].id}/lifecycle-communications`,{title:'Pemberitahuan status PMMI',body:'Status pendidikan telah ditinjau administrasi PMMI. Silakan hubungi admin untuk penjelasan lebih lanjut.',channels:['EMAIL']},admin);assert.equal(r.statusCode,201,r.body);

    await pool.query(`insert into ops_events(kind,severity,source,message,data) values('backup.failed','CRITICAL','test','Backup integration alert','{}')`);
    r=await app.inject({method:'GET',url:'/v1/ops/health',headers:admin});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).postgres,true);assert.equal(json(r).nineRouter.ok,true);
    r=await app.inject({method:'GET',url:'/health/ready'});assert.equal(r.statusCode,200,r.body);
    const outbox=await pool.query(`select count(*)::int count from outbox_events where processed_at is null`);assert.ok(outbox.rows[0].count>8);
  } finally {await app.close();await closeDatabase();await new Promise<void>(resolve=>router.close(()=>resolve()));}
});
