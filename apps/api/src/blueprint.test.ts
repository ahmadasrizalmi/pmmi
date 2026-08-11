import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { buildBlueprintApp } from './blueprintApp.js';
import { closeDatabase,pool } from './db.js';

const json=(response:any)=>response.json() as any;
const startRouterMock=()=>new Promise<http.Server>((resolve,reject)=>{const server=http.createServer(async(req,res)=>{res.setHeader('content-type','application/json');if(req.method==='GET'&&req.url==='/v1/models'){res.end(JSON.stringify({object:'list',data:[{id:'test/model',object:'model'}]}));return;}if(req.method==='POST'&&req.url==='/v1/chat/completions'){let body='';for await(const chunk of req)body+=String(chunk);const parsed=JSON.parse(body||'{}');res.end(JSON.stringify({id:'chatcmpl-test',object:'chat.completion',model:parsed.model,choices:[{index:0,message:{role:'assistant',content:'Jawaban mock 9Router'},finish_reason:'stop'}],usage:{prompt_tokens:40,completion_tokens:20,total_tokens:60}}));return;}res.statusCode=404;res.end(JSON.stringify({error:'not found'}));});server.once('error',reject);server.listen(20128,'127.0.0.1',()=>resolve(server));});

test('complete PMMI blueprint cross-domain journey',async()=>{
  await pool.query(`truncate table users,admission_periods,programs,courses,notification_outbox,notification_provider_health,system_health_events,backup_runs,service_heartbeats restart identity cascade`);
  const router=await startRouterMock();const app=await buildBlueprintApp();await app.ready();
  try{
    let r=await app.inject({method:'POST',url:'/v1/auth/bootstrap-admin',headers:{'x-bootstrap-token':process.env.BOOTSTRAP_ADMIN_TOKEN!},payload:{email:'admin@pondokmultimedia.id',password:'Admin12345!',fullName:'PMMI Admin'}});assert.equal(r.statusCode,201,r.body);
    r=await app.inject({method:'POST',url:'/v1/auth/login',payload:{email:'admin@pondokmultimedia.id',password:'Admin12345!'}});assert.equal(r.statusCode,200,r.body);const adminToken=json(r).token;const admin={authorization:`Bearer ${adminToken}`};

    r=await app.inject({method:'POST',url:'/v1/admin/teachers',headers:admin,payload:{email:'ustadz@example.com',fullName:'Ustadz Test',specialization:'Programming'}});assert.equal(r.statusCode,201,r.body);const teacher=json(r);
    r=await app.inject({method:'POST',url:'/v1/auth/activate',payload:{token:teacher.activationToken,password:'Ustadz12345!'}});assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'POST',url:'/v1/auth/login',payload:{email:'ustadz@example.com',password:'Ustadz12345!'}});assert.equal(r.statusCode,200,r.body);const ustadz={authorization:`Bearer ${json(r).token}`};

    r=await app.inject({method:'POST',url:'/v1/admin/programs',headers:admin,payload:{code:'PROGRAMMER',name:'Programmer'}});assert.equal(r.statusCode,201,r.body);const programId=json(r).id;
    r=await app.inject({method:'POST',url:'/v1/admin/cohorts',headers:admin,payload:{name:'Programmer 2027',cohortYear:2027,programId}});assert.equal(r.statusCode,201,r.body);const cohortId=json(r).id;
    r=await app.inject({method:'POST',url:'/v1/admissions/periods',headers:admin,payload:{name:'Penerimaan 2027',cohortYear:2027,isActive:true}});assert.equal(r.statusCode,201,r.body);const periodId=json(r).id;

    r=await app.inject({method:'POST',url:'/v1/admissions/applications',payload:{admissionPeriodId:periodId,applicantName:'Santri Test',email:'santri@example.com',phone:'6281234567890'}});assert.equal(r.statusCode,201,r.body);const applicationId=json(r).id;
    r=await app.inject({method:'POST',url:`/v1/admissions/applications/${applicationId}/access-token`,payload:{email:'santri@example.com',phone:'6281234567890'}});assert.equal(r.statusCode,200,r.body);const applicationToken=json(r).token;const applicant={'x-application-token':applicationToken};
    r=await app.inject({method:'PATCH',url:`/v1/admissions/applications/${applicationId}/program`,headers:applicant,payload:{programId}});assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'GET',url:`/v1/admissions/applications/${applicationId}/status`,headers:applicant});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).status,'SUBMITTED');

    r=await app.inject({method:'POST',url:`/v1/admissions/applications/${applicationId}/documents/upload`,headers:applicant,payload:{documentType:'IDENTITY',originalName:'identity.txt',contentType:'text/plain'}});assert.equal(r.statusCode,201,r.body);const documentUpload=json(r);let uploadResponse=await fetch(documentUpload.url,{method:'PUT',body:'PMMI identity',headers:{'content-type':'text/plain'}});assert.ok(uploadResponse.ok);
    r=await app.inject({method:'POST',url:`/v1/admissions/applications/${applicationId}/documents/complete`,headers:applicant,payload:{uploadId:documentUpload.uploadId}});assert.equal(r.statusCode,201,r.body);const documentId=json(r).id;
    r=await app.inject({method:'PATCH',url:`/v1/admin/admissions/documents/${documentId}`,headers:admin,payload:{status:'VERIFIED'}});assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'POST',url:`/v1/admin/admissions/applications/${applicationId}/reviews`,headers:admin,payload:{verdict:'PASS',notes:'Dokumen lengkap'}});assert.equal(r.statusCode,201,r.body);
    r=await app.inject({method:'POST',url:`/v1/admin/admissions/applications/${applicationId}/scores`,headers:admin,payload:{criterion:'potensi',score:90,maxScore:100}});assert.equal(r.statusCode,201,r.body);
    for(const status of ['ADMIN_VERIFIED','SCREENING']){r=await app.inject({method:'PATCH',url:`/v1/admissions/applications/${applicationId}/status`,headers:admin,payload:{status}});assert.equal(r.statusCode,200,r.body);}
    r=await app.inject({method:'POST',url:`/v1/admin/admissions/applications/${applicationId}/interviews`,headers:admin,payload:{scheduledAt:'2027-01-01T10:00:00.000Z',locationOrUrl:'PMMI Campus'}});assert.equal(r.statusCode,201,r.body);
    r=await app.inject({method:'POST',url:`/v1/admin/admissions/applications/${applicationId}/decision`,headers:admin,payload:{decision:'ACCEPTED',reason:'Lulus seleksi'}});assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'POST',url:`/v1/admin/admissions/applications/${applicationId}/registration`,headers:admin,payload:{status:'COMPLETED',metadata:{confirmed:true}}});assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'POST',url:`/v1/admin/admissions/applications/${applicationId}/enroll`,headers:admin});assert.equal(r.statusCode,200,r.body);const enrolled=json(r);assert.match(enrolled.activationUrl,/activate=/);
    assert.equal((await pool.query(`select count(*)::int count from notification_outbox where event_type='onboarding.activation' and source_id=$1`,[applicationId])).rows[0].count,1);

    r=await app.inject({method:'POST',url:'/v1/auth/activate',payload:{token:enrolled.activationToken,password:'Santri12345!'}});assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'POST',url:'/v1/auth/login',payload:{email:'santri@example.com',password:'Santri12345!'}});assert.equal(r.statusCode,200,r.body);const santri={authorization:`Bearer ${json(r).token}`};

    r=await app.inject({method:'POST',url:'/v1/admin/ai/credits/grant',headers:admin,payload:{userId:enrolled.userId,amount:20,reason:'Initial student credits'}});assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'GET',url:'/v1/ai/models',headers:santri});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).data[0].id,'test/model');
    r=await app.inject({method:'POST',url:'/v1/ai/chat/completions',headers:santri,payload:{model:'test/model',messages:[{role:'user',content:'Assalamualaikum'}],max_tokens:1000}});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).choices[0].message.content,'Jawaban mock 9Router');
    r=await app.inject({method:'GET',url:'/v1/ai/wallet',headers:santri});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).balance,19);
    r=await app.inject({method:'POST',url:'/v1/ai/api-keys',headers:santri,payload:{label:'Hermes Test'}});assert.equal(r.statusCode,201,r.body);const apiKey=json(r).apiKey;assert.match(apiKey,/^pmmi_/);
    r=await app.inject({method:'GET',url:'/v1/models',headers:{authorization:`Bearer ${apiKey}`}});assert.equal(r.statusCode,200,r.body);

    r=await app.inject({method:'POST',url:'/v1/academic/courses',headers:admin,payload:{code:'WEB101',name:'Web Development'}});assert.equal(r.statusCode,201,r.body);const courseId=json(r).id;
    r=await app.inject({method:'POST',url:'/v1/admin/classes',headers:admin,payload:{courseId,cohortId,teacherUserId:teacher.id,name:'Web Angkatan 2027'}});assert.equal(r.statusCode,201,r.body);const classId=json(r).id;
    r=await app.inject({method:'GET',url:'/v1/academic/classes',headers:santri});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).items.length,1);
    r=await app.inject({method:'POST',url:`/v1/academic/classes/${classId}/sessions`,headers:ustadz,payload:{title:'Kelas HTML',startsAt:'2027-01-02T09:00:00.000Z',location:'Lab PMMI'}});assert.equal(r.statusCode,201,r.body);const classSessionId=json(r).id;
    r=await app.inject({method:'PUT',url:`/v1/academic/sessions/${classSessionId}/attendance`,headers:ustadz,payload:{records:[{studentUserId:enrolled.userId,status:'PRESENT'}]}});assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'GET',url:'/v1/academic/my/attendance',headers:santri});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).items[0].status,'PRESENT');

    r=await app.inject({method:'POST',url:'/v1/academic/assignments',headers:ustadz,payload:{classId,title:'Landing Page Masjid',maxScore:100,dueAt:'2027-01-10T10:00:00.000Z'}});assert.equal(r.statusCode,201,r.body);const assignmentId=json(r).id;
    r=await app.inject({method:'POST',url:`/v1/academic/assignments/${assignmentId}/uploads`,headers:santri,payload:{originalName:'index.html',contentType:'text/html'}});assert.equal(r.statusCode,201,r.body);const upload=json(r);uploadResponse=await fetch(upload.url,{method:'PUT',body:'<html>PMMI</html>',headers:{'content-type':'text/html'}});assert.ok(uploadResponse.ok);
    r=await app.inject({method:'POST',url:`/v1/academic/assignments/${assignmentId}/submissions`,headers:santri,payload:{uploadIds:[upload.uploadId],notes:'Tugas pertama'}});assert.equal(r.statusCode,201,r.body);const submissionId=json(r).id;
    r=await app.inject({method:'GET',url:`/v1/academic/classes/${classId}/submissions`,headers:ustadz});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).items[0].id,submissionId);
    r=await app.inject({method:'GET',url:`/v1/academic/submissions/${submissionId}/files`,headers:ustadz});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).items.length,1);
    r=await app.inject({method:'POST',url:`/v1/academic/submissions/${submissionId}/grade`,headers:ustadz,payload:{score:92,feedback:'Bagus',revisionRequired:false}});assert.equal(r.statusCode,200,r.body);

    r=await app.inject({method:'POST',url:'/v1/admin/rewards',headers:admin,payload:{code:'HIGH_SCORE',name:'High Score',aiCredits:5,agentSlots:1,badge:'🏆'}});assert.equal(r.statusCode,201,r.body);const rewardId=json(r).id;
    r=await app.inject({method:'POST',url:'/v1/admin/reward-rules',headers:admin,payload:{rewardId,eventType:'submission.graded',criteria:{minScore:90,courseCode:'WEB101'}}});assert.equal(r.statusCode,201,r.body);
    r=await app.inject({method:'POST',url:`/v1/admin/rewards/evaluate-grade/${submissionId}`,headers:admin});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).granted.length,1);
    r=await app.inject({method:'GET',url:'/v1/rewards/achievements',headers:santri});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).items.length,1);

    r=await app.inject({method:'POST',url:'/v1/hermes/build',headers:santri,payload:{name:'coder',role:'coder'}});assert.equal(r.statusCode,202,r.body);assert.equal(json(r).job.status,'PENDING');
    r=await app.inject({method:'GET',url:'/v1/hermes/profiles',headers:santri});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).items.length,1);

    r=await app.inject({method:'POST',url:`/v1/academic/submissions/${submissionId}/feature`,headers:ustadz,payload:{title:'Landing Page Masjid',slug:'landing-page-masjid',summary:'Karya santri'}});assert.equal(r.statusCode,201,r.body);const portfolioId=json(r).id;assert.equal(json(r).requiresStudentApproval,false);
    r=await app.inject({method:'POST',url:`/v1/admin/portfolio/${portfolioId}/assets`,headers:ustadz,payload:{bucket:process.env.MINIO_BUCKET!,objectKey:upload.objectKey,assetType:'source',altText:'Source HTML'}});assert.equal(r.statusCode,201,r.body);
    r=await app.inject({method:'GET',url:'/v1/portfolio/landing-page-masjid'});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).assets.length,1);
    r=await app.inject({method:'POST',url:'/v1/academic/certificates',headers:admin,payload:{studentUserId:enrolled.userId,title:'Sertifikat Web',certificateNo:'PMMI-WEB-001',objectKey:upload.objectKey,metadata:{course:'WEB101'}}});assert.equal(r.statusCode,201,r.body);
    r=await app.inject({method:'GET',url:'/v1/certificates/PMMI-WEB-001/verify'});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).valid,true);

    r=await app.inject({method:'GET',url:'/v1/dashboard/summary',headers:santri});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).role,'SANTRI');
    r=await app.inject({method:'GET',url:'/v1/dashboard/summary',headers:ustadz});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).role,'USTADZ');
    r=await app.inject({method:'GET',url:'/v1/admin/ops/status',headers:admin});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).database.status,'OK');assert.equal(json(r).nineRouter.status,'OK');

    r=await app.inject({method:'POST',url:`/v1/admin/students/${enrolled.studentId}/lifecycle`,headers:admin,payload:{status:'SUSPENDED'}});assert.equal(r.statusCode,200,r.body);
    r=await app.inject({method:'GET',url:'/v1/admin/communications',headers:admin});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).items.length,1);const communicationId=json(r).items[0].id;
    r=await app.inject({method:'POST',url:`/v1/admin/communications/${communicationId}/review`,headers:admin,payload:{action:'APPROVE',title:'Pemberitahuan akun',body:'Silakan menghubungi administrasi PMMI untuk informasi lebih lanjut.',channels:['EMAIL']}});assert.equal(r.statusCode,200,r.body);assert.equal(json(r).kind,'approved');
    assert.ok((await pool.query(`select count(*)::int count from audit_logs`)).rows[0].count>=8);
    assert.ok((await pool.query(`select count(*)::int count from notification_outbox`)).rows[0].count>=8);
  }finally{await app.close();await closeDatabase();await new Promise<void>(resolve=>router.close(()=>resolve()));}
});
