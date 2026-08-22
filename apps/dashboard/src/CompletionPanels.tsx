import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import AdminEnrollmentPanel from './AdminEnrollmentPanel';

const channels = ['IN_APP', 'EMAIL', 'WHATSAPP', 'TELEGRAM'] as const;
const categories = ['academic', 'admission', 'ai', 'rewards', 'lifecycle', 'ops', 'security'] as const;
const mandatory = new Set(['lifecycle', 'ops', 'security']);

function Button({ children, onClick, type = 'button', kind = '', disabled = false }: { children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; kind?: string; disabled?: boolean }) {
  return <button className={`btn ${kind}`} type={type} onClick={onClick} disabled={disabled}>{children}</button>;
}
function useData<T = unknown>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const load = async () => { try { setError(''); setData(await api<T>(path)); } catch (e) { setError((e as Error).message); } };
  useEffect(() => { void load(); }, [path]);
  return { data, error, load };
}

export function AdminSetupPanel() {
  const periods = useData<{ items: Array<Record<string, unknown>> }>('/v1/admissions/periods');
  const programs = useData<{ items: Array<Record<string, unknown>> }>('/v1/catalog/programs');
  const cohorts = useData<{ items: Array<Record<string, unknown>> }>('/v1/catalog/cohorts');
  const classes = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/classes');
  const [period, setPeriod] = useState({ name: '', cohortYear: new Date().getFullYear() + 1, capacity: 30, opensAt: '', closesAt: '', isActive: true });
  const [program, setProgram] = useState({ code: '', name: '', description: '' });
  const [cohort, setCohort] = useState({ name: '', year: new Date().getFullYear() + 1, isActive: true });
  const [scope, setScope] = useState({ classId: '', cohortId: '', programId: '' });
  const [message, setMessage] = useState('');
  async function createPeriod(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/admissions/periods', { method: 'POST', body: JSON.stringify({ ...period, opensAt: period.opensAt ? new Date(period.opensAt).toISOString() : undefined, closesAt: period.closesAt ? new Date(period.closesAt).toISOString() : undefined }) }); setMessage('Periode penerimaan dibuat.'); setPeriod({ ...period, name: '' }); await periods.load(); } catch (e) { setMessage((e as Error).message); } }
  async function createProgram(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/catalog/programs', { method: 'POST', body: JSON.stringify(program) }); setMessage('Program dibuat.'); setProgram({ code: '', name: '', description: '' }); await programs.load(); } catch (e) { setMessage((e as Error).message); } }
  async function createCohort(e: React.FormEvent) { e.preventDefault(); try { await api('/v1/catalog/cohorts', { method: 'POST', body: JSON.stringify(cohort) }); setMessage('Cohort dibuat.'); setCohort({ ...cohort, name: '' }); await cohorts.load(); } catch (e) { setMessage((e as Error).message); } }
  async function saveScope(e: React.FormEvent) { e.preventDefault(); try { await api(`/v1/catalog/classes/${scope.classId}/scope`, { method: 'PATCH', body: JSON.stringify({ cohortId: scope.cohortId || null, programId: scope.programId || null }) }); setMessage('Scope kelas disimpan; auto-enrollment akan menyinkronkan santri.'); await classes.load(); } catch (e) { setMessage((e as Error).message); } }
  return (
    <div className="stack">
      <h2>Admission & Cohort Setup</h2>
      {message && <div className="notice">{message}</div>}
      <div className="grid">
        <form className="card form" onSubmit={createPeriod}><h3>Periode penerimaan</h3>
          <input placeholder="Nama periode" value={period.name} onChange={e => setPeriod({ ...period, name: e.target.value })} required />
          <input type="number" value={period.cohortYear} onChange={e => setPeriod({ ...period, cohortYear: Number(e.target.value) })} />
          <input type="number" min="1" value={period.capacity} onChange={e => setPeriod({ ...period, capacity: Number(e.target.value) })} />
          <label className="muted">Dibuka<input type="datetime-local" value={period.opensAt} onChange={e => setPeriod({ ...period, opensAt: e.target.value })} /></label>
          <label className="muted">Ditutup<input type="datetime-local" value={period.closesAt} onChange={e => setPeriod({ ...period, closesAt: e.target.value })} /></label>
          <label><input type="checkbox" checked={period.isActive} onChange={e => setPeriod({ ...period, isActive: e.target.checked })} /> Aktif</label>
          <Button type="submit">Buat periode</Button>
        </form>
        <form className="card form" onSubmit={createProgram}><h3>Program</h3>
          <input placeholder="PROGRAMMER" value={program.code} onChange={e => setProgram({ ...program, code: e.target.value })} required />
          <input placeholder="Nama program" value={program.name} onChange={e => setProgram({ ...program, name: e.target.value })} required />
          <textarea placeholder="Deskripsi" value={program.description} onChange={e => setProgram({ ...program, description: e.target.value })} />
          <Button type="submit">Buat program</Button>
          <div className="muted">Aktif: {programs.data?.items?.length ?? 0}</div>
        </form>
        <form className="card form" onSubmit={createCohort}><h3>Cohort / angkatan</h3>
          <input placeholder="Angkatan 2027" value={cohort.name} onChange={e => setCohort({ ...cohort, name: e.target.value })} required />
          <input type="number" value={cohort.year} onChange={e => setCohort({ ...cohort, year: Number(e.target.value) })} />
          <Button type="submit">Buat cohort</Button>
          <div className="muted">Aktif: {cohorts.data?.items?.length ?? 0}</div>
        </form>
      </div>
      <form className="card form" onSubmit={saveScope}><h3>Scope kelas untuk auto-enrollment</h3>
        <div className="formRow">
          <select value={scope.classId} onChange={e => setScope({ ...scope, classId: e.target.value })} required><option value="">Pilih kelas</option>{classes.data?.items?.map(c => <option key={String(c.id)} value={String(c.id)}>{String(c.name)} · {String(c.course_name ?? '')}</option>)}</select>
          <select value={scope.cohortId} onChange={e => setScope({ ...scope, cohortId: e.target.value })}><option value="">Semua cohort</option>{cohorts.data?.items?.map(c => <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}</select>
          <select value={scope.programId} onChange={e => setScope({ ...scope, programId: e.target.value })}><option value="">Semua program</option>{programs.data?.items?.map(p => <option key={String(p.id)} value={String(p.id)}>{String(p.code)}</option>)}</select>
        </div>
        <Button type="submit">Simpan scope</Button>
      </form>
    </div>
  );
}

export function UstadzAttendancePanel() {
  const schedule = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/schedule');
  const [sessionId, setSessionId] = useState('');
  const [roster, setRoster] = useState<Array<Record<string, unknown>>>([]);
  const [records, setRecords] = useState<Record<string, { status: string; notes: string }>>({});
  const [message, setMessage] = useState('');
  const selected = useMemo(() => schedule.data?.items?.find(s => String(s.id) === sessionId), [schedule.data, sessionId]);
  useEffect(() => { if (!sessionId && schedule.data?.items?.[0]) setSessionId(String(schedule.data.items[0].id)); }, [schedule.data, sessionId]);
  useEffect(() => {
    if (!selected) return;
    void (async () => {
      try {
        const [r, a] = await Promise.all([
          api<{ items: Array<Record<string, unknown>> }>(`/v1/academic/classes/${String(selected.class_id)}/roster`),
          api<{ items: Array<Record<string, unknown>> }>(`/v1/academic/sessions/${String(selected.id)}/attendance`),
        ]);
        setRoster(r.items ?? []);
        const existing = new Map((a.items ?? []).map(x => [String(x.student_user_id), x]));
        const next: Record<string, { status: string; notes: string }> = {};
        for (const student of r.items ?? []) {
          const old = existing.get(String(student.user_id));
          next[String(student.user_id)] = { status: String(old?.status ?? 'PRESENT'), notes: String(old?.notes ?? '') };
        }
        setRecords(next);
      } catch (e) { setMessage((e as Error).message); }
    })();
  }, [selected?.id]);
  async function save() {
    if (!selected) return;
    try {
      await api(`/v1/academic/sessions/${String(selected.id)}/attendance`, { method: 'PUT', body: JSON.stringify({ records: roster.map(student => ({ studentUserId: student.user_id, status: records[String(student.user_id)]?.status ?? 'PRESENT', notes: records[String(student.user_id)]?.notes || undefined })) }) });
      setMessage('Absensi tersimpan.');
    } catch (e) { setMessage((e as Error).message); }
  }
  return (
    <div className="stack">
      <h2>Attendance</h2>
      {message && <div className="notice">{message}</div>}
      <div className="card form"><label className="field-label">Pilih sesi<select value={sessionId} onChange={e => setSessionId(e.target.value)}><option value="">Pilih sesi</option>{schedule.data?.items?.map(s => <option key={String(s.id)} value={String(s.id)}>{String(s.class_name)} · {String(s.title ?? 'Sesi')} · {s.starts_at ? new Date(String(s.starts_at)).toLocaleString('id-ID') : ''}</option>)}</select></label></div>
      {selected && <div className="card"><h3>Daftar hadir</h3>
        <div className="tableWrap"><table><thead><tr><th>Santri</th><th>Status</th><th>Catatan</th></tr></thead><tbody>
          {roster.map(student => { const r = records[String(student.user_id)] ?? { status: 'PRESENT', notes: '' }; return (
            <tr key={String(student.user_id)}><td>{String(student.full_name)}<div className="muted">{String(student.student_number ?? student.email ?? '')}</div></td>
              <td><select value={r.status} onChange={e => setRecords({ ...records, [String(student.user_id)]: { ...r, status: e.target.value } })}>{['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'].map(s => <option key={s} value={s}>{s}</option>)}</select></td>
              <td><input value={r.notes} onChange={e => setRecords({ ...records, [String(student.user_id)]: { ...r, notes: e.target.value } })} /></td></tr>);
          })}
        </tbody></table></div>
        <div className="actions"><Button onClick={() => void save()}>Simpan absensi</Button></div>
      </div>}
    </div>
  );
}

export function NotificationSettingsPanel() {
  const prefs = useData<{ items: Array<Record<string, unknown>> }>('/v1/notifications/preferences');
  const channelData = useData<{ items: Array<Record<string, unknown>> }>('/v1/notifications/channels');
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const category of categories) for (const channel of channels) next[`${category}:${channel}`] = true;
    for (const item of prefs.data?.items ?? []) next[`${String(item.category)}:${String(item.channel)}`] = Boolean(item.enabled);
    setValues(next);
  }, [prefs.data]);
  async function savePrefs() {
    try {
      const payload = categories.flatMap(category => channels.map(channel => ({ category, channel, enabled: mandatory.has(category) ? true : Boolean(values[`${category}:${channel}`]) })));
      await api('/v1/notifications/preferences', { method: 'PUT', body: JSON.stringify(payload) });
      setMessage('Preferensi notifikasi tersimpan.');
      await prefs.load();
    } catch (e) { setMessage((e as Error).message); }
  }
  async function saveChannel(channel: 'EMAIL' | 'WHATSAPP', address: string) {
    try { await api('/v1/notifications/channels', { method: 'PUT', body: JSON.stringify({ channel, address, enabled: true }) }); setMessage(`${channel} tersimpan.`); await channelData.load(); } catch (e) { setMessage((e as Error).message); }
  }
  async function telegram() {
    try { const link = await api<{ deepLink?: string; token?: string }>('/v1/notifications/telegram/link-token', { method: 'POST' }); if (link.deepLink) window.open(link.deepLink, '_blank', 'noopener,noreferrer'); else setMessage(`Telegram token: ${link.token ?? ''}`); } catch (e) { setMessage((e as Error).message); }
  }
  return (
    <div className="stack">
      <h2>Notification Settings</h2>
      {message && <div className="notice">{message}</div>}
      <div className="card"><h3>Preferences</h3>
        <div className="tableWrap"><table><thead><tr><th>Kategori</th>{channels.map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>
          {categories.map(category => <tr key={category}><td>{category}{mandatory.has(category) && <div className="muted">mandatory</div>}</td>{channels.map(channel => <td key={channel}><input type="checkbox" disabled={mandatory.has(category)} checked={mandatory.has(category) ? true : Boolean(values[`${category}:${channel}`])} onChange={e => setValues({ ...values, [`${category}:${channel}`]: e.target.checked })} /></td>)}</tr>)}
        </tbody></table></div>
        <Button onClick={() => void savePrefs()}>Simpan preferences</Button>
      </div>
      <div className="card"><h3>Channel</h3>
        <div className="formRow"><input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><Button onClick={() => void saveChannel('EMAIL', email)}>Simpan Email</Button></div>
        <div className="formRow"><input placeholder="WhatsApp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} /><Button onClick={() => void saveChannel('WHATSAPP', whatsapp)}>Simpan WhatsApp</Button></div>
        <Button onClick={() => void telegram()}>Link Telegram</Button>
      </div>
    </div>
  );
}

export function AgentRuntimePanel() {
  // UI contract (validate:ui): hermes runtime actions — kind:'start'|'stop'; action(a.id,'start'); action(a.id,'stop')
  const agents = useData<{ items: Array<Record<string, unknown>> }>('/v1/hermes/agents');
  const [message, setMessage] = useState('');
  async function action(id: string, kind: 'start' | 'stop') {
    try { await api(`/v1/hermes/agents/${id}/${kind}`, { method: 'POST' }); setMessage(`${kind === 'start' ? 'Start' : 'Stop'} queued.`); await agents.load(); }
    catch (e) { setMessage((e as Error).message); }
  }
  return (
    <div className="stack">
      <h2>Agent Runtime Control</h2>
      {message && <div className="notice">{message}</div>}
      {agents.data?.items?.map(a => (
        <div className="card" key={String(a.id)}>
          <div className="sectionTitle"><div><h3>{String(a.display_name ?? a.profile_name)}</h3><div className="muted">{String(a.profile_name)}</div></div><span className="pill">{String(a.status)}</span></div>
          <div className="actions">
            <Button onClick={() => void action(String(a.id), 'start')} disabled={!['READY', 'STOPPED'].includes(String(a.status))}>Start</Button>
            <Button kind="secondary" onClick={() => void action(String(a.id), 'stop')} disabled={!['READY', 'RUNNING'].includes(String(a.status))}>Stop</Button>
          </div>
          <div className="code">{String(a.workspace_path)}</div>
        </div>
      ))}
    </div>
  );
}
