import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useData, Notice, Empty, SearchBox, useSearch, ConfirmDelete, Field } from './common';

export function UstadzOverviewPanel() {
  const classes = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/classes');
  const subs = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/submissions');
  const pending = (subs.data?.items ?? []).filter(s => s.score === null || s.score === undefined);
  return (
    <div className="stack">
      <h2>Ringkasan Mengajar</h2>
      <div className="grid">
        <div className="card"><h3>Kelas</h3><div className="stat">{classes.data?.items?.length ?? 0}</div></div>
        <div className="card"><h3>Menunggu Penilaian</h3><div className="stat">{pending.length}</div></div>
      </div>
    </div>
  );
}

export function UstadzClassPanel() {
  const classes = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/classes');
  const schedule = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/schedule');
  const [selClass, setSelClass] = useState('');
  const [assignments, setAssignments] = useState<Array<Record<string, unknown>> | null>(null);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [assignForm, setAssignForm] = useState({ title: '', description: '', maxScore: 100, dueAt: '' });
  const [sessionForm, setSessionForm] = useState({ title: '', startsAt: '', endsAt: '' });

  useEffect(() => {
    if (!selClass) { setAssignments(null); return; }
    let alive = true;
    api<{ items: Array<Record<string, unknown>> }>(`/v1/academic/classes/${selClass}/assignments`)
      .then(d => { if (alive) setAssignments(d.items ?? []); })
      .catch(() => { if (alive) setAssignments([]); });
    return () => { alive = false; };
  }, [selClass]);

  async function reloadAssignments() {
    if (!selClass) return;
    const d = await api<{ items: Array<Record<string, unknown>> }>(`/v1/academic/classes/${selClass}/assignments`);
    setAssignments(d.items ?? []);
  }
  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    try { await api('/v1/academic/assignments', { method: 'POST', body: JSON.stringify({ classId: selClass, ...assignForm, dueAt: assignForm.dueAt ? new Date(assignForm.dueAt).toISOString() : undefined }) }); setNotice({ kind: 'success', text: 'Tugas dibuat.' }); setAssignForm({ title: '', description: '', maxScore: 100, dueAt: '' }); await reloadAssignments(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function patchAssignment(id: string) {
    const title = window.prompt('Judul baru:'); if (!title) return;
    try { await api(`/v1/academic/assignments/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }); setNotice({ kind: 'success', text: 'Tugas diperbarui.' }); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function delAssignment(id: string) {
    if (!window.confirm('Hapus tugas?')) return;
    try { await api(`/v1/academic/assignments/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Tugas dihapus.' }); await reloadAssignments(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    try { await api('/v1/academic/sessions', { method: 'POST', body: JSON.stringify({ classId: selClass, ...sessionForm, startsAt: new Date(sessionForm.startsAt).toISOString(), endsAt: new Date(sessionForm.endsAt).toISOString() }) }); setNotice({ kind: 'success', text: 'Sesi dibuat.' }); setSessionForm({ title: '', startsAt: '', endsAt: '' }); await schedule.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function delSession(id: string) { if (!window.confirm('Hapus sesi?')) return; try { await api(`/v1/academic/sessions/${id}`, { method: 'DELETE' }); setNotice({ kind: 'success', text: 'Sesi dihapus.' }); await schedule.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); } }

  return (
    <div className="stack">
      <h2>Kelas & Tugas</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <div className="card form"><label className="field-label">Pilih kelas<select value={selClass} onChange={e => setSelClass(e.target.value)}><option value="">— pilih kelas —</option>{classes.data?.items?.map(c => <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}</select></label></div>
      {selClass && <>
        <form className="card form" onSubmit={createAssignment}><h3>Tugas baru</h3>
          <input placeholder="Judul" value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} required />
          <input placeholder="Deskripsi" value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })} />
          <div className="formRow"><input type="datetime-local" value={assignForm.dueAt} onChange={e => setAssignForm({ ...assignForm, dueAt: e.target.value })} /><button className="btn" type="submit">Buat tugas</button></div>
        </form>
        <div className="card"><h3>Daftar tugas</h3>{assignments?.map(a => <div className="notification" key={String(a.id)}><strong>{String(a.title)}</strong><span className="muted">{String(a.description ?? '')}</span><div className="actions"><button type="button" className="btn secondary" onClick={() => void patchAssignment(String(a.id))}>Ubah</button><ConfirmDelete onDelete={() => void delAssignment(String(a.id))} /></div></div>)}{assignments && assignments.length === 0 && <Empty text="Belum ada tugas." />}</div>
        <form className="card form" onSubmit={createSession}><h3>Sesi baru</h3>
          <input placeholder="Judul sesi" value={sessionForm.title} onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })} />
          <div className="formRow"><input type="datetime-local" value={sessionForm.startsAt} onChange={e => setSessionForm({ ...sessionForm, startsAt: e.target.value })} required /><input type="datetime-local" value={sessionForm.endsAt} onChange={e => setSessionForm({ ...sessionForm, endsAt: e.target.value })} required /><button className="btn" type="submit">Buat sesi</button></div>
        </form>
        <div className="card"><h3>Sesi kelas ini</h3>{schedule.data?.items?.filter(s => String(s.class_id) === selClass).map(s => <div className="notification" key={String(s.id)}><strong>{String(s.title ?? 'Sesi')}</strong><span className="muted">{s.starts_at ? new Date(String(s.starts_at)).toLocaleString('id-ID') : ''}</span><ConfirmDelete onDelete={() => void delSession(String(s.id))} /></div>)}{schedule.data && schedule.data.items.filter(s => String(s.class_id) === selClass).length === 0 && <Empty text="Belum ada sesi." />}</div>
      </>}
    </div>
  );
}

