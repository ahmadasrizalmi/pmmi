import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool, withTransaction } from '../db.js';
import { requireAuth, type SessionUser } from '../security/authz.js';
import { writeAudit } from '../audit.js';
import { createActivationToken } from './auth.js';

const periodSchema = z.object({
  name: z.string().min(3), cohortYear: z.number().int().min(2020).max(2100),
  opensAt: z.string().datetime().optional(), closesAt: z.string().datetime().optional(),
  capacity: z.number().int().positive().optional(), isActive: z.boolean().default(false),
});
const applicationSchema = z.object({
  admissionPeriodId: z.string().uuid(), applicantName: z.string().min(2),
  email: z.string().email(), phone: z.string().min(8).optional(),
});
const statusSchema = z.object({ status: z.enum(['ADMIN_VERIFIED','SCREENING','INTERVIEW','ACCEPTED','WAITLISTED','REJECTED','ENROLLED']) });
const studentStatusSchema = z.object({ status: z.enum(['ACTIVE','GRADUATED','ALUMNI','DROPOUT','SUSPENDED','INACTIVE']) });

const allowed: Record<string, string[]> = {
  SUBMITTED: ['ADMIN_VERIFIED','REJECTED'], ADMIN_VERIFIED: ['SCREENING','INTERVIEW','REJECTED'],
  SCREENING: ['INTERVIEW','ACCEPTED','WAITLISTED','REJECTED'], INTERVIEW: ['ACCEPTED','WAITLISTED','REJECTED'],
  WAITLISTED: ['ACCEPTED','REJECTED'], ACCEPTED: ['ENROLLED'],
};

