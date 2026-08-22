import React, { useState } from 'react';
import { api } from '../api';
import { useData, Notice, Empty, SearchBox, useSearch, ConfirmDelete, Field } from './common';

/* ---------- Overview ---------- */
export function AdminOverviewPanel() {
  const health = useData<Record<string, unknown>>('/v1/ops/health');
  const users = useData<{ items: Array<Record<string, unknown>> }>('/v1/admin/users');
  const apps = useData<{ items: Array<Record<string, unknown>> }>('/v1/admissions/applications');
  const santri = (users.data?.items ?? []).filter(u => u.role === 'SANTRI');
  const active = santri.filter(s => s.student_status === 'ACTIVE').length;
  const h = health.data ?? {};
  const nine = (h.nineRouter as Record<string, unknown>) ?? {};
  return (
    <div className="stack">
      <h2>Ringkasan</h2>
      <div className="grid">
        <div className="card"><h3>Santri</h3><div className="stat">{santri.length} total · {active} aktif</div></div>
        <div className="card"><h3>Pendaftar</h3><div className="stat">{apps.data?.items?.length ?? 0} aplikasi</div></div>
        <div className="card"><h3>PostgreSQL</h3><div className="stat">{String(h.postgres)}</div></div>
        <div className="card"><h3>MinIO</h3><div className="stat">{String(h.minio)}</div></div>
        <div className="card"><h3>9Router</h3><div className="stat">{nine.ok ? `OK (${nine.status})` : 'turun'}</div></div>
        <div className="card"><h3>Outbox</h3><div className="stat">{String(h.outboxPending ?? 0)} pending</div></div>
      </div>
      {health.error && <Notice kind="error">{health.error}</Notice>}
    </div>
  );
}

