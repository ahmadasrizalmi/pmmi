import React, { useEffect, useMemo, useState } from 'react';
import { api, getSession, setSession, type Session } from './api';
import { AdminAdmissionsDetailPanel, AdminHermesAuditPanel, AdminStudentsPanel, SantriAcademicPanel, UstadzManagePanel } from './BlueprintPanels';

function Button({ children, onClick, type = 'button', kind = '', disabled = false }: { children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; kind?: string; disabled?: boolean }) { return <button className={`btn ${kind}`} type={type} onClick={onClick} disabled={disabled}>{children}</button>; }

function useRemote<T = unknown>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const reload = async () => { if (!path) return; setLoading(true); setError(''); try { setData(await api<T>(path)); } catch (e: unknown) { setError((e as Error).message); } finally { setLoading(false); } };
  useEffect(() => { void reload(); }, [path, ...deps]);
  return { data, error, loading, reload };
}

function Login({ onLogin }: { onLogin: (s: Session) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(''); try { const session = await api<Session>('/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setSession(session); onLogin(session); } catch (err: unknown) { setError((err as Error).message); } finally { setBusy(false); } }
  return (
    <div className="login">
      <form className="card form" onSubmit={submit}>
        <div>
          <div className="brand">PMMI Digital Campus</div>
          <div className="muted">Academic &middot; Portfolio &middot; AI Agent</div>
        </div>
        {error && <div className="notice error">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" disabled={busy}>{busy ? 'Masuk...' : 'Masuk'}</Button>
      </form>
    </div>
  );
}

function Overview({ role }: { role: string }) {
  const r = useRemote<unknown>('/v1/dashboard', [role]);
  if (r.loading && !r.data) return <p>Memuat dashboard&hellip;</p>;
  const d = r.data as Record<string, unknown> | null;
  return (
    <div className="stack">
      {r.error && <div className="notice error">{r.error}</div>}
      <div className="sectionTitle"><h2>Overview</h2><Button kind="secondary" onClick={() => void r.reload()}>Refresh</Button></div>
      {d && (
        <div className="grid">
          {role === 'ADMIN' && (
            <>
              <div className="card"><div className="muted">Pending</div><div className="metric">{String(d.pendingSubmissions ?? 0)}</div></div>
              <div className="card"><div className="muted">Alerts</div><div className="metric">{String(d.openOpsAlerts ?? 0)}</div></div>
            </>
          )}
          {role === 'SANTRI' && (
            <>
              <div className="card"><div className="muted">Nilai Rata-rata</div><div className="metric">{String((d as Record<string, unknown>)?.avgScore ?? '-')}</div></div>
              <div className="card"><div className="muted">Sertifikat</div><div className="metric">{String((d as Record<string, unknown>)?.certificateCount ?? 0)}</div></div>
            </>
          )}
          {role === 'ALUMNI' && (
            <>
              <div className="card"><div className="muted">Sertifikat</div><div className="metric">{String((d as Record<string, unknown>)?.certificateCount ?? 0)}</div></div>
              <div className="card"><div className="muted">Portfolio</div><div className="metric">{String((d as Record<string, unknown>)?.portfolioCount ?? 0)}</div></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const r = useRemote<unknown>('/v1/admin/users');
  const [form, setForm] = useState({ email: '', fullName: '', role: 'USTADZ', aiCredits: 50, hermesSlots: 1 });
  const [result, setResult] = useState<unknown>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try { const out = await api('/v1/admin/users', { method: 'POST', body: JSON.stringify(form) }); setResult(`✅ User ${out.full_name} (${out.role}) berhasil dibuat.\nActivation token: ${out.activationToken}`); setForm({ ...form, email: '', fullName: '' }); await (r as { reload: () => Promise<void> }).reload(); }
    catch (e: unknown) { setResult({ error: (e as Error).message }); }
  }
  async function toggleActive(id: string) {
    try {
      await api(`/v1/admin/users/${id}/toggle-active`, { method: 'PATCH' });
      await (r as { reload: () => Promise<void> }).reload();
    } catch (e: unknown) { alert((e as Error).message); }
  }
  async function deleteUser(id: string, name: string) {
    if (!confirm(`Hapus user ${name}?`)) return;
    try {
      await api(`/v1/admin/users/${id}`, { method: 'DELETE' });
      await (r as { reload: () => Promise<void> }).reload();
    } catch (e: unknown) { alert((e as Error).message); }
  }
  const users = (r.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;
  return (
    <div className="stack">
      <h2>Users & Ustadz</h2>
      {result && <div className="notice">{typeof result === 'string' ? result : typeof result === 'object' && result !== null && 'error' in result ? String((result as Record<string,unknown>).error) : ''}</div>}
      <form className="card form" onSubmit={submit}>
        <h3>Tambah Staff</h3>
        <div className="formRow">
          <input placeholder="Nama" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="USTADZ">Ustadz</option>
          <option value="ADMIN">Admin</option>
        </select>
        <Button type="submit">Tambah</Button>
      </form>
      {users?.map((u: Record<string, unknown>) => (
        <div className="card" key={String(u.id)}>
          <strong>{String(u.fullName ?? u.full_name)}</strong>
          <div className="muted">{String(u.email)} &middot; {String(u.role)}</div>
        </div>
      ))}
    </div>
  );
}

function CertificatesTab({ role }: { role: string }) {
  const path = role === 'ALUMNI' ? '/v1/academic/my/certificates' : '/v1/academic/certificates';
  const r = useRemote<unknown>(path);
  const certs = (r.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;
  const [certForm, setCertForm] = useState({ studentUserId: '', courseName: '', title: '', description: '' });
  const [certMsg, setCertMsg] = useState('');
  async function issueCert(e: React.FormEvent) {
    e.preventDefault();
    try {
      const out = await api('/v1/academic/certificates', { method: 'POST', body: JSON.stringify(certForm) });
      setCertMsg(`✅ Sertifikat diterbitkan — No: ${out.certificate_no}`);
      setCertForm({ studentUserId: '', courseName: '', title: '', description: '' });
      await (r as { reload: () => Promise<void> }).reload();
    } catch (e: unknown) { setCertMsg((e as Error).message); }
  }
  return (
    <div className="stack">
      <div className="sectionTitle"><h2>Sertifikat</h2><Button kind="secondary" onClick={() => void (r as { reload: () => Promise<void> }).reload()}>Refresh</Button></div>
      {r.error && <div className="notice error">{r.error}</div>}
      {r.loading && !r.data && <p>Memuat&hellip;</p>}
      {certs?.length === 0 && !r.loading && <div className="card"><p className="muted">Belum ada sertifikat.</p></div>}
      {role === 'ADMIN' && (
          <form className="card form" onSubmit={issueCert} style={{ marginBottom: 16 }}>
            <h3>Terbitkan Sertifikat</h3>
            {certMsg && <div className="notice">{certMsg}</div>}
            <div className="formRow">
              <input placeholder="User ID Santri" value={certForm.studentUserId} onChange={e => setCertForm({ ...certForm, studentUserId: e.target.value })} required />
              <input placeholder="Nama Course" value={certForm.courseName} onChange={e => setCertForm({ ...certForm, courseName: e.target.value })} required />
            </div>
            <input placeholder="Judul Sertifikat" value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} required />
            <textarea placeholder="Deskripsi (opsional)" value={certForm.description} onChange={e => setCertForm({ ...certForm, description: e.target.value })} />
            <Button type="submit">Terbitkan</Button>
          </form>
        )}
      <div className="grid">
        {certs?.map((c: Record<string, unknown>) => (
          <div className="card" key={String(c.id ?? c.certificate_no)}>
            <h3>{String(c.title ?? c.course_name ?? 'Sertifikat')}</h3>
            <div className="muted">No: {String(c.certificate_no ?? '-')}</div>
            {c.issued_at && <div className="muted">Terbit: {new Date(String(c.issued_at)).toLocaleDateString('id-ID')}</div>}
            {c.status && <span className="pill">{String(c.status)}</span>}
            {c.download_url && (
              <div style={{ marginTop: 10 }}>
                <a href={String(c.download_url)} target="_blank" rel="noopener noreferrer" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>download</span>
                  Unduh Sertifikat
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setCurrent] = useState<Session | null>(() => getSession());
  const role = session?.user.role;

  const tabs = useMemo(() => {
    if (role === 'ADMIN') return ['Overview', 'Admissions', 'Students', 'Users', 'Academic', 'Certificates', 'Rewards', 'AI & Agents', 'Ops', 'Notifications'];
    if (role === 'USTADZ') return ['Overview', 'Academic', 'AI', 'Riwayat', 'Notifications'];
    if (role === 'ALUMNI') return ['Overview', 'Transkrip', 'Sertifikat', 'Portfolio', 'Notifications'];
    if (role === 'SANTRI') return ['Overview', 'Assignments', 'Academic', 'Portfolio', 'Certificates', 'AI', 'Notifications'];
    return [];
  }, [role]);

  const [tab, setTab] = useState('Overview');
  useEffect(() => { if (!tabs.includes(tab)) setTab('Overview'); }, [tabs, tab]);

  if (!session) return <Login onLogin={setCurrent} />;

  function logout() { setSession(null); setCurrent(null as unknown as Session | null); }

  const view: React.ReactNode = (() => {
    if (tab === 'Overview') return <Overview role={role!} />;
    if (tab === 'Notifications') return <NotificationsTab />;

    if (role === 'ADMIN') {
      if (tab === 'Admissions') return <AdminAdmissionsDetailPanel />;
      if (tab === 'Students') return <AdminStudentsPanel />;
      if (tab === 'Users') return <UsersTab />;
      if (tab === 'Academic') return <AcademicTab role="ADMIN" />;
      if (tab === 'Certificates') return <CertificatesTab role="ADMIN" />;
      if (tab === 'Rewards') return <RewardsTab />;
      if (tab === 'AI & Agents') return <AiAgentsTab admin />;
      if (tab === 'Ops') return <OpsTab />;
    }
    if (role === 'USTADZ') {
      if (tab === 'Academic') return <UstadzManagePanel />;
      if (tab === 'AI') return <AiAgentsTab />;
      if (tab === 'Riwayat') return <UstadzRiwayatPanel />;
      if (tab === 'Attendance') return <UstadzAttendanceWrapper />;
    }
    if (role === 'ALUMNI') {
      if (tab === 'Transkrip') return <AlumniTranscriptPanel />;
      if (tab === 'Sertifikat') return <CertificatesTab role="ALUMNI" />;
      if (tab === 'Portfolio') return <AlumniPortfolioPanel />;
    }
    if (role === 'SANTRI') {
      if (tab === 'Assignments') return <AssignmentsTab />;
      if (tab === 'Academic') return <SantriAcademicPanel />;
      if (tab === 'Portfolio') return <AlumniPortfolioPanel />;
      if (tab === 'Certificates') return <CertificatesTab role="SANTRI" />;
      if (tab === 'AI') return <AiAgentsTab />;
    }
    return <Overview role={role!} />;
  })();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">PMMI Digital Campus</div>
        <div className="muted">{session.user.fullName ?? session.user.full_name}<br />{role}</div>
        <div className="nav">
          {tabs.map(t => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Button kind="secondary" onClick={logout}>Keluar</Button>
        </div>
      </aside>
      <main className="content">
        <div className="topbar">
          <div>
            <h1 style={{ margin: 0 }}>{tab}</h1>
            <div className="muted">Pondok Multimedia Munzalan Indonesia</div>
          </div>
          <span className="pill">{role}</span>
        </div>
        {view}
      </main>
    </div>
  );
}

// Simplified sub-components

function NotificationsTab() {
  const r = useRemote<unknown>('/v1/notifications');
  const items = (r.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;
  return (
    <div className="stack">
      <div className="sectionTitle">
        <h2>Notifikasi</h2>
        <Button kind="secondary" onClick={() => api('/v1/notifications/read-all', { method: 'POST' }).then(() => (r as { reload: () => Promise<void> }).reload())}>
          Tandai semua dibaca
        </Button>
      </div>
      {items?.map((n: Record<string, unknown>) => (
        <div className={`notification${n.read_at ? '' : ' unread'}`} key={String(n.id)}>
          <strong>{String(n.title)}</strong>
          <div>{String(n.body)}</div>
          <div className="muted">{new Date(String(n.created_at)).toLocaleString('id-ID')}</div>
        </div>
      ))}
      {items?.length === 0 && <div className="card"><p className="muted">Tidak ada notifikasi.</p></div>}
    </div>
  );
}

function UstadzAttendanceWrapper() {
  const schedule = useRemote<unknown>('/v1/academic/schedule');
  const [sessionId, setSessionId] = useState('');
  const [roster, setRoster] = useState<Array<Record<string, unknown>>>([]);
  const [records, setRecords] = useState<Record<string, { status: string; notes: string }>>({});
  const [message, setMessage] = useState('');

  const schedItems = (schedule.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;
  const selected = schedItems?.find((s: Record<string, unknown>) => s.id === sessionId);

  useEffect(() => { if (!sessionId && schedItems?.[0]) setSessionId(String(schedItems[0].id)); }, [schedule.data, sessionId]);
  useEffect(() => {
    if (!selected) return;
    void (async () => {
      try {
        const [r, a] = await Promise.all([
          api(`/v1/academic/classes/${selected.class_id}/roster`),
          api(`/v1/academic/sessions/${selected.id}/attendance`),
        ]);
        const rItems = (r as Record<string, unknown>).items as Array<Record<string, unknown>>;
        const aItems = (a as Record<string, unknown>).items as Array<Record<string, unknown>>;
        setRoster(rItems ?? []);
        const existing = new Map((aItems ?? []).map((x: Record<string, unknown>) => [x.student_user_id, x]));
        const next: Record<string, { status: string; notes: string }> = {};
        for (const student of rItems ?? []) {
          const old = existing.get(student.user_id) as Record<string, unknown> | undefined;
          next[String(student.user_id)] = { status: String(old?.status ?? 'PRESENT'), notes: String(old?.notes ?? '') };
        }
        setRecords(next);
      } catch (e: unknown) { setMessage((e as Error).message); }
    })();
  }, [selected?.id]);

  async function save() {
    if (!selected) return;
    try {
      await api(`/v1/academic/sessions/${selected.id}/attendance`, {
        method: 'PUT',
        body: JSON.stringify({
          records: roster.map(student => ({
            studentUserId: student.user_id,
            status: records[String(student.user_id)]?.status ?? 'PRESENT',
            notes: records[String(student.user_id)]?.notes || undefined,
          })),
        }),
      });
      setMessage('Absensi tersimpan.');
    } catch (e: unknown) { setMessage((e as Error).message); }
  }

  return (
    <div className="stack">
      <h2>Attendance</h2>
      {message && <div className="notice">{message}</div>}
      <div className="card form">
        <select value={sessionId} onChange={e => setSessionId(e.target.value)}>
          <option value="">Pilih sesi</option>
          {schedItems?.map((s: Record<string, unknown>) => (
            <option key={String(s.id)} value={String(s.id)}>
              {String(s.class_name)} &middot; {String(s.title ?? 'Sesi')} &middot; {new Date(String(s.starts_at)).toLocaleString('id-ID')}
            </option>
          ))}
        </select>
      </div>
      {selected && (
        <>
          <div className="tableWrap">
            <table>
              <thead><tr><th>Santri</th><th>Status</th><th>Catatan</th></tr></thead>
              <tbody>
                {roster.map(student => {
                  const r = records[String(student.user_id)] ?? { status: 'PRESENT', notes: '' };
                  return (
                    <tr key={String(student.user_id)}>
                      <td>{String(student.full_name)}<div className="muted">{String(student.student_number ?? student.email)}</div></td>
                      <td>
                        <select value={r.status} onChange={e => setRecords({ ...records, [String(student.user_id)]: { ...r, status: e.target.value } })}>
                          <option value="PRESENT">Hadir</option>
                          <option value="LATE">Terlambat</option>
                          <option value="ABSENT">Tidak Hadir</option>
                          <option value="EXCUSED">Izin</option>
                        </select>
                      </td>
                      <td><input value={r.notes} onChange={e => setRecords({ ...records, [String(student.user_id)]: { ...r, notes: e.target.value } })} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button onClick={() => void save()}>Simpan Absensi</Button>
        </>
      )}
    </div>
  );
}

function AcademicTab({ role }: { role: string }) {
  const classes = useRemote<unknown>('/v1/academic/classes');
  const users = useRemote<unknown>('/v1/admin/users?role=USTADZ');
  const [course, setCourse] = useState({ code: '', name: '' });
  const [clazz, setClazz] = useState({ courseId: '', teacherUserId: '', name: '' });
  const [result, setResult] = useState<unknown>(null);

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    try { const out = await api('/v1/academic/courses', { method: 'POST', body: JSON.stringify(course) }); setResult(`✅ Course ${out.name} berhasil dibuat`); setClazz({ ...clazz, courseId: String((out as Record<string, unknown>).id) }); setCourse({ code: '', name: '' }); } catch (e: unknown) { setResult({ error: (e as Error).message }); }
  }
  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    try { const out = await api('/v1/academic/classes', { method: 'POST', body: JSON.stringify(clazz) }); setResult(`✅ Kelas ${out.name} berhasil dibuat`); setClazz({ ...clazz, name: '' }); await (classes as { reload: () => Promise<void> }).reload(); } catch (e: unknown) { setResult({ error: (e as Error).message }); }
  }

  const clsItems = (classes.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;
  const uItems = (users.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;

  return (
    <div className="stack">
      <h2>Academic Management</h2>
      {result && <div className="notice">{typeof result === 'string' ? result : typeof result === 'object' && result !== null && 'error' in result ? String((result as Record<string,unknown>).error) : ''}</div>}
      <div className="grid">
        <form className="card form" onSubmit={createCourse}>
          <h3>Buat Course</h3>
          <input placeholder="Kode (e.g. FOTO-101)" value={course.code} onChange={e => setCourse({ ...course, code: e.target.value })} required />
          <input placeholder="Nama course" value={course.name} onChange={e => setCourse({ ...course, name: e.target.value })} required />
          <Button type="submit">Buat Course</Button>
        </form>
        <form className="card form" onSubmit={createClass}>
          <h3>Buat Kelas</h3>
          <input placeholder="Nama kelas" value={clazz.name} onChange={e => setClazz({ ...clazz, name: e.target.value })} required />
          <select value={clazz.courseId} onChange={e => setClazz({ ...clazz, courseId: e.target.value })}>
            <option value="">Pilih course</option>
            {clsItems?.map((c: Record<string, unknown>) => <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}
          </select>
          <select value={clazz.teacherUserId} onChange={e => setClazz({ ...clazz, teacherUserId: e.target.value })}>
            <option value="">Pilih ustadz</option>
            {uItems?.map((u: Record<string, unknown>) => <option key={String(u.id)} value={String(u.id)}>{String(u.fullName ?? u.full_name)}</option>)}
          </select>
          <Button type="submit">Buat Kelas</Button>
        </form>
      </div>
      <div className="card">
        <h3>Daftar Kelas</h3>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Nama Kelas</th><th>Course</th><th>Ustadz</th><th>Aksi</th></tr></thead>
            <tbody>
              {clsItems?.map((c: Record<string, unknown>) => {
                const editing = editClassId === String(c.id);
                const editName = editingClass[String(c.id)] ?? String(c.name ?? '');
                async function saveEdit() {
                  try {
                    await api(`/v1/academic/classes/${c.id}`, { method: 'PATCH', body: JSON.stringify({ name: editName }) });
                    setEditClassId(null);
                    await (classes as { reload: () => Promise<void> }).reload();
                  } catch (e: unknown) { alert((e as Error).message); }
                }
                async function del() {
                  if (!confirm(`Hapus kelas ${String(c.name)}?`)) return;
                  try {
                    await api(`/v1/academic/classes/${c.id}`, { method: 'DELETE' });
                    await (classes as { reload: () => Promise<void> }).reload();
                  } catch (e: unknown) { alert((e as Error).message); }
                }
                return (
                  <tr key={String(c.id)}>
                    <td>
                      {editing
                        ? <input value={editName} onChange={e => setEditingClass({ ...editingClass, [String(c.id)]: e.target.value })} style={{ width: 'auto' }} />
                        : <strong>{String(c.name)}</strong>}
                    </td>
                    <td className="muted">{String(c.course_name ?? c.courseId ?? '-')}</td>
                    <td className="muted">{String(c.teacher_name ?? c.teacherUserId ?? '-')}</td>
                    <td>
                      <div className="actions">
                        {editing
                          ? <><Button onClick={() => void saveEdit()}>Simpan</Button><Button kind="secondary" onClick={() => setEditClassId(null)}>Batal</Button></>
                          : <Button kind="secondary" onClick={() => { setEditingClass({ ...editingClass, [String(c.id)]: String(c.name ?? '') }); setEditClassId(String(c.id)); }}>Edit</Button>}
                        <Button kind="danger" onClick={() => void del()}>Hapus</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(!clsItems || clsItems.length === 0) && <p className="muted">Belum ada kelas.</p>}
      </div>
    </div>
  );
}

function AssignmentsTab() {
  const dash = useRemote<unknown>('/v1/dashboard');
  const [file, setFile] = useState<Record<string, File | null>>({});
  const [message, setMessage] = useState('');

  const assignments = (dash.data as Record<string, unknown>)?.assignments as Array<Record<string, unknown>> | undefined;

  async function submit(a: Record<string, unknown>) {
    const f = file[String(a.id)];
    if (!f) return setMessage('Pilih file terlebih dahulu');
    try {
      setMessage('Mengunggah...');
      const intent = await api(`/v1/academic/assignments/${a.id}/uploads`, {
        method: 'POST', body: JSON.stringify({ originalName: f.name, contentType: f.type || 'application/octet-stream' }),
      });
      const put = await fetch(String((intent as Record<string, unknown>).url), {
        method: 'PUT', body: f, headers: { 'content-type': f.type || 'application/octet-stream' },
      });
      if (!put.ok) throw new Error(`Upload gagal (${put.status})`);
      await api(`/v1/academic/assignments/${a.id}/submissions`, {
        method: 'POST', body: JSON.stringify({ uploadId: (intent as Record<string, unknown>).uploadId }),
      });
      setMessage('Tugas terkirim!');
      await (dash as { reload: () => Promise<void> }).reload();
    } catch (e: unknown) { setMessage((e as Error).message); }
  }

  return (
    <div className="stack">
      <h2>Tugas Saya</h2>
      {message && <div className="notice">{message}</div>}
      {assignments?.map((a: Record<string, unknown>) => (
        <div className="card" key={String(a.id)}>
          <h3>{String(a.title)}</h3>
          <div className="muted">{String(a.description ?? '')}</div>
          {a.due_at && <div className="muted">Deadline: {new Date(String(a.due_at)).toLocaleString('id-ID')}</div>}
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="file"
              onChange={e => setFile({ ...file, [String(a.id)]: e.target.files?.[0] ?? null })}
              style={{ width: 'auto' }}
            />
            <Button onClick={() => void submit(a)} disabled={!file[String(a.id)]}>
              Kirim
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AiPanel() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [answer, setAnswer] = useState('');
  const models = useRemote<unknown>('/v1/models');
  useEffect(() => {
    const modelList = (models.data as Record<string, unknown>)?.data as Array<Record<string, unknown>> | undefined;
    if (!model && modelList?.[0]?.id) setModel(String(modelList[0].id));
  }, [models.data, model]);

  async function chat(e: React.FormEvent) {
    e.preventDefault();
    try {
      setAnswer('Memproses...');
      const out = await api<Record<string, unknown>>('/v1/chat/completions', {
        method: 'POST', body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], stream: false }),
      });
      setAnswer(String(out?.choices?.[0]?.message?.content ?? 'AI tidak merespons. Coba lagi dengan model lain.'));
    } catch (e: unknown) { setAnswer((e as Error).message); }
  }

  return (
    <div className="stack">
      <h2>AI Assistant</h2>
      <form className="card form" onSubmit={chat}>
        <select value={model} onChange={e => setModel(e.target.value)}>
          {((models.data as Record<string, unknown>)?.data as Array<Record<string, unknown>> | undefined)?.map((m: Record<string, unknown>) => (
            <option key={String(m.id)} value={String(m.id)}>{String(m.id)}</option>
          ))}
        </select>
        <textarea placeholder="Tulis pertanyaan..." value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} />
        <Button type="submit" disabled={!prompt}>Kirim</Button>
      </form>
      {answer && <div className="card"><div className="code">{answer}</div></div>}
    </div>
  );
}

function AiAgentsTab({ admin }: { admin?: boolean }) {
  const wallet = useRemote<unknown>('/v1/ai/wallet');
  const agents = useRemote<unknown>('/v1/hermes/agents');
  const [name, setName] = useState('Coding Agent');
  const [message, setMessage] = useState('');
  const [grant, setGrant] = useState({ userId: '', credits: 100, reason: 'Admin grant' });

  async function build(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try { const out = await api('/v1/hermes/agents', { method: 'POST', body: JSON.stringify({ displayName: name }) }); setMessage(`Build queued: ${String((out as Record<string, unknown>).profileName)}`); await (agents as { reload: () => Promise<void> }).reload(); } catch (e: unknown) { setMessage((e as Error).message); }
  }
  async function archive(id: string) {
    try { await api(`/v1/hermes/agents/${id}/archive`, { method: 'POST' }); setMessage('Archive queued'); await (agents as { reload: () => Promise<void> }).reload(); } catch (e: unknown) { setMessage((e as Error).message); }
  }
  async function grantCredits(e: React.FormEvent) {
    e.preventDefault();
    try { const out = await api('/v1/ai/grant', { method: 'POST', body: JSON.stringify(grant) }); setMessage(`Credits granted to ${String((out as Record<string, unknown>).userId)}`); } catch (e: unknown) { setMessage((e as Error).message); }
  }

  return (
    <div className="stack">
      <h2>AI & Agents</h2>
      {message && <div className="notice">{message}</div>}
      <div className="card"><div className="muted">Wallet</div><div className="metric">{String(((wallet.data as Record<string, unknown>)?.ai_credits ?? 0))}</div></div>
      {admin && (
        <form className="card form" onSubmit={grantCredits}>
          <h3>Grant Credits</h3>
          <input placeholder="User ID" value={grant.userId} onChange={e => setGrant({ ...grant, userId: e.target.value })} />
          <input type="number" value={grant.credits} onChange={e => setGrant({ ...grant, credits: Number(e.target.value) })} />
          <Button type="submit">Grant</Button>
        </form>
      )}
      {admin && <AdminHermesAuditPanel />}
      <div className="card">
        <h3>Hermes Agents</h3>
        <div style={{ display: 'flex', gap: 8 }} className="form">
          <input value={name} onChange={e => setName(e.target.value)} />
          <Button onClick={build}>Build Agent</Button>
        </div>
        {((agents.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined)?.map((a: Record<string, unknown>) => (
          <div key={String(a.id)} className="notification">
            <strong>{String(a.display_name)}</strong>
            <div className="muted">{String(a.profile_name)} &middot; {String(a.status)}</div>
            <Button kind="danger" onClick={() => void archive(String(a.id))}>Archive</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpsTab() {
  const health = useRemote<unknown>('/v1/ops/health');
  const events = useRemote<unknown>('/v1/ops/events');
  return (
    <div className="stack">
      <div className="sectionTitle"><h2>Operations</h2><Button kind="secondary" onClick={() => { void (health as { reload: () => Promise<void> }).reload(); void (events as { reload: () => Promise<void> }).reload(); }}>Refresh</Button></div>
      <div className="card"><h3>Health</h3>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Service</th><th>Status</th></tr></thead>
            <tbody>
              {(() => {
                const h = health.data as Record<string, unknown> | null;
                const checks = [
                  { label: 'PostgreSQL', ok: (h as any)?.postgres === 'ok' || (h as any)?.postgres === 'healthy' },
                  { label: 'MinIO', ok: (h as any)?.minio === 'ok' || (h as any)?.minio === 'healthy' },
                  { label: '9Router', ok: (h as any)?.router === 'ok' || (h as any)?.router === 'healthy' || (h as any)?.['9router'] === 'ok' },
                  { label: 'Worker', ok: (h as any)?.worker === 'running' || (h as any)?.worker === 'ok' },
                  { label: 'Redis', ok: (h as any)?.redis === 'ok' || (h as any)?.redis === 'healthy' },
                ];
                return checks.map(c => (
                  <tr key={c.label}>
                    <td>{c.label}</td>
                    <td>{c.ok ? <span style={{color:'#22c55e'}}>✅ OK</span> : h ? <span style={{color:'#ef4444'}}>❌ Down</span> : <span className="muted">—</span>}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h3>Alerts</h3>
        {((events.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined)?.map((e: Record<string, unknown>) => (
          <div key={String(e.id)} className="notification">
            <strong>{String(e.severity)} &middot; {String(e.kind)}</strong>
            <div>{String(e.message)}</div>
            <div className="muted">{String(e.source)} &middot; {new Date(String(e.created_at)).toLocaleString('id-ID')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlumniTranscriptPanel() {
  const grades = useRemote<unknown>('/v1/academic/my/grades');
  const items = (grades.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;
  return (
    <div className="stack">
      <h2>Transkrip Nilai</h2>
      {grades.error && <div className="notice error">{grades.error}</div>}
      {grades.loading && !grades.data && <p>Memuat...</p>}
      <div className="tableWrap">
        <table>
          <thead><tr><th>Mata Kuliah / Assignment</th><th>Nilai</th><th>Feedback</th><th>Tanggal</th></tr></thead>
          <tbody>
            {items?.map((g: Record<string, unknown>, i: number) => (
              <tr key={String(g.id ?? i)}>
                <td>{String(g.assignment_title ?? g.course_name ?? '-')}</td>
                <td><strong>{String(g.score ?? '-')}</strong></td>
                <td className="muted">{String(g.feedback ?? '-')}</td>
                <td className="muted">{g.created_at ? new Date(String(g.created_at)).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items?.length === 0 && !grades.loading && <div className="card"><p className="muted">Belum ada data nilai.</p></div>}
    </div>
  );
}

function AlumniPortfolioPanel() {
  const r = useRemote<unknown>('/v1/portfolio');
  const items = (r.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;
  return (
    <div className="stack">
      <h2>Portfolio Saya</h2>
      {r.error && <div className="notice error">{r.error}</div>}
      {r.loading && !r.data && <p>Memuat...</p>}
      <div className="grid">
        {items?.map((p: Record<string, unknown>) => (
          <div className="card" key={String(p.id)}>
            <div className="text-xs uppercase tracking-widest" style={{ color: '#c084fc' }}>Portfolio</div>
            <h3 style={{ marginTop: 8 }}>{String(p.title)}</h3>
            <div className="muted">{String(p.summary ?? 'Karya santri PMMI')}</div>
            {p.featured ? <span className="pill">Featured</span> : <span className="pill">Private</span>}
            {p.published_at && <div className="muted" style={{ marginTop: 8 }}>{new Date(String(p.published_at)).toLocaleDateString('id-ID')}</div>}
          </div>
        ))}
      </div>
      {items?.length === 0 && !r.loading && <div className="card"><p className="muted">Belum ada portfolio.</p></div>}
    </div>
  );
}

function UstadzRiwayatPanel() {
  const submissions = useRemote<unknown>('/v1/academic/submissions');
  const items = (submissions.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;
  const graded = items?.filter((s: Record<string, unknown>) => s.score !== null && s.score !== undefined) ?? [];
  return (
    <div className="stack">
      <h2>Riwayat Nilai</h2>
      {submissions.error && <div className="notice error">{submissions.error}</div>}
      {submissions.loading && !submissions.data && <p>Memuat...</p>}
      <div className="tableWrap">
        <table>
          <thead><tr><th>Santri</th><th>Tugas</th><th>Nilai</th><th>Feedback</th><th>Tanggal</th></tr></thead>
          <tbody>
            {graded.map((g: Record<string, unknown>, i: number) => (
              <tr key={String(g.id ?? i)}>
                <td>{String(g.student_name ?? '-')}</td>
                <td>{String(g.assignment_title ?? g.title ?? '-')}</td>
                <td><strong>{String(g.score ?? '-')}</strong></td>
                <td className="muted">{String(g.feedback ?? '-')}</td>
                <td className="muted">{g.graded_at ? new Date(String(g.graded_at)).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {graded.length === 0 && !submissions.loading && <div className="card"><p className="muted">Belum ada riwayat penilaian.</p></div>}
    </div>
  );
}

function RewardsTab() {
  const rewards = useRemote<unknown>('/v1/rewards');
  const [form, setForm] = useState({ userId: '', rewardRuleId: '', reason: 'Admin reward grant' });
  const [message, setMessage] = useState('');

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/v1/rewards/grant', { method: 'POST', body: JSON.stringify(form) });
      setMessage('Reward granted!');
      setForm({ ...form, userId: '', rewardRuleId: '' });
      await (rewards as { reload: () => Promise<void> }).reload();
    } catch (e: unknown) { setMessage((e as Error).message); }
  }

  const rules = (rewards.data as Record<string, unknown>)?.rules as Array<Record<string, unknown>> | undefined;
  const grants = (rewards.data as Record<string, unknown>)?.grants as Array<Record<string, unknown>> | undefined;

  return (
    <div className="stack">
      <h2>Rewards & Achievements</h2>
      {message && <div className="notice">{message}</div>}
      {rewards.error && <div className="notice error">{rewards.error}</div>}

      <div className="grid">
        <div className="card">
          <h3>Reward Rules</h3>
          {rules?.map((r: Record<string, unknown>) => (
            <div key={String(r.id)} className="notification">
              <strong>{String(r.name)}</strong>
              <div className="muted">{String(r.description ?? '')}</div>
              <span className="pill">{String(r.type)} &middot; {String(r.value)}</span>
            </div>
          ))}
          {(!rules || rules.length === 0) && <p className="muted">Belum ada reward rules.</p>}
        </div>

        <div className="card">
          <h3>Grant History</h3>
          {grants?.map((g: Record<string, unknown>) => (
            <div key={String(g.id)} className="notification">
              <strong>{String(g.user_name ?? g.userId)}</strong>
              <div className="muted">{String(g.reason ?? '')}</div>
              <span className="pill">{String(g.type)}</span>
              <div className="muted">{g.created_at ? new Date(String(g.created_at)).toLocaleString('id-ID') : ''}</div>
            </div>
          ))}
          {(!grants || grants.length === 0) && <p className="muted">Belum ada grant history.</p>}
        </div>
      </div>

      <form className="card form" onSubmit={grant}>
        <h3>Grant Reward</h3>
        <div className="formRow">
          <input placeholder="User ID" value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} required />
          <select value={form.rewardRuleId} onChange={e => setForm({ ...form, rewardRuleId: e.target.value })}>
            <option value="">Pilih reward rule</option>
            {rules?.map((r: Record<string, unknown>) => <option key={String(r.id)} value={String(r.id)}>{String(r.name)}</option>)}
          </select>
        </div>
        <input placeholder="Alasan" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
        <Button type="submit">Grant</Button>
      </form>
    </div>
  );
}
