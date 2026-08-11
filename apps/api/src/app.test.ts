import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from './app.js';
import { closeDatabase, pool } from './db.js';

const json = (response: any) => response.json() as any;

test('phase 1+2 end-to-end lifecycle and academic flow', async () => {
  await pool.query(`truncate table submission_upload_intents, account_activation_tokens, portfolio_projects, certificates, grades, submission_files, submissions, assignments, enrollments, classes, courses, resource_entitlements, students, applications, admission_periods, audit_logs, users restart identity cascade`);
  const app = await buildApp();
  await app.ready();

  try {
    let response = await app.inject({ method:'POST', url:'/v1/auth/bootstrap-admin', headers:{'x-bootstrap-token':process.env.BOOTSTRAP_ADMIN_TOKEN!}, payload:{email:'admin@pondokmultimedia.id',password:'Admin12345!',fullName:'PMMI Admin'} });
    assert.equal(response.statusCode, 201, response.body);

    response = await app.inject({ method:'POST', url:'/v1/auth/login', payload:{email:'admin@pondokmultimedia.id',password:'Admin12345!'} });
    assert.equal(response.statusCode, 200, response.body);
    const adminToken = json(response).token as string;
    const auth = { authorization:`Bearer ${adminToken}` };

    response = await app.inject({ method:'POST', url:'/v1/admissions/periods', headers:auth, payload:{name:'Penerimaan 2027',cohortYear:2027,isActive:true} });
    assert.equal(response.statusCode, 201, response.body);
    const periodId=json(response).id;

    response = await app.inject({ method:'POST', url:'/v1/admissions/applications', payload:{admissionPeriodId:periodId,applicantName:'Santri Test',email:'santri@example.com',phone:'081234567890'} });
    assert.equal(response.statusCode, 201, response.body);
    const applicationId=json(response).id;

    for (const status of ['ADMIN_VERIFIED','SCREENING','ACCEPTED']) {
      response=await app.inject({method:'PATCH',url:`/v1/admissions/applications/${applicationId}/status`,headers:auth,payload:{status}});
      assert.equal(response.statusCode,200,response.body);
    }
    response=await app.inject({method:'PATCH',url:`/v1/admissions/applications/${applicationId}/status`,headers:auth,payload:{status:'ENROLLED'}});
    assert.equal(response.statusCode,200,response.body);
    const enrolled=json(response);
    assert.ok(enrolled.activationToken);

    response=await app.inject({method:'POST',url:'/v1/auth/activate',payload:{token:enrolled.activationToken,password:'Santri12345!'}});
    assert.equal(response.statusCode,200,response.body);
    response=await app.inject({method:'POST',url:'/v1/auth/login',payload:{email:'santri@example.com',password:'Santri12345!'}});
    assert.equal(response.statusCode,200,response.body);
    const studentToken=json(response).token;
    const studentAuth={authorization:`Bearer ${studentToken}`};

    response=await app.inject({method:'POST',url:'/v1/academic/courses',headers:auth,payload:{code:'WEB101',name:'Web Development'}});
    assert.equal(response.statusCode,201,response.body); const courseId=json(response).id;
    response=await app.inject({method:'POST',url:'/v1/academic/classes',headers:auth,payload:{courseId,name:'Web Angkatan 2027'}});
    assert.equal(response.statusCode,201,response.body); const classId=json(response).id;
    response=await app.inject({method:'POST',url:`/v1/academic/classes/${classId}/enroll`,headers:auth,payload:{studentUserId:enrolled.userId}});
    assert.equal(response.statusCode,201,response.body);

    response=await app.inject({method:'POST',url:'/v1/academic/assignments',headers:auth,payload:{classId,title:'Landing Page Masjid',maxScore:100}});
    assert.equal(response.statusCode,201,response.body); const assignmentId=json(response).id;

    response=await app.inject({method:'POST',url:`/v1/academic/assignments/${assignmentId}/uploads`,headers:studentAuth,payload:{originalName:'index.html',contentType:'text/html'}});
    assert.equal(response.statusCode,201,response.body); const upload=json(response);
    const uploadResponse=await fetch(upload.url,{method:'PUT',body:'<html>PMMI</html>',headers:{'content-type':'text/html'}});
    assert.ok(uploadResponse.ok,`MinIO PUT failed: ${uploadResponse.status}`);

    response=await app.inject({method:'POST',url:`/v1/academic/assignments/${assignmentId}/submissions`,headers:studentAuth,payload:{uploadIds:[upload.uploadId],notes:'Tugas pertama'}});
    assert.equal(response.statusCode,201,response.body); const submissionId=json(response).id;

    response=await app.inject({method:'POST',url:`/v1/academic/submissions/${submissionId}/grade`,headers:auth,payload:{score:92,feedback:'Bagus',revisionRequired:false}});
    assert.equal(response.statusCode,200,response.body);

    response=await app.inject({method:'GET',url:'/v1/academic/my/grades',headers:studentAuth});
    assert.equal(response.statusCode,200,response.body); assert.equal(json(response).items[0].score,'92.00');

    response=await app.inject({method:'POST',url:`/v1/academic/submissions/${submissionId}/feature`,headers:auth,payload:{title:'Landing Page Masjid',slug:'landing-page-masjid',summary:'Karya santri'}});
    assert.equal(response.statusCode,201,response.body); assert.equal(json(response).requiresStudentApproval,false);

    response=await app.inject({method:'GET',url:'/v1/portfolio'});
    assert.equal(response.statusCode,200,response.body); assert.equal(json(response).items.length,1);

    const audit=await pool.query(`select count(*)::int count from audit_logs`);
    assert.ok(audit.rows[0].count>=3);
  } finally {
    await app.close();
    await closeDatabase();
  }
});