export async function registerAdmissionRoutes(app: FastifyInstance) {
  app.get('/v1/admissions/periods', async () => {
    const result = await pool.query(`select * from admission_periods where is_active = true and (closes_at is null or closes_at > now()) order by cohort_year desc`);
    return { items: result.rows };
  });

  app.post('/v1/admissions/periods', async (request, reply) => {
    const session = await requireAuth(request, reply, ['ADMIN']); if (!session) return;
    const parsed = periodSchema.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ error: 'invalid payload', issues: parsed.error.flatten() });
    const d = parsed.data;
    const result = await pool.query(
      `insert into admission_periods(name, cohort_year, opens_at, closes_at, capacity, is_active)
       values ($1,$2,$3,$4,$5,$6) returning *`,
      [d.name,d.cohortYear,d.opensAt ?? null,d.closesAt ?? null,d.capacity ?? null,d.isActive],
    );
    return reply.code(201).send(result.rows[0]);
  });

  app.post('/v1/admissions/applications', async (request, reply) => {
    const parsed = applicationSchema.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ error: 'invalid payload', issues: parsed.error.flatten() });
    const d = parsed.data;
    const period = await pool.query(`select id, capacity from admission_periods where id=$1 and is_active=true and (opens_at is null or opens_at <= now()) and (closes_at is null or closes_at > now())`, [d.admissionPeriodId]);
    if (!period.rowCount) return reply.code(400).send({ error: 'admission period is not open' });
    try {
      const result = await pool.query(
        `insert into applications(admission_period_id, applicant_name, email, phone, status, submitted_at)
         values ($1,$2,lower($3),$4,'SUBMITTED',now()) returning *`,
        [d.admissionPeriodId,d.applicantName,d.email,d.phone ?? null],
      );
      return reply.code(201).send(result.rows[0]);
    } catch (error: any) {
      if (error?.code === '23505') return reply.code(409).send({ error: 'application already exists for this period' });
      throw error;
    }
  });

  app.get('/v1/admissions/applications', async (request, reply) => {
    const session = await requireAuth(request, reply, ['ADMIN']); if (!session) return;
    const result = await pool.query(`select a.*, p.name period_name, p.cohort_year from applications a join admission_periods p on p.id=a.admission_period_id order by a.created_at desc`);
    return { items: result.rows };
  });

  app.patch('/v1/admissions/applications/:id/status', async (request, reply) => {
    const session = await requireAuth(request, reply, ['ADMIN']); if (!session) return;
    const { id } = request.params as { id: string };
    const parsed = statusSchema.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ error: 'invalid status' });
    const target = parsed.data.status;

    const response = await withTransaction(async (client) => {
      const currentResult = await client.query(
        `select a.*, p.cohort_year from applications a join admission_periods p on p.id=a.admission_period_id where a.id=$1 for update`, [id],
      );
      if (!currentResult.rowCount) return { kind: 'notfound' as const };
      const current = currentResult.rows[0];
      if (!allowed[current.status]?.includes(target)) return { kind: 'invalid' as const, current: current.status };

      if (target !== 'ENROLLED') {
        await client.query(`update applications set status=$1, decision_at=case when $1 in ('ACCEPTED','WAITLISTED','REJECTED') then now() else decision_at end, updated_at=now() where id=$2`, [target,id]);
        await writeAudit(client, session.sub, `admission.${target.toLowerCase()}`, 'application', id);
        return { kind: 'ok' as const, status: target };
      }

      const existingUser = await client.query(`select id from users where email=lower($1)`, [current.email]);
      let userId = existingUser.rows[0]?.id as string | undefined;
      if (!userId) {
        const user = await client.query(
          `insert into users(email, full_name, role, is_active) values (lower($1),$2,'SANTRI',false) returning id`,
          [current.email,current.applicant_name],
        );
        userId = user.rows[0].id;
      }
      const studentNumber = `PMMI-${current.cohort_year}-${String(current.id).slice(0,8).toUpperCase()}`;
      await client.query(
        `insert into students(user_id, application_id, student_number, cohort_year, status)
         values ($1,$2,$3,$4,'ACTIVE') on conflict (application_id) do nothing`,
        [userId,id,studentNumber,current.cohort_year],
      );
      await client.query(
        `insert into resource_entitlements(user_id, ai_credit_balance, hermes_agent_slots, storage_quota_bytes)
         values ($1,0,1,1073741824) on conflict (user_id) do nothing`, [userId],
      );
      await client.query(`update applications set status='ENROLLED', updated_at=now() where id=$1`, [id]);
      const activationToken = await createActivationToken(client, userId!);
      await writeAudit(client, session.sub, 'admission.enrolled', 'application', id, { userId, studentNumber });
      return { kind: 'enrolled' as const, status: 'ENROLLED', userId, studentNumber, activationToken };
    });

    if (response.kind === 'notfound') return reply.code(404).send({ error: 'application not found' });
    if (response.kind === 'invalid') return reply.code(409).send({ error: `invalid transition from ${response.current} to ${target}` });
    return response;
  });

  app.patch('/v1/students/:id/status', async (request, reply) => {
    const session = await requireAuth(request, reply, ['ADMIN']); if (!session) return;
    const { id } = request.params as { id: string };
    const parsed = studentStatusSchema.safeParse(request.body); if (!parsed.success) return reply.code(400).send({ error: 'invalid status' });
    const target = parsed.data.status;
    const result = await withTransaction(async (client) => {
      const student = await client.query(`select id,user_id,status from students where id=$1 for update`, [id]);
      if (!student.rowCount) return null;
      const s = student.rows[0];
      await client.query(
        `update students set status=$1, graduated_at=case when $1='GRADUATED' then now() else graduated_at end, ended_at=case when $1 in ('DROPOUT','INACTIVE') then now() else ended_at end where id=$2`, [target,id],
      );
      const disableLogin = ['DROPOUT','INACTIVE'].includes(target);
      await client.query(`update users set is_active=$1, updated_at=now() where id=$2`, [!disableLogin,s.user_id]);
      if (['GRADUATED','ALUMNI','DROPOUT','INACTIVE'].includes(target)) {
        await client.query(`update resource_entitlements set ai_credit_balance=0, hermes_agent_slots=0, updated_at=now() where user_id=$1`, [s.user_id]);
      }
      await writeAudit(client, session.sub, 'student.status_changed', 'student', id, { from: s.status, to: target });
      return { id, status: target };
    });
    if (!result) return reply.code(404).send({ error: 'student not found' });
    return result;
  });
}
