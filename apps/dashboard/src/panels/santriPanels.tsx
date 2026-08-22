import React, { useState } from 'react';
import { api } from '../api';
import { useData, Notice, Empty, SearchBox, useSearch } from './common';

type Dash = {
  assignments?: Array<Record<string, unknown>>;
  grades?: Array<Record<string, unknown>>;
  aiWallet?: { balance: number };
  agents?: Array<Record<string, unknown>>;
  certificates?: Array<Record<string, unknown>>;
  unreadNotifications?: number;
};

export function SantriOverviewPanel() {
  const dash = useData<Dash>('/v1/dashboard');
  const d = dash.data;
  return (
    <div className="stack">
      <h2>Hari Ini</h2>
      <div className="grid">
        <div className="card"><h3>Tugas</h3><div className="stat">{d?.assignments?.length ?? 0}</div></div>
        <div className="card"><h3>Kredit AI</h3><div className="stat">{d?.aiWallet?.balance ?? 0}</div></div>
        <div className="card"><h3>Agent AI</h3><div className="stat">{d?.agents?.length ?? 0}</div></div>
        <div className="card"><h3>Notifikasi Belum Dibaca</h3><div className="stat">{d?.unreadNotifications ?? 0}</div></div>
      </div>
      {dash.error && <Notice kind="error">{dash.error}</Notice>}
    </div>
  );
}

export function TasksPanel() {
  const dash = useData<Dash>('/v1/dashboard');
  const [file, setFile] = useState<Record<string, File | null>>({});
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const assignments = dash.data?.assignments ?? [];
  const { q, setQ, filtered } = useSearch(assignments, [a => String(a.title ?? ''), a => String(a.class_name ?? '')]);

  async function submit(a: Record<string, unknown>) {
    const f = file[String(a.id)];
    if (!f) return setNotice({ kind: 'error', text: 'Pilih file terlebih dahulu.' });
    try {
      setNotice({ kind: 'success', text: 'Mengunggah…' });
      const intent = await api<{ uploadId: string; url: string }>(`/v1/academic/assignments/${String(a.id)}/uploads`, { method: 'POST', body: JSON.stringify({ originalName: f.name, contentType: f.type || 'application/octet-stream' }) });
      const put = await fetch(intent.url, { method: 'PUT', body: f, headers: { 'content-type': f.type || 'application/octet-stream' } });
      if (!put.ok) throw new Error(`Upload gagal (${put.status})`);
      await api(`/v1/academic/assignments/${String(a.id)}/submissions`, { method: 'POST', body: JSON.stringify({ uploadIds: [intent.uploadId], notes: 'Dikirim via dashboard' }) });
      setNotice({ kind: 'success', text: 'Tugas terkirim.' });
      setFile({ ...file, [String(a.id)]: null });
      await dash.reload();
    } catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }

  return (
    <div className="stack">
      <h2>Tugas Saya</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <div className="card">
        <SearchBox value={q} onChange={setQ} />
        {(filtered ?? []).map(a => (
          <div className="notification" key={String(a.id)}>
            <div className="sectionTitle"><div><strong>{String(a.title)}</strong><div className="muted">{String(a.class_name)} · Batas: {a.due_at ? new Date(String(a.due_at)).toLocaleString('id-ID') : '—'}</div></div><span className="pill">{String(a.submission_status ?? 'belum dikumpul')}</span></div>
            <div className="formRow">
              <input type="file" onChange={e => setFile({ ...file, [String(a.id)]: e.target.files?.[0] ?? null })} />
              <button className="btn" type="button" onClick={() => void submit(a)} disabled={!file[String(a.id)]}>Kumpulkan</button>
            </div>
          </div>
        ))}
        {(filtered ?? []).length === 0 && !dash.loading && <Empty text="Tidak ada tugas aktif." />}
      </div>
    </div>
  );
}

export function GradesPanel() {
  const dash = useData<Dash>('/v1/dashboard');
  const grades = dash.data?.grades ?? [];
  return (
    <div className="stack">
      <h2>Nilai</h2>
      <div className="card">
        <div className="tableWrap"><table><thead><tr><th>Tugas</th><th>Nilai</th><th>Feedback</th><th>Revisi</th></tr></thead><tbody>
          {grades.map((g, i) => <tr key={i}><td>{String(g.assignment_title)}</td><td><strong>{String(g.score ?? '-')}</strong></td><td className="muted">{String(g.feedback ?? '-')}</td><td>{g.revision_required ? 'Diperlukan' : '-'}</td></tr>)}
        </tbody></table></div>
        {grades.length === 0 && !dash.loading && <Empty text="Belum ada nilai." />}
      </div>
    </div>
  );
}