export function AttendancePanel() {
  const schedule = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/schedule');
  const [sessionId, setSessionId] = useState('');
  const [roster, setRoster] = useState<Array<Record<string, unknown>>>([]);
  const [records, setRecords] = useState<Record<string, { status: string; notes: string }>>({});
  const [message, setMessage] = useState('');
  const selected = useMemo(() => schedule.data?.items?.find(s => String(s.id) === sessionId), [schedule.data, sessionId]);
  useEffect(() => { if (!sessionId && schedule.data?.items?.[0]) setSessionId(String(schedule.data.items[0].id)); }, [schedule.data, sessionId]);
  useEffect(() => {
    if (!selected) return;
    let alive = true;
    void (async () => {
      try {
        const [r, a] = await Promise.all([
          api<{ items: Array<Record<string, unknown>> }>(`/v1/academic/classes/${String(selected.class_id)}/roster`),
          api<{ items: Array<Record<string, unknown>> }>(`/v1/academic/sessions/${String(selected.id)}/attendance`),
        ]);
        if (!alive) return;
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
    return () => { alive = false; };
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
      <h2>Absensi</h2>
      <Notice kind="error">{message}</Notice>
      <div className="card form"><label className="field-label">Pilih sesi<select value={sessionId} onChange={e => setSessionId(e.target.value)}><option value="">— pilih sesi —</option>{schedule.data?.items?.map(s => <option key={String(s.id)} value={String(s.id)}>{String(s.class_name)} · {String(s.title ?? 'Sesi')}</option>)}</select></label></div>
      {selected && <div className="card"><h3>Daftar hadir</h3>
        <div className="tableWrap"><table><thead><tr><th>Santri</th><th>Status</th><th>Catatan</th></tr></thead><tbody>
          {roster.map(student => { const r = records[String(student.user_id)] ?? { status: 'PRESENT', notes: '' }; return (
            <tr key={String(student.user_id)}><td>{String(student.full_name)}<div className="muted">{String(student.student_number ?? student.email ?? '')}</div></td>
              <td><select value={r.status} onChange={e => setRecords({ ...records, [String(student.user_id)]: { ...r, status: e.target.value } })}>{['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'].map(s => <option key={s} value={s}>{s}</option>)}</select></td>
              <td><input value={r.notes} onChange={e => setRecords({ ...records, [String(student.user_id)]: { ...r, notes: e.target.value } })} /></td></tr>);
          })}
        </tbody></table></div>
        <div className="actions"><button className="btn" type="button" onClick={() => void save()}>Simpan absensi</button></div>
      </div>}
    </div>
  );
}

export function GradingPanel() {
  const subs = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/submissions');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [score, setScore] = useState(100);
  const [feedback, setFeedback] = useState('');
  const pending = (subs.data?.items ?? []).filter(s => s.score === null || s.score === undefined);
  const { q, setQ, filtered } = useSearch(pending, [s => String(s.student_name ?? ''), s => String(s.assignment_title ?? '')]);

  async function grade(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    try { await api(`/v1/academic/submissions/${String(selected.id)}/grade`, { method: 'POST', body: JSON.stringify({ score, feedback, revisionRequired: false }) }); setNotice({ kind: 'success', text: 'Nilai disimpan.' }); setSelected(null); setFeedback(''); await subs.reload(); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function feature(sub: Record<string, unknown>) {
    const title = window.prompt('Judul portfolio:') ?? String(sub.assignment_title ?? 'Karya');
    const slug = window.prompt('Slug (mis. karya-santri):') ?? `karya-${String(sub.id).slice(0, 8)}`;
    try { await api(`/v1/academic/submissions/${String(sub.id)}/feature`, { method: 'POST', body: JSON.stringify({ title, slug }) }); setNotice({ kind: 'success', text: 'Karya di-feature → publik.' }); } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  return (
    <div className="stack">
      <h2>Penilaian</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      {selected ? (
        <form className="card form" onSubmit={grade}><h3>Nilai: {String(selected.student_name)} — {String(selected.assignment_title)}</h3>
          <input type="number" min="0" max="100" value={score} onChange={e => setScore(Number(e.target.value))} />
          <textarea placeholder="Feedback" value={feedback} onChange={e => setFeedback(e.target.value)} />
          <div className="actions"><button className="btn" type="submit">Simpan nilai</button><button type="button" className="btn secondary" onClick={() => setSelected(null)}>Batal</button></div>
        </form>
      ) : (
        <div className="card">
          <SearchBox value={q} onChange={setQ} placeholder="Cari santri/tugas…" />
          <div className="tableWrap"><table><thead><tr><th>Santri</th><th>Tugas</th><th>Kelas</th><th></th></tr></thead><tbody>
            {(filtered ?? []).map(s => <tr key={String(s.id)}><td>{String(s.student_name)}</td><td>{String(s.assignment_title)}</td><td>{String(s.class_name ?? '-')}</td><td className="actions"><button type="button" className="btn" onClick={() => { setSelected(s); setScore(100); }}>Nilai</button><button type="button" className="btn secondary" onClick={() => void feature(s)}>Feature</button></td></tr>)}
          </tbody></table></div>
          {(filtered ?? []).length === 0 && !subs.loading && <Empty text="Tidak ada submission menunggu penilaian." />}
        </div>
      )}
    </div>
  );
}

export function UstadzHistoryPanel() {
  const subs = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/submissions');
  const graded = (subs.data?.items ?? []).filter(s => s.score !== null && s.score !== undefined);
  const { q, setQ, filtered } = useSearch(graded, [s => String(s.student_name ?? ''), s => String(s.assignment_title ?? '')]);
  return (
    <div className="stack">
      <h2>Riwayat Penilaian</h2>
      <div className="card">
        <SearchBox value={q} onChange={setQ} />
        <div className="tableWrap"><table><thead><tr><th>Santri</th><th>Tugas</th><th>Nilai</th><th>Feedback</th><th>Tanggal</th></tr></thead><tbody>
          {(filtered ?? []).map(g => <tr key={String(g.id)}><td>{String(g.student_name)}</td><td>{String(g.assignment_title)}</td><td><strong>{String(g.score)}</strong></td><td className="muted">{String(g.feedback ?? '-')}</td><td className="muted">{g.graded_at ? new Date(String(g.graded_at)).toLocaleDateString('id-ID') : '-'}</td></tr>)}
        </tbody></table></div>
        {(filtered ?? []).length === 0 && !subs.loading && <Empty text="Belum ada riwayat." />}
      </div>
    </div>
  );
}