/* ---------- Users ---------- */
export function UsersPanel() {
  const r = useData<{ items: Array<Record<string, unknown>> }>('/v1/admin/users');
  const [form, setForm] = useState({ fullName: '', email: '', role: 'USTADZ', aiCredits: 50, hermesSlots: 1 });
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const users = r.data?.items ?? [];
  const { q, setQ, filtered } = useSearch(users, [u => String(u.full_name ?? ''), u => String(u.email ?? '')]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const out = await api<Record<string, unknown>>('/v1/admin/users', { method: 'POST', body: JSON.stringify(form) });
      setNotice({ kind: 'success', text: `User dibuat. Activation token: ${String(out.activationToken)}` });
      setForm({ fullName: '', email: '', role: 'USTADZ', aiCredits: 50, hermesSlots: 1 });
      await r.reload();
    } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function toggle(id: string, active: boolean) {
    try { await api(`/v1/admin/users/${id}/active`, { method: 'PATCH', body: JSON.stringify({ isActive: active }) }); await r.reload(); }
    catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function del(id: string, name: string) {
    try { await api(`/v1/admin/users/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: `User ${name} dihapus.` }); await r.reload(); }
    catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function activation(id: string) {
    try { const out = await api<{ activationToken: string }>(`/v1/admin/users/${id}/activation`, { method: 'POST' }); setNotice({ kind: 'success', text: `Token aktivasi: ${out.activationToken}` }); }
    catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await api(`/v1/admin/users/${String(editing.id)}/active`, { method: 'PATCH', body: JSON.stringify({ isActive: Boolean(editing.is_active) }) });
      setEditing(null);
      await r.reload();
    } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  return (
    <div className="stack">
      <h2>Pengguna & Staff</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <form className="card form" onSubmit={submit}>
        <h3>Tambah Staff</h3>
        <div className="formRow">
          <input placeholder="Nama" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="USTADZ">Ustadz</option><option value="ADMIN">Admin</option>
          </select>
          <input type="number" placeholder="AI kredit" value={form.aiCredits} onChange={e => setForm({ ...form, aiCredits: Number(e.target.value) })} />
          <input type="number" placeholder="Slot agen" value={form.hermesSlots} onChange={e => setForm({ ...form, hermesSlots: Number(e.target.value) })} />
          <button className="btn" type="submit">Tambah</button>
        </div>
      </form>
      <div className="card">
        <h3>Daftar Pengguna</h3>
        <SearchBox value={q} onChange={setQ} placeholder="Cari nama/email…" />
        <div className="tableWrap"><table>
          <thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Status</th><th>Kredit AI</th><th>Slot</th><th></th></tr></thead>
          <tbody>
            {(filtered ?? []).map(u => (
              <tr key={String(u.id)}>
                <td>{String(u.full_name ?? '-')}</td><td>{String(u.email)}</td><td>{String(u.role)}</td>
                <td>{u.is_active ? 'Aktif' : 'Nonaktif'}</td>
                <td>{String(u.ai_credit_balance ?? '-')}</td><td>{String(u.hermes_agent_slots ?? '-')}</td>
                <td className="actions">
                  {u.role !== 'ADMIN' || true ? (
                    <button type="button" className="btn" onClick={() => void toggle(String(u.id), !u.is_active)}>{u.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                  ) : null}
                  <button type="button" className="btn secondary" onClick={() => void activation(String(u.id))}>Token</button>
                  <ConfirmDelete onDelete={() => void del(String(u.id), String(u.full_name ?? u.email))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
        {(filtered ?? []).length === 0 && !r.loading && <Empty />}
      </div>
    </div>
  );
}

/* ---------- Applicants ---------- */
export function ApplicantsPanel() {
  const r = useData<{ items: Array<Record<string, unknown>> }>('/v1/admissions/applications');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const apps = r.data?.items ?? [];
  const { q, setQ, filtered } = useSearch(apps, [a => String(a.applicant_name ?? ''), a => String(a.email ?? '')]);
  const token = 'x-bootstrap-token' as never;
  void token;

  async function patch(id: string, status: string) {
    try { await api(`/v1/admissions/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setNotice({ kind: 'success', text: `Status → ${status}` }); await r.reload(); }
    catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function decide(id: string, decision: string) {
    try { await api(`/v1/admissions/applications/${id}/decision`, { method: 'POST', body: JSON.stringify({ decision, reason: 'via admin panel' }) }); setNotice({ kind: 'success', text: `Keputusan: ${decision}` }); await r.reload(); }
    catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function enroll(id: string) {
    try { const out = await api<Record<string, unknown>>(`/v1/admissions/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'ENROLLED' }) }); setNotice({ kind: 'success', text: `Enrolled. NIS: ${String(out.studentNumber ?? '')}` }); await r.reload(); }
    catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  const statuses = ['ADMIN_VERIFIED', 'SCREENING', 'INTERVIEW', 'ACCEPTED', 'WAITLISTED', 'REJECTED'];
  return (
    <div className="stack">
      <h2>Pendaftar</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <div className="card">
        <SearchBox value={q} onChange={setQ} placeholder="Cari nama/email…" />
        <div className="tableWrap"><table>
          <thead><tr><th>Nama</th><th>Email</th><th>Status</th><th>NIS</th><th>Aksi</th></tr></thead>
          <tbody>
            {(filtered ?? []).map(a => (
              <tr key={String(a.id)}>
                <td>{String(a.applicant_name)}</td><td>{String(a.email)}</td>
                <td><span className="pill">{String(a.status)}</span></td>
                <td>{String(a.student_number ?? '-')}</td>
                <td className="actions">
                  <select defaultValue="" onChange={e => { if (e.target.value) void patch(String(a.id), e.target.value); e.target.value = ''; }}>
                    <option value="" disabled>Ubah status…</option>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select defaultValue="" onChange={e => { if (e.target.value) void decide(String(a.id), e.target.value); e.target.value = ''; }}>
                    <option value="" disabled>Keputusan…</option>
                    {['ACCEPTED', 'WAITLISTED', 'REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {a.status === 'ACCEPTED' && <button type="button" className="btn" onClick={() => void enroll(String(a.id))}>Daftar Ulang/Enroll</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
        {(filtered ?? []).length === 0 && !r.loading && <Empty />}
      </div>
    </div>
  );
}

/* ---------- Students (lifecycle) ---------- */
export function StudentsPanel() {
  const r = useData<{ items: Array<Record<string, unknown>> }>('/v1/admin/users?role=SANTRI');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const santri = r.data?.items ?? [];
  const { q, setQ, filtered } = useSearch(santri, [s => String(s.full_name ?? ''), s => String(s.email ?? ''), s => String(s.student_number ?? '')]);
  const states = ['ACTIVE', 'GRADUATED_PENDING', 'GRADUATED', 'ALUMNI', 'DROPOUT', 'SUSPENDED', 'INACTIVE'];
  async function changeStatus(id: string, status: string) {
    try { await api(`/v1/students/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); setNotice({ kind: 'success', text: `Status → ${status}` }); await r.reload(); }
    catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  return (
    <div className="stack">
      <h2>Santri & Lifecycle</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <div className="card">
        <SearchBox value={q} onChange={setQ} placeholder="Cari nama/NIS/email…" />
        <div className="tableWrap"><table>
          <thead><tr><th>Nama</th><th>NIS</th><th>Program</th><th>Status</th><th>Kredit</th><th>Aksi</th></tr></thead>
          <tbody>
            {(filtered ?? []).map(s => (
              <tr key={String(s.id)}>
                <td>{String(s.full_name ?? '-')}<div className="muted">{String(s.email)}</div></td>
                <td>{String(s.student_number ?? '-')}</td><td>{String(s.program_name ?? '-')}</td>
                <td><span className="pill">{String(s.student_status ?? '-')}</span></td>
                <td>{String(s.ai_credit_balance ?? '-')}</td>
                <td className="actions">
                  <select defaultValue="" onChange={e => { if (e.target.value) void changeStatus(String(s.student_id), e.target.value); e.target.value = ''; }}>
                    <option value="" disabled>Ubah lifecycle…</option>
                    {states.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
        {(filtered ?? []).length === 0 && !r.loading && <Empty />}
      </div>
    </div>
  );
}

/* ---------- Academic (courses/classes/assignments/sessions) ---------- */
export function AcademicAdminPanel() {
  const courses = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/courses');
  const classes = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/classes');
  const schedule = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/schedule');
  const users = useData<{ items: Array<Record<string, unknown>> }>('/v1/admin/users');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [courseForm, setCourseForm] = useState({ code: '', name: '', description: '' });
  const [classForm, setClassForm] = useState({ courseId: '', teacherUserId: '', name: '' });
  const [assignForm, setAssignForm] = useState({ classId: '', title: '', description: '', maxScore: 100 });
  const [sessionForm, setSessionForm] = useState({ classId: '', title: '', startsAt: '', endsAt: '' });
  const ustadz = (users.data?.items ?? []).filter(u => u.role === 'USTADZ');

  async function createCourse(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/academic/courses', { method: 'POST', body: JSON.stringify(courseForm) }); setNotice({ kind: 'success', text: 'Course dibuat.' }); setCourseForm({ code: '', name: '', description: '' }); await courses.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function patchCourse(id: string) {
    const name = window.prompt('Nama baru course:'); if (!name) return;
    try { await api(`/v1/academic/courses/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }); setNotice({ kind: 'success', text: 'Course diperbarui.' }); await courses.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function delCourse(id: string, name: string) {
    if (!window.confirm(`Hapus course ${name}?`)) return;
    try { await api(`/v1/academic/courses/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Course dihapus.' }); await courses.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function createClass(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/academic/classes', { method: 'POST', body: JSON.stringify(classForm) }); setNotice({ kind: 'success', text: 'Kelas dibuat.' }); setClassForm({ courseId: '', teacherUserId: '', name: '' }); await classes.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function patchClass(id: string) {
    const name = window.prompt('Nama baru kelas:'); if (!name) return;
    try { await api(`/v1/academic/classes/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }); setNotice({ kind: 'success', text: 'Kelas diperbarui.' }); await classes.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function delClass(id: string, name: string) {
    if (!window.confirm(`Hapus kelas ${name}?`)) return;
    try { await api(`/v1/academic/classes/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Kelas dihapus.' }); await classes.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function createAssignment(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/academic/assignments', { method: 'POST', body: JSON.stringify(assignForm) }); setNotice({ kind: 'success', text: 'Tugas dibuat.' }); setAssignForm({ classId: '', title: '', description: '', maxScore: 100 }); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function createSession(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/academic/sessions', { method: 'POST', body: JSON.stringify({ ...sessionForm, startsAt: new Date(sessionForm.startsAt).toISOString(), endsAt: new Date(sessionForm.endsAt).toISOString() }) }); setNotice({ kind: 'success', text: 'Sesi dibuat.' }); setSessionForm({ classId: '', title: '', startsAt: '', endsAt: '' }); await schedule.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function delSession(id: string) {
    if (!window.confirm('Hapus sesi ini?')) return;
    try { await api(`/v1/academic/sessions/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Sesi dihapus.' }); await schedule.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  return (
    <div className="stack">
      <h2>Akademik — Admin</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <div className="grid">
        <form className="card form" onSubmit={createCourse}><h3>Course baru</h3>
          <input placeholder="Kode (WEB101)" value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value })} required />
          <input placeholder="Nama" value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} required />
          <input placeholder="Deskripsi" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} />
          <button className="btn" type="submit">Buat</button>
        </form>
        <form className="card form" onSubmit={createClass}><h3>Kelas baru</h3>
          <select value={classForm.courseId} onChange={e => setClassForm({ ...classForm, courseId: e.target.value })} required><option value="">Course…</option>{courses.data?.items?.map(c => <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}</select>
          <select value={classForm.teacherUserId} onChange={e => setClassForm({ ...classForm, teacherUserId: e.target.value })}><option value="">Ustadz…</option>{ustadz.map(u => <option key={String(u.id)} value={String(u.id)}>{String(u.full_name ?? u.email)}</option>)}</select>
          <input placeholder="Nama kelas" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} required />
          <button className="btn" type="submit">Buat</button>
        </form>
        <form className="card form" onSubmit={createAssignment}><h3>Tugas baru</h3>
          <select value={assignForm.classId} onChange={e => setAssignForm({ ...assignForm, classId: e.target.value })} required><option value="">Kelas…</option>{classes.data?.items?.map(c => <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}</select>
          <input placeholder="Judul tugas" value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} required />
          <input placeholder="Deskripsi" value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })} />
          <button className="btn" type="submit">Buat</button>
        </form>
        <form className="card form" onSubmit={createSession}><h3>Sesi baru</h3>
          <select value={sessionForm.classId} onChange={e => setSessionForm({ ...sessionForm, classId: e.target.value })} required><option value="">Kelas…</option>{classes.data?.items?.map(c => <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}</select>
          <input placeholder="Judul sesi" value={sessionForm.title} onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })} />
          <div className="formRow"><input type="datetime-local" value={sessionForm.startsAt} onChange={e => setSessionForm({ ...sessionForm, startsAt: e.target.value })} required /><input type="datetime-local" value={sessionForm.endsAt} onChange={e => setSessionForm({ ...sessionForm, endsAt: e.target.value })} required /></div>
          <button className="btn" type="submit">Buat</button>
        </form>
      </div>
      <div className="card"><h3>Course</h3>
        <div className="tableWrap"><table><thead><tr><th>Kode</th><th>Nama</th><th></th></tr></thead><tbody>
          {courses.data?.items?.map(c => <tr key={String(c.id)}><td>{String(c.code)}</td><td>{String(c.name)}</td><td className="actions"><button type="button" className="btn secondary" onClick={() => void patchCourse(String(c.id))}>Ubah</button><ConfirmDelete onDelete={() => void delCourse(String(c.id), String(c.name))} /></td></tr>)}
        </tbody></table></div>
        {!courses.loading && !courses.data?.items?.length && <Empty />}
      </div>
      <div className="card"><h3>Kelas</h3>
        <div className="tableWrap"><table><thead><tr><th>Nama</th><th>Course</th><th></th></tr></thead><tbody>
          {classes.data?.items?.map(c => <tr key={String(c.id)}><td>{String(c.name)}</td><td>{String(c.course_name ?? '-')}</td><td className="actions"><button type="button" className="btn secondary" onClick={() => void patchClass(String(c.id))}>Ubah</button><ConfirmDelete onDelete={() => void delClass(String(c.id), String(c.name))} /></td></tr>)}
        </tbody></table></div>
        {!classes.loading && !classes.data?.items?.length && <Empty />}
      </div>
      <div className="card"><h3>Sesi</h3>
        <div className="tableWrap"><table><thead><tr><th>Kelas</th><th>Judul</th><th>Mulai</th><th></th></tr></thead><tbody>
          {schedule.data?.items?.map(s => <tr key={String(s.id)}><td>{String(s.class_name ?? '-')}</td><td>{String(s.title ?? '-')}</td><td className="muted">{s.starts_at ? new Date(String(s.starts_at)).toLocaleString('id-ID') : '-'}</td><td><ConfirmDelete onDelete={() => void delSession(String(s.id))} /></td></tr>)}
        </tbody></table></div>
        {!schedule.loading && !schedule.data?.items?.length && <Empty />}
      </div>
    </div>
  );
}

/* ---------- Setup: periods / programs / cohorts ---------- */
export function SetupPanel() {
  const periods = useData<{ items: Array<Record<string, unknown>> }>('/v1/admissions/periods');
  const programs = useData<{ items: Array<Record<string, unknown>> }>('/v1/catalog/programs');
  const cohorts = useData<{ items: Array<Record<string, unknown>> }>('/v1/catalog/cohorts');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [period, setPeriod] = useState({ name: '', cohortYear: new Date().getFullYear() + 1, capacity: 30, isActive: true });
  const [program, setProgram] = useState({ code: '', name: '', description: '' });
  const [cohort, setCohort] = useState({ name: '', year: new Date().getFullYear() + 1, isActive: true });

  async function createPeriod(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/admissions/periods', { method: 'POST', body: JSON.stringify(period) }); setNotice({ kind: 'success', text: 'Periode dibuat.' }); setPeriod({ ...period, name: '' }); await periods.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function patchPeriod(id: string) { const name = window.prompt('Nama baru periode:'); if (!name) return; try { await api(`/v1/admissions/periods/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }); setNotice({ kind: 'success', text: 'Periode diperbarui.' }); await periods.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function delPeriod(id: string) { if (!window.confirm('Hapus periode?')) return; try { await api(`/v1/admissions/periods/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Periode dihapus.' }); await periods.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function createProgram(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/catalog/programs', { method: 'POST', body: JSON.stringify(program) }); setNotice({ kind: 'success', text: 'Program dibuat.' }); setProgram({ code: '', name: '', description: '' }); await programs.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function patchProgram(id: string) { const name = window.prompt('Nama baru program:'); if (!name) return; try { await api(`/v1/catalog/programs/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }); setNotice({ kind: 'success', text: 'Program diperbarui.' }); await programs.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function delProgram(id: string) { if (!window.confirm('Hapus program?')) return; try { await api(`/v1/catalog/programs/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Program dihapus.' }); await programs.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function createCohort(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/catalog/cohorts', { method: 'POST', body: JSON.stringify(cohort) }); setNotice({ kind: 'success', text: 'Cohort dibuat.' }); setCohort({ ...cohort, name: '' }); await cohorts.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function patchCohort(id: string) { const name = window.prompt('Nama baru cohort:'); if (!name) return; try { await api(`/v1/catalog/cohorts/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }); setNotice({ kind: 'success', text: 'Cohort diperbarui.' }); await cohorts.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function delCohort(id: string) { if (!window.confirm('Hapus cohort?')) return; try { await api(`/v1/catalog/cohorts/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Cohort dihapus.' }); await cohorts.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }

  return (
    <div className="stack">
      <h2>Setup — Penerimaan, Program, Cohort</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <div className="grid">
        <form className="card form" onSubmit={createPeriod}><h3>Periode penerimaan</h3>
          <input placeholder="Nama periode" value={period.name} onChange={e => setPeriod({ ...period, name: e.target.value })} required />
          <input type="number" value={period.cohortYear} onChange={e => setPeriod({ ...period, cohortYear: Number(e.target.value) })} />
          <input type="number" min="1" value={period.capacity} onChange={e => setPeriod({ ...period, capacity: Number(e.target.value) })} />
          <label><input type="checkbox" checked={period.isActive} onChange={e => setPeriod({ ...period, isActive: e.target.checked })} /> Aktif</label>
          <button className="btn" type="submit">Buat</button>
        </form>
        <form className="card form" onSubmit={createProgram}><h3>Program</h3>
          <input placeholder="PROGRAMMER" value={program.code} onChange={e => setProgram({ ...program, code: e.target.value })} required />
          <input placeholder="Nama program" value={program.name} onChange={e => setProgram({ ...program, name: e.target.value })} required />
          <input placeholder="Deskripsi" value={program.description} onChange={e => setProgram({ ...program, description: e.target.value })} />
          <button className="btn" type="submit">Buat</button>
        </form>
        <form className="card form" onSubmit={createCohort}><h3>Cohort / angkatan</h3>
          <input placeholder="Angkatan 2027" value={cohort.name} onChange={e => setCohort({ ...cohort, name: e.target.value })} required />
          <input type="number" value={cohort.year} onChange={e => setCohort({ ...cohort, year: Number(e.target.value) })} />
          <button className="btn" type="submit">Buat</button>
        </form>
      </div>
      <div className="card"><h3>Periode</h3>{periods.data?.items?.map(p => <div className="notification" key={String(p.id)}><strong>{String(p.name)}</strong><span className="pill">{p.is_active ? 'Aktif' : 'Nonaktif'}</span><div className="actions"><button type="button" className="btn secondary" onClick={() => void patchPeriod(String(p.id))}>Ubah</button><ConfirmDelete onDelete={() => void delPeriod(String(p.id))} /></div></div>)}{!periods.loading && !periods.data?.items?.length && <Empty />}</div>
      <div className="card"><h3>Program</h3>{programs.data?.items?.map(p => <div className="notification" key={String(p.id)}><strong>{String(p.code)}</strong> · {String(p.name)}<div className="actions"><button type="button" className="btn secondary" onClick={() => void patchProgram(String(p.id))}>Ubah</button><ConfirmDelete onDelete={() => void delProgram(String(p.id))} /></div></div>)}{!programs.loading && !programs.data?.items?.length && <Empty />}</div>
      <div className="card"><h3>Cohort</h3>{cohorts.data?.items?.map(c => <div className="notification" key={String(c.id)}><strong>{String(c.name)}</strong> · {String(c.year)}<div className="actions"><button type="button" className="btn secondary" onClick={() => void patchCohort(String(c.id))}>Ubah</button><ConfirmDelete onDelete={() => void delCohort(String(c.id))} /></div></div>)}{!cohorts.loading && !cohorts.data?.items?.length && <Empty />}</div>
    </div>
  );
}

/* ---------- Rewards ---------- */
export function RewardsPanel() {
  const r = useData<{ rules: Array<Record<string, unknown>>; grants: Array<Record<string, unknown>> }>('/v1/rewards');
  const users = useData<{ items: Array<Record<string, unknown>> }>('/v1/admin/users');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [rule, setRule] = useState({ code: '', name: '', description: '', triggerType: 'manual', aiCredits: 10, hermesSlots: 0 });
  const [grant, setGrant] = useState({ userId: '', rewardRuleId: '' });

  async function createRule(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/rewards/rules', { method: 'POST', body: JSON.stringify(rule) }); setNotice({ kind: 'success', text: 'Rule dibuat.' }); setRule({ ...rule, code: '', name: '' }); await r.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function patchRule(id: string) { const name = window.prompt('Nama baru rule:'); if (!name) return; try { await api(`/v1/rewards/rules/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }); setNotice({ kind: 'success', text: 'Rule diperbarui.' }); await r.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function delRule(id: string) { if (!window.confirm('Hapus reward rule?')) return; try { await api(`/v1/rewards/rules/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Rule dihapus.' }); await r.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function grantReward(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/rewards/grant', { method: 'POST', body: JSON.stringify({ ...grant, reason: 'Grant admin' }) }); setNotice({ kind: 'success', text: 'Reward diberikan.' }); setGrant({ userId: '', rewardRuleId: '' }); await r.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }

  return (
    <div className="stack">
      <h2>Reward & Achievement</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <div className="grid">
        <form className="card form" onSubmit={createRule}><h3>Rule reward baru</h3>
          <div className="formRow"><input placeholder="KODE" value={rule.code} onChange={e => setRule({ ...rule, code: e.target.value.toUpperCase() })} required /><input placeholder="Nama" value={rule.name} onChange={e => setRule({ ...rule, name: e.target.value })} required /></div>
          <input placeholder="Deskripsi" value={rule.description} onChange={e => setRule({ ...rule, description: e.target.value })} />
          <div className="formRow"><input type="number" placeholder="AI kredit" value={rule.aiCredits} onChange={e => setRule({ ...rule, aiCredits: Number(e.target.value) })} /><input type="number" placeholder="Slot agen" value={rule.hermesSlots} onChange={e => setRule({ ...rule, hermesSlots: Number(e.target.value) })} /></div>
          <button className="btn" type="submit">Buat</button>
        </form>
        <form className="card form" onSubmit={grantReward}><h3>Grant reward</h3>
          <select value={grant.userId} onChange={e => setGrant({ ...grant, userId: e.target.value })} required><option value="">User…</option>{users.data?.items?.map(u => <option key={String(u.id)} value={String(u.id)}>{String(u.full_name ?? u.email)}</option>)}</select>
          <select value={grant.rewardRuleId} onChange={e => setGrant({ ...grant, rewardRuleId: e.target.value })} required><option value="">Rule…</option>{r.data?.rules?.map(x => <option key={String(x.id)} value={String(x.id)}>{String(x.name)}</option>)}</select>
          <button className="btn" type="submit">Grant</button>
        </form>
      </div>
      <div className="card"><h3>Rules</h3>{r.data?.rules?.map(x => <div className="notification" key={String(x.id)}><strong>{String(x.name)}</strong><span className="pill">{String(x.type)} · {String(x.value)}</span><div className="actions"><button type="button" className="btn secondary" onClick={() => void patchRule(String(x.id))}>Ubah</button><ConfirmDelete onDelete={() => void delRule(String(x.id))} /></div></div>)}{!r.loading && !r.data?.rules?.length && <Empty />}</div>
      <div className="card"><h3>Riwayat grant</h3>{r.data?.grants?.map(g => <div className="notification" key={String(g.id)}><strong>{String(g.user_name)}</strong><span className="pill">{String(g.reward_name ?? g.type)}</span><div className="muted">{String(g.reason ?? '')}</div></div>)}{!r.loading && !r.data?.grants?.length && <Empty />}</div>
    </div>
  );
}

/* ---------- Certificates ---------- */
export function CertificatesAdminPanel() {
  const r = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/certificates');
  const users = useData<{ items: Array<Record<string, unknown>> }>('/v1/admin/users');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [form, setForm] = useState({ studentUserId: '', title: '', certificateNo: '' });
  const santri = (users.data?.items ?? []).filter(u => u.role === 'SANTRI');
  async function create(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/academic/certificates', { method: 'POST', body: JSON.stringify(form) }); setNotice({ kind: 'success', text: 'Sertifikat diterbitkan.' }); setForm({ studentUserId: '', title: '', certificateNo: '' }); await r.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function del(id: string) { if (!window.confirm('Hapus sertifikat?')) return; try { await api(`/v1/academic/certificates/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Sertifikat dihapus.' }); await r.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  return (
    <div className="stack">
      <h2>Sertifikat</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <form className="card form" onSubmit={create}><h3>Terbitkan sertifikat</h3>
        <select value={form.studentUserId} onChange={e => setForm({ ...form, studentUserId: e.target.value })} required><option value="">Santri…</option>{santri.map(s => <option key={String(s.id)} value={String(s.id)}>{String(s.full_name ?? s.email)}</option>)}</select>
        <div className="formRow"><input placeholder="Judul" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /><input placeholder="Nomor sertifikat" value={form.certificateNo} onChange={e => setForm({ ...form, certificateNo: e.target.value })} required /></div>
        <button className="btn" type="submit">Terbitkan</button>
      </form>
      <div className="card"><h3>Daftar</h3>
        <div className="tableWrap"><table><thead><tr><th>Santri</th><th>Judul</th><th>No</th><th>Tanggal</th><th></th></tr></thead><tbody>
          {r.data?.items?.map(c => <tr key={String(c.id)}><td>{String(c.student_name)}</td><td>{String(c.title)}</td><td>{String(c.certificate_no)}</td><td className="muted">{c.issued_at ? new Date(String(c.issued_at)).toLocaleDateString('id-ID') : '-'}</td><td><ConfirmDelete onDelete={() => void del(String(c.id))} /></td></tr>)}
        </tbody></table></div>
        {!r.loading && !r.data?.items?.length && <Empty />}
      </div>
    </div>
  );
}

/* ---------- Notification templates ---------- */
export function TemplatesPanel() {
  const r = useData<{ items: Array<Record<string, unknown>> }>('/v1/admin/notification-templates');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [form, setForm] = useState({ key: '', channel: 'EMAIL', subject: '', body: '', isActive: true });
  async function save(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/admin/notification-templates', { method: 'PUT', body: JSON.stringify(form) }); setNotice({ kind: 'success', text: 'Template disimpan.' }); setForm({ key: '', channel: 'EMAIL', subject: '', body: '', isActive: true }); await r.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  async function del(key: string, channel: string) { if (!window.confirm('Hapus template?')) return; try { await api(`/v1/admin/notification-templates?key=${encodeURIComponent(key)}&channel=${channel}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Template dihapus.' }); await r.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  return (
    <div className="stack">
      <h2>Template Notifikasi</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <form className="card form" onSubmit={save}><h3>Upsert template</h3>
        <div className="formRow"><input placeholder="key (mis. admission.accepted)" value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} required />
          <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}>{['IN_APP', 'EMAIL', 'WHATSAPP', 'TELEGRAM'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <input placeholder="Subjek (email)" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
        <textarea placeholder="Isi template" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required />
        <label><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Aktif</label>
        <button className="btn" type="submit">Simpan</button>
      </form>
      <div className="card"><h3>Daftar</h3>
        <div className="tableWrap"><table><thead><tr><th>Key</th><th>Channel</th><th>Subjek</th><th></th></tr></thead><tbody>
          {r.data?.items?.map(t => <tr key={`${String(t.key)}:${String(t.channel)}`}><td>{String(t.key)}</td><td>{String(t.channel)}</td><td>{String(t.subject ?? '-')}</td><td><ConfirmDelete onDelete={() => void del(String(t.key), String(t.channel))} /></td></tr>)}
        </tbody></table></div>
        {!r.loading && !r.data?.items?.length && <Empty />}
      </div>
    </div>
  );
}

/* ---------- Ops ---------- */
export function OpsPanel() {
  const health = useData<Record<string, unknown>>('/v1/ops/health');
  const events = useData<{ items: Array<Record<string, unknown>> }>('/v1/ops/events');
  const backups = useData<{ items: Array<Record<string, unknown>> }>('/v1/ops/backups');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const h = health.data ?? {};
  const nine = (h.nineRouter as Record<string, unknown>) ?? {};
  async function resolve(id: string) { try { await api(`/v1/ops/events/${id}/resolve`, { method: 'PATCH' }); setNotice({ kind: 'success', text: 'Event ditandai selesai.' }); await events.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  return (
    <div className="stack">
      <h2>Operasional</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <div className="grid">
        <div className="card"><h3>Health</h3><div>PostgreSQL: {String(h.postgres)}</div><div>MinIO: {String(h.minio)}</div><div>9Router: {nine.ok ? `OK (${String(nine.status)})` : 'turun'}</div><div>Outbox pending: {String(h.outboxPending ?? 0)}</div></div>
        <div className="card"><h3>Backup</h3>{backups.data?.items?.slice(0, 5).map((b: Record<string, unknown>) => <div key={String(b.id)}><span className={`pill ${b.status === 'SUCCEEDED' ? '' : 'error'}`}>{String(b.status)}</span> <span className="muted">{String(b.started_at ?? '')}</span></div>)}{!backups.loading && !backups.data?.items?.length && <Empty text="Belum ada backup." />}</div>
      </div>
      <div className="card"><h3>Ops Events</h3>
        <div className="tableWrap"><table><thead><tr><th>Severity</th><th>Keterangan</th><th>Waktu</th><th></th></tr></thead><tbody>
          {events.data?.items?.map(e => <tr key={String(e.id)}><td><span className="pill">{String(e.severity)}</span></td><td>{String(e.message)}</td><td className="muted">{e.created_at ? new Date(String(e.created_at)).toLocaleString('id-ID') : ''}</td><td>{!e.resolved_at && <button type="button" className="btn secondary" onClick={() => void resolve(String(e.id))}>Resolve</button>}</td></tr>)}
        </tbody></table></div>
        {!events.loading && !events.data?.items?.length && <Empty />}
      </div>
    </div>
  );
}

/* ---------- AI credits grant (admin) ---------- */
export function AiAdminPanel() {
  const users = useData<{ items: Array<Record<string, unknown>> }>('/v1/admin/users');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [grant, setGrant] = useState({ userId: '', credits: 100, reason: 'Admin grant' });
  async function submit(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/ai/credits/grant', { method: 'POST', body: JSON.stringify(grant) }); setNotice({ kind: 'success', text: 'Kredit diberikan.' }); await users.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }
  return (
    <div className="stack">
      <h2>AI Credits — Admin</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <form className="card form" onSubmit={submit}><h3>Grant kredit AI</h3>
        <select value={grant.userId} onChange={e => setGrant({ ...grant, userId: e.target.value })} required><option value="">User…</option>{users.data?.items?.map(u => <option key={String(u.id)} value={String(u.id)}>{String(u.full_name ?? u.email)} ({String(u.ai_credit_balance ?? 0)})</option>)}</select>
        <div className="formRow"><input type="number" value={grant.credits} onChange={e => setGrant({ ...grant, credits: Number(e.target.value) })} /><input value={grant.reason} onChange={e => setGrant({ ...grant, reason: e.target.value })} /></div>
        <button className="btn" type="submit">Grant</button>
      </form>
      <div className="card"><h3>Saldo</h3><div className="tableWrap"><table><thead><tr><th>User</th><th>Kredit</th><th>Slot</th></tr></thead><tbody>{users.data?.items?.map(u => <tr key={String(u.id)}><td>{String(u.full_name ?? u.email)}</td><td>{String(u.ai_credit_balance ?? 0)}</td><td>{String(u.hermes_agent_slots ?? 0)}</td></tr>)}</tbody></table></div></div>
    </div>
  );
}