export function SantriSchedulePanel() {
  const sched = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/schedule');
  return (
    <div className="stack">
      <h2>Jadwal</h2>
      <div className="card">
        <div className="tableWrap"><table><thead><tr><th>Kelas</th><th>Sesi</th><th>Mulai</th><th>Selesai</th></tr></thead><tbody>
          {sched.data?.items?.map(s => <tr key={String(s.id)}><td>{String(s.class_name)}</td><td>{String(s.title ?? 'Sesi')}</td><td className="muted">{s.starts_at ? new Date(String(s.starts_at)).toLocaleString('id-ID') : ''}</td><td className="muted">{s.ends_at ? new Date(String(s.ends_at)).toLocaleString('id-ID') : ''}</td></tr>)}
        </tbody></table></div>
        {!sched.loading && !sched.data?.items?.length && <Empty text="Belum ada jadwal." />}
      </div>
    </div>
  );
}

export function SantriCertificatesPanel() {
  const r = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/my/certificates');
  return (
    <div className="stack">
      <h2>Sertifikat</h2>
      <div className="card">
        <div className="tableWrap"><table><thead><tr><th>Judul</th><th>Nomor</th><th>Tanggal</th></tr></thead><tbody>
          {r.data?.items?.map(c => <tr key={String(c.id)}><td>{String(c.title)}</td><td>{String(c.certificate_no)}</td><td className="muted">{c.issued_at ? new Date(String(c.issued_at)).toLocaleDateString('id-ID') : ''}</td></tr>)}
        </tbody></table></div>
        {!r.loading && !r.data?.items?.length && <Empty text="Belum ada sertifikat." />}
      </div>
    </div>
  );
}

export function SantriAgentPanel() {
  const dash = useData<Dash>('/v1/dashboard');
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const agents = dash.data?.agents ?? [];
  async function action(id: string, kind: 'start' | 'stop' | 'archive') {
    try { await api(`/v1/hermes/agents/${id}/${kind}`, { method: 'POST' }); setNotice({ kind: 'success', text: `${kind} diantrekan.` }); await dash.reload(); }
    catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  async function build() {
    try { const out = await api<{ status: string; profileName: string }>('/v1/hermes/agents', { method: 'POST', body: JSON.stringify({ displayName: 'Agent Saya' }) }); setNotice({ kind: 'success', text: `Build ${out.status}. ${out.profileName}` }); await dash.reload(); }
    catch (err) { setNotice({ kind: 'error', text: (err as Error).message }); }
  }
  return (
    <div className="stack">
      <h2>Agent AI</h2>
      <Notice kind={notice?.kind}>{notice?.text}</Notice>
      <div className="actions"><button className="btn" type="button" onClick={() => void build()}>Build Agent</button></div>
      {agents.map(a => (
        <div className="card" key={String(a.id)}>
          <div className="sectionTitle"><div><h3>{String(a.display_name ?? a.profile_name)}</h3></div><span className="pill">{String(a.status)}</span></div>
          {a.last_error && <div className="notice error">{String(a.last_error)}</div>}
          <div className="actions">
            <button type="button" className="btn" onClick={() => void action(String(a.id), 'start')} disabled={!['READY', 'STOPPED'].includes(String(a.status))}>Start</button>
            <button type="button" className="btn secondary" onClick={() => void action(String(a.id), 'stop')} disabled={!['READY', 'RUNNING'].includes(String(a.status))}>Stop</button>
            <button type="button" className="btn danger" onClick={() => void action(String(a.id), 'archive')}>Archive</button>
          </div>
        </div>
      ))}
      {agents.length === 0 && !dash.loading && <Empty text="Belum ada agent. Klik Build Agent untuk membuat." />}
    </div>
  );
}

export function NotificationsPanel() {
  const r = useData<{ items: Array<Record<string, unknown>> }>('/v1/notifications?limit=50');
  const [notice, setNotice] = useState('');
  async function markRead(id: string) { try { await api(`/v1/notifications/${id}/read`, { method: 'PATCH' }); await r.reload(); } catch (e) { setNotice((e as Error).message); } }
  async function markAll() { try { await api('/v1/notifications/read-all', { method: 'POST' }); await r.reload(); } catch (e) { setNotice((e as Error).message); } }
  return (
    <div className="stack">
      <h2>Notifikasi</h2>
      {notice && <Notice kind="error">{notice}</Notice>}
      <div className="actions"><button className="btn secondary" type="button" onClick={() => void markAll()}>Tandai semua dibaca</button></div>
      <div className="card">{r.data?.items?.map(n => (
        <div className={`notification ${n.read_at ? '' : 'unread'}`} key={String(n.id)} onClick={() => { if (!n.read_at) void markRead(String(n.id)); }} style={{ cursor: 'pointer' }}>
          <strong>{String(n.title)}</strong><span className="pill">{String(n.category)}</span>
          <div className="muted">{String(n.body ?? '')}</div>
        </div>
      ))}{!r.loading && !r.data?.items?.length && <Empty text="Tidak ada notifikasi." />}</div>
    </div>
  );
}
