import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { buildApp } from './app.js';
import { closeDatabase, pool } from './db.js';

const json=(response:any)=>response.json() as any;
const post=(app:any,url:string,payload:any,headers:any={})=>app.inject({method:'POST',url,headers,payload});

async function startRouterMock(){
  const server=http.createServer((req,res)=>{res.setHeader('content-type','application/json');if(req.url==='/v1/models'){res.end(JSON.stringify({object:'list',data:[{id:'test/model',object:'model'}]}));return;}if(req.url==='/v1/chat/completions'&&req.method==='POST'){let body='';req.on('data',c=>body+=c);req.on('end',()=>{const parsed=JSON.parse(body||'{}');res.end(JSON.stringify({id:'chatcmpl-test',object:'chat.completion',model:parsed.model,provider:'mock',choices:[{index:0,message:{role:'assistant',content:'Jawaban AI PMMI'},finish_reason:'stop'}],usage:{prompt_tokens:100,completion_tokens:50,total_tokens:150}}));});return;}res.statusCode=404;res.end(JSON.stringify({error:'not found'}));});
  await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(20129,'127.0.0.1',()=>resolve());});return server;
}

test('PMMI blueprint end-to-end API flow',async()=>{
  await pool.query(`truncate table users,admission_periods,courses,cohorts,programs,reward_rules,outbox_events,notifications,ops_events,backup_runs restart identity cascade`);
  await pool.query(`insert into ai_model_permissions(role,model_pattern,enabled,max_requests_per_hour) values('ADMIN','*',true,null),('USTADZ','*',true,null),('SANTRI','*',true,1) on conflict(role,model_pattern) do update set enabled=true,max_requests_per_hour=excluded.max_requests_per_hour`);
  const router=await startRouterMock();const app=await buildApp();await app.ready();
  try{
    let response=await post(app,'/v1/auth/bootstrap-admin',{email:'admin@pondokmultimedia.id',password:'Admin12345!',fullName:'PMMI Admin'},{'x-bootstrap-token':process.env.BOOTSTRAP_ADMIN_TOKEN!});assert.equal(response.statusCode,201,response.body);
    response=await post(app,'/v1/auth/login',{email:'admin@pondokmultimedia.id',password:'Admin12345!'});assert.equal(response.statusCode,200,response.body);const adminToken=json(response).token;const admin={authorization:`Bearer ${adminToken}`};

    response=await post(app,'/v1/admin/users',{email:'ustadz@pondokmultimedia.id',fullName:'Ustadz Test',role:'USTADZ',aiCredits:25,hermesSlots:1},admin);assert.equal(response.statusCode,201,response.body);const ustadz=json(response);assert.ok(ustadz.activationToken);
    response=await post(app,'/v1/auth/activate',{token:ustadz.activationToken,password:'Ustadz12345!'});assert.equal(response.statusCode,200,response.body);
    response=await post(app,'/v1/auth/login',{email:'ustadz@pondokmultimedia.id',password:'Ustadz12345!'});assert.equal(response.statusCode,200,response.body);const ustadzAuth={authorization:`Bearer ${json(response).token}`};

    response=await post(app,'/v1/catalog/programs',{code:'PROGRAMMER',name:'Programmer',description:'Coding'},admin);assert.equal(response.statusCode,201,response.body);const programId=json(response).id;
    response=await post(app,'/v1/catalog/cohorts',{name:'Angkatan 2027',year:2027,isActive:true},admin);assert.equal(response.statusCode,201,response.body);const cohortId=json(response).id;
    response=await post(app,'/v1/admissions/periods',{name:'Penerimaan 2027',cohortYear:2027,isActive:true},admin);assert.equal(response.statusCode,201,response.body);const periodId=json(response).id;

    response=await post(app,'/v1/admissions/applications',{admissionPeriodId:periodId,applicantName:'Santri Test',email:'santri@example.com',phone:'628123456789'});assert.equal(response.statusCode,201,response.body);const application=json(response);assert.ok(application.applicantToken);
    let applicantHeaders={'x-applicant-token':application.applicantToken};
    response=await app.inject({method:'GET',url:`/v1/admissions/applications/${application.id}/self`,headers:applicantHeaders});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).status,'SUBMITTED');
    response=await post(app,`/v1/admin/admissions/applications/${application.id}/access-token`,{},admin);assert.equal(response.statusCode,200,response.body);const recoveredToken=json(response).applicantToken;assert.ok(recoveredToken);
    response=await app.inject({method:'GET',url:`/v1/admissions/applications/${application.id}/self`,headers:applicantHeaders});assert.equal(response.statusCode,401,response.body);
    applicantHeaders={'x-applicant-token':recoveredToken};
    response=await app.inject({method:'GET',url:`/v1/admissions/applications/${application.id}/self`,headers:applicantHeaders});assert.equal(response.statusCode,200,response.body);

    response=await post(app,`/v1/admissions/applications/${application.id}/documents/upload`,{kind:'IDENTITY',originalName:'ktp.txt',contentType:'text/plain'},applicantHeaders);assert.equal(response.statusCode,201,response.body);const docUpload=json(response);const docPut=await fetch(docUpload.url,{method:'PUT',body:'identity',headers:{'content-type':'text/plain'}});assert.ok(docPut.ok);
    response=await post(app,`/v1/admissions/applications/${application.id}/documents/complete`,{uploadId:docUpload.uploadId},applicantHeaders);assert.equal(response.statusCode,201,response.body);
    response=await post(app,`/v1/admissions/applications/${application.id}/reviews`,{status:'APPROVED',notes:'Lengkap'},admin);assert.equal(response.statusCode,201,response.body);
    for(const status of ['ADMIN_VERIFIED','SCREENING']){response=await app.inject({method:'PATCH',url:`/v1/admissions/applications/${application.id}/status`,headers:admin,payload:{status}});assert.equal(response.statusCode,200,response.body);}
    response=await post(app,`/v1/admissions/applications/${application.id}/scores`,{category:'PORTFOLIO',score:90,maxScore:100},admin);assert.equal(response.statusCode,201,response.body);
    response=await post(app,`/v1/admissions/applications/${application.id}/interviews`,{scheduledAt:new Date(Date.now()+86400000).toISOString(),location:'PMMI'},admin);assert.equal(response.statusCode,201,response.body);
    response=await post(app,`/v1/admissions/applications/${application.id}/decision`,{decision:'ACCEPTED',reason:'Lulus seleksi'},admin);assert.equal(response.statusCode,201,response.body);
    response=await app.inject({method:'PUT',url:`/v1/admissions/applications/${application.id}/registration`,headers:applicantHeaders,payload:{programId,cohortId,metadata:{shirtSize:'L'}}});assert.equal(response.statusCode,200,response.body);
    response=await app.inject({method:'GET',url:`/v1/admissions/applications/${application.id}/self`,headers:applicantHeaders});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).registration.program_id,programId);
    response=await app.inject({method:'PATCH',url:`/v1/admissions/applications/${application.id}/status`,headers:admin,payload:{status:'ENROLLED'}});assert.equal(response.statusCode,200,response.body);const enrolled=json(response);assert.ok(enrolled.activationToken);assert.ok(enrolled.userId);
    response=await post(app,'/v1/auth/activate',{token:enrolled.activationToken,password:'Santri12345!'});assert.equal(response.statusCode,200,response.body);
    response=await post(app,'/v1/auth/login',{email:'santri@example.com',password:'Santri12345!'});assert.equal(response.statusCode,200,response.body);const studentAuth={authorization:`Bearer ${json(response).token}`};

    response=await post(app,'/v1/rewards/rules',{code:'GRADE_EXCELLENCE',name:'Nilai Istimewa',triggerType:'grade.changed',aiCredits:20,hermesSlots:0,metadata:{minScore:90}},admin);assert.equal(response.statusCode,201,response.body);
    response=await post(app,'/v1/academic/courses',{code:'WEB101',name:'Web Development'},admin);assert.equal(response.statusCode,201,response.body);const courseId=json(response).id;
    response=await post(app,'/v1/academic/classes',{courseId,teacherUserId:ustadz.id,name:'Web Angkatan 2027'},admin);assert.equal(response.statusCode,201,response.body);const classId=json(response).id;
    response=await post(app,`/v1/academic/classes/${classId}/enroll`,{studentUserId:enrolled.userId},admin);assert.equal(response.statusCode,201,response.body);
    response=await post(app,'/v1/academic/sessions',{classId,title:'Kelas Web',startsAt:new Date(Date.now()+30*60000).toISOString(),endsAt:new Date(Date.now()+90*60000).toISOString(),location:'Lab PMMI'},ustadzAuth);assert.equal(response.statusCode,201,response.body);const sessionId=json(response).id;
    response=await app.inject({method:'PUT',url:`/v1/academic/sessions/${sessionId}/attendance`,headers:ustadzAuth,payload:{records:[{studentUserId:enrolled.userId,status:'PRESENT'}]}});assert.equal(response.statusCode,200,response.body);
    response=await app.inject({method:'GET',url:'/v1/academic/schedule',headers:studentAuth});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).items.length,1);

    response=await post(app,'/v1/academic/assignments',{classId,title:'Landing Page Masjid',maxScore:100,dueAt:new Date(Date.now()+2*3600000).toISOString()},ustadzAuth);assert.equal(response.statusCode,201,response.body);const assignmentId=json(response).id;
    response=await post(app,`/v1/academic/assignments/${assignmentId}/uploads`,{originalName:'index.html',contentType:'text/html'},studentAuth);assert.equal(response.statusCode,201,response.body);const upload=json(response);const uploadPut=await fetch(upload.url,{method:'PUT',body:'<html>PMMI</html>',headers:{'content-type':'text/html'}});assert.ok(uploadPut.ok);
    response=await post(app,`/v1/academic/assignments/${assignmentId}/submissions`,{uploadIds:[upload.uploadId],notes:'Tugas pertama'},studentAuth);assert.equal(response.statusCode,201,response.body);const submissionId=json(response).id;
    response=await post(app,`/v1/academic/submissions/${submissionId}/grade`,{score:92,feedback:'Bagus',revisionRequired:false},ustadzAuth);assert.equal(response.statusCode,200,response.body);
    response=await app.inject({method:'GET',url:'/v1/academic/my/grades',headers:studentAuth});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).items[0].score,'92.00');
    response=await post(app,`/v1/academic/submissions/${submissionId}/feature`,{title:'Landing Page Masjid',slug:'landing-page-masjid',summary:'Karya santri'},ustadzAuth);assert.equal(response.statusCode,201,response.body);assert.equal(json(response).requiresStudentApproval,false);
    response=await post(app,'/v1/academic/certificates',{studentUserId:enrolled.userId,title:'Web Development',certificateNo:'PMMI-2027-001'},admin);assert.equal(response.statusCode,201,response.body);
    response=await app.inject({method:'GET',url:'/v1/academic/my/certificates',headers:studentAuth});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).items.length,1);

    response=await app.inject({method:'PUT',url:'/v1/notifications/channels',headers:studentAuth,payload:{channel:'EMAIL',address:'santri@example.com'}});assert.equal(response.statusCode,200,response.body);
    response=await post(app,'/v1/notifications/telegram/link-token',{},studentAuth);assert.equal(response.statusCode,200,response.body);assert.ok(json(response).token);

    response=await app.inject({method:'GET',url:'/v1/models',headers:studentAuth});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).data[0].id,'test/model');
    response=await app.inject({method:'GET',url:'/v1/ai/wallet',headers:studentAuth});assert.equal(response.statusCode,200,response.body);const beforeCredits=Number(json(response).balance);assert.ok(beforeCredits>0);
    response=await post(app,'/v1/chat/completions',{model:'test/model',messages:[{role:'user',content:'Halo PMMI'}],stream:false,max_tokens:100},studentAuth);assert.equal(response.statusCode,200,response.body);assert.equal(json(response).choices[0].message.content,'Jawaban AI PMMI');
    response=await post(app,'/v1/chat/completions',{model:'test/model',messages:[{role:'user',content:'Kedua'}],stream:false,max_tokens:100},studentAuth);assert.equal(response.statusCode,429,response.body);
    response=await app.inject({method:'GET',url:'/v1/ai/wallet',headers:studentAuth});assert.ok(Number(json(response).balance)<beforeCredits);

    response=await post(app,'/v1/hermes/agents',{displayName:'Coding Agent'},studentAuth);assert.equal(response.statusCode,202,response.body);const agent=json(response);assert.ok(agent.profileName.startsWith('pmmi-'));
    response=await app.inject({method:'GET',url:'/v1/admin/hermes',headers:admin});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).items.length,1);
    response=await app.inject({method:'GET',url:'/v1/admin/audit-logs?limit=200',headers:admin});assert.equal(response.statusCode,200,response.body);assert.ok(json(response).items.some((x:any)=>x.action==='hermes.build_requested'));

    response=await app.inject({method:'GET',url:'/v1/dashboard',headers:studentAuth});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).role,'SANTRI');
    response=await app.inject({method:'GET',url:'/v1/dashboard',headers:ustadzAuth});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).role,'USTADZ');
    response=await app.inject({method:'GET',url:'/v1/dashboard',headers:admin});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).role,'ADMIN');
    response=await app.inject({method:'GET',url:'/v1/portfolio/landing-page-masjid'});assert.equal(response.statusCode,200,response.body);
    response=await app.inject({method:'GET',url:'/v1/ops/health',headers:admin});assert.equal(response.statusCode,200,response.body);assert.equal(json(response).postgres,true);assert.equal(json(response).nineRouter.ok,true);
    response=await app.inject({method:'GET',url:'/health/ready'});assert.equal(response.statusCode,200,response.body);

    response=await post(app,'/v1/admissions/applications',{admissionPeriodId:periodId,applicantName:'Alumni Test',email:'alumni@example.com',phone:'628111111111'});const app2=json(response);for(const status of ['ADMIN_VERIFIED','SCREENING','ACCEPTED']){response=await app.inject({method:'PATCH',url:`/v1/admissions/applications/${app2.id}/status`,headers:admin,payload:{status}});assert.equal(response.statusCode,200,response.body);}response=await app.inject({method:'PATCH',url:`/v1/admissions/applications/${app2.id}/status`,headers:admin,payload:{status:'ENROLLED'}});const enrolled2=json(response);const student2=await pool.query(`select id from students where user_id=$1`,[enrolled2.userId]);
    response=await app.inject({method:'PATCH',url:`/v1/students/${student2.rows[0].id}/status`,headers:admin,payload:{status:'ALUMNI'}});assert.equal(response.statusCode,200,response.body);const wallet2=await pool.query(`select balance from ai_credit_wallets where user_id=$1`,[enrolled2.userId]);assert.equal(Number(wallet2.rows[0].balance),0);
    response=await app.inject({method:'PATCH',url:`/v1/students/${student2.rows[0].id}/status`,headers:admin,payload:{status:'DROPOUT'}});assert.equal(response.statusCode,200,response.body);
    response=await post(app,`/v1/students/${student2.rows[0].id}/lifecycle-communications`,{title:'Pemberitahuan status PMMI',body:'Status pendidikan Anda telah ditinjau oleh administrasi PMMI. Silakan menghubungi admin untuk detail lebih lanjut.',channels:['EMAIL']},admin);assert.equal(response.statusCode,201,response.body);
    const lifecycleOutbox=await pool.query(`select count(*)::int count from outbox_events where topic='student.lifecycle_communication_approved'`);assert.equal(lifecycleOutbox.rows[0].count,1);

    await pool.query(`insert into ops_events(kind,severity,source,message,data) values('backup.failed','CRITICAL','test','Backup integration alert','{}')`);
    const opsOutbox=await pool.query(`select count(*)::int count from outbox_events where topic='ops.event'`);assert.ok(opsOutbox.rows[0].count>=1);
    const outbox=await pool.query(`select count(*)::int count from outbox_events where processed_at is null`);assert.ok(outbox.rows[0].count>8);
  } finally {await app.close();await closeDatabase();await new Promise<void>(resolve=>router.close(()=>resolve()));}
});
