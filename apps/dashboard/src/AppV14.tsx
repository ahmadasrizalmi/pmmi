import React, { useEffect, useMemo, useRef, useState } from 'react';
import LegacyApp from './App';
import AdminEnrollmentPanel from './AdminEnrollmentPanel';
import AdminPortfolioPanel from './AdminPortfolioPanel';
import { AdminHermesAuditPanel } from './BlueprintPanels';
import { AdminSetupPanel, NotificationSettingsPanel, UstadzAttendancePanel } from './CompletionPanels';
import { API_URL, api, getSession, setSession, type Session } from './api';
import { Icon, type IconName } from './icons';

type Theme = 'light' | 'dark';
type Role = Session['user']['role'];
type NavItem = { id: string; label: string; icon: IconName; description: string };

type ApiKeyItem = {
  id: string;
  name: string;
  kind: string;
  key_prefix: string;
  expires_at?: string | null;
  last_used_at?: string | null;
  revoked_at?: string | null;
  full_name?: string;
  email?: string;
  user_id?: string;
};

const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL ?? 'https://ai.pondokmultimedia.id/v1';

const roleNames: Record<Role, string> = {
  ADMIN: 'Admin PMMI',
  USTADZ: 'Ustadz',
  SANTRI: 'Santri',
  ALUMNI: 'Alumni',
};

const navByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { id: 'home', label: 'Beranda', icon: 'home', description: 'Ringkasan pekerjaan dan kondisi PMMI.' },
    { id: 'admissions', label: 'Pendaftaran', icon: 'clipboard', description: 'Pendaftar, santri, dan daftar ulang dalam satu workspace.' },
    { id: 'academic', label: 'Akademik', icon: 'book', description: 'Kelas, sertifikat, reward, dan portfolio.' },
    { id: 'ai', label: 'AI & Agen', icon: 'bot', description: 'Akses AI, API key, dan agen Hermes.' },
    { id: 'system', label: 'Sistem', icon: 'settings', description: 'Pengguna, operasional, notifikasi, dan setup.' },
  ],
  USTADZ: [
    { id: 'home', label: 'Beranda', icon: 'home', description: 'Agenda mengajar dan pekerjaan yang perlu diselesaikan.' },
    { id: 'classes', label: 'Kelas Saya', icon: 'book', description: 'Kelas, materi, tugas, dan absensi dalam satu tempat.' },
    { id: 'grading', label: 'Penilaian', icon: 'clipboard', description: 'Penilaian dan riwayat pekerjaan akademik.' },
    { id: 'agent', label: 'Agen AI', icon: 'bot', description: 'Kelola agen AI yang terhubung ke akun.' },
  ],
  SANTRI: [
    { id: 'home', label: 'Hari Ini', icon: 'home', description: 'Jadwal, tugas, dan hal penting hari ini.' },
    { id: 'learn', label: 'Belajar', icon: 'book', description: 'Tugas, akademik, jadwal, dan materi.' },
    { id: 'results', label: 'Karya & Hasil', icon: 'award', description: 'Nilai, sertifikat, dan portfolio.' },
    { id: 'agent', label: 'Agen AI', icon: 'bot', description: 'Buat dan kelola agen AI.' },
    { id: 'account', label: 'Akun', icon: 'user', description: 'Notifikasi, keamanan, dan API untuk proyek.' },
  ],
  ALUMNI: [
    { id: 'home', label: 'Beranda', icon: 'home', description: 'Ringkasan akun alumni.' },
    { id: 'results', label: 'Karya & Hasil', icon: 'award', description: 'Transkrip, sertifikat, dan portfolio.' },
    { id: 'account', label: 'Akun', icon: 'user', description: 'Notifikasi dan pengaturan akun.' },
  ],
};

function Login({ onLogin }: { onLogin: (session: Session) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = await api<Session>('/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setSession(session);
      onLogin(session);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login v14-login">
      <form className="card form login-card" onSubmit={submit}>
        <div className="login-mark" aria-hidden="true"><Icon name="book" size={24} /></div>
        <div>
          <h1 className="login-title">PMMI Digital Campus</h1>
          <p className="muted">Masuk untuk mengelola kegiatan pondok dan pembelajaran.</p>
        </div>
        {error && <div className="notice error">{error}</div>}
        <label className="field-label">Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label className="field-label">Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></label>
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Memeriksa akun...' : 'Masuk'}</button>
      </form>
    </div>
  );
}

function LegacyPane({ target }: { target: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    let timer = 0;
    const selectTarget = () => {
      if (cancelled) return;
      const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('.nav button') ?? []);
      const button = buttons.find(item => item.textContent?.trim() === target);
      if (button) {
        button.click();
        return;
      }
      if (tries++ < 20) timer = window.setTimeout(selectTarget, 30);
    };
    selectTarget();
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [target]);

  return <div className="legacy-embed" ref={ref}><LegacyApp /></div>;
}

function WorkspaceTabs({ tabs, defaultTab }: { tabs: Array<{ id: string; label: string; view: React.ReactNode }>; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');
  useEffect(() => {
    if (!tabs.some(tab => tab.id === active)) setActive(defaultTab ?? tabs[0]?.id ?? '');
  }, [active, defaultTab, tabs]);
  const current = tabs.find(tab => tab.id === active) ?? tabs[0];
  return (
    <div className="workspace-stack">
      {tabs.length > 1 && (
        <div className="segment-tabs" role="tablist" aria-label="Bagian halaman">
          {tabs.map(tab => <button key={tab.id} type="button" role="tab" aria-selected={tab.id === active} className={tab.id === active ? 'active' : ''} onClick={() => setActive(tab.id)}>{tab.label}</button>)}
        </div>
      )}
      <div className="workspace-view">{current?.view}</div>
    </div>
  );
}

function CopyButton({ value, label = 'Salin' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return <button type="button" className="icon-text-btn" onClick={() => void copy()}><Icon name={copied ? 'check' : 'copy'} size={17} /><span>{copied ? 'Tersalin' : label}</span></button>;
}

function DeveloperApiPanel() {
  const [items, setItems] = useState<ApiKeyItem[]>([]);
  const [name, setName] = useState('Proyek Saya');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function reload() {
    try {
      const data = await api<{ items: ApiKeyItem[] }>('/v1/ai/api-keys');
      setItems(data.items ?? []);
    } catch (err) {
      setError((err as Error).message);
    }
  }
  useEffect(() => { void reload(); }, []);

  async function createKey() {
    setBusy(true); setError(''); setSecret('');
    try {
      const created = await api<ApiKeyItem & { secret: string }>('/v1/ai/api-keys', { method: 'POST', body: JSON.stringify({ name, expiresInDays: 90 }) });
      setSecret(created.secret);
      setName('Proyek Saya');
      await reload();
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }

  async function rotate(id: string) {
    if (!window.confirm('Buat key baru dan nonaktifkan key lama?')) return;
    setBusy(true); setError(''); setSecret('');
    try {
      const created = await api<ApiKeyItem & { secret: string }>(`/v1/ai/api-keys/${id}/rotate`, { method: 'POST' });
      setSecret(created.secret);
      await reload();
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }

  async function revoke(id: string) {
    if (!window.confirm('Nonaktifkan Developer Key ini?')) return;
    setBusy(true); setError('');
    try { await api(`/v1/ai/api-keys/${id}`, { method: 'DELETE' }); await reload(); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="stack">
      <div className="card compact-card">
        <div className="sectionTitle"><div><h2>API untuk Proyek</h2><p className="muted">Developer Key dipakai untuk aplikasi atau project coding. Hermes Agent memakai Agent Key terpisah.</p></div></div>
        <label className="field-label">Alamat API<div className="copy-row"><code>{AI_BASE_URL}</code><CopyButton value={AI_BASE_URL} /></div></label>
      </div>
      {secret && <div className="notice secret-notice"><strong>Developer Key baru</strong><p>Salin sekarang. Setelah halaman ini ditutup, secret tidak dapat ditampilkan lagi.</p><div className="copy-row"><code className="secret-code">{secret}</code><CopyButton value={secret} /></div></div>}
      {error && <div className="notice error">{error}</div>}
      <div className="card compact-card">
        <h3>Buat Developer Key</h3>
        <div className="formRow"><label className="field-label">Nama key<input value={name} onChange={event => setName(event.target.value)} maxLength={80} /></label><div className="field-action"><button type="button" className="btn" disabled={busy || name.trim().length < 2} onClick={() => void createKey()}><Icon name="key" size={17} />Buat Key</button></div></div>
      </div>
      <div className="card compact-card">
        <div className="sectionTitle"><h3>Developer Key Saya</h3><button type="button" className="icon-btn" aria-label="Muat ulang" title="Muat ulang" onClick={() => void reload()}><Icon name="refresh" size={18} /></button></div>
        {items.length === 0 ? <p className="muted">Belum ada Developer Key.</p> : <div className="key-list">{items.map(item => <div className="key-row" key={item.id}><div><strong>{item.name}</strong><div className="muted">{item.key_prefix} · {item.revoked_at ? 'Nonaktif' : 'Aktif'}{item.last_used_at ? ` · terakhir dipakai ${new Date(item.last_used_at).toLocaleString('id-ID')}` : ''}</div></div><div className="actions"><button type="button" className="btn secondary" disabled={busy || Boolean(item.revoked_at)} onClick={() => void rotate(item.id)}>Rotate</button><button type="button" className="btn danger" disabled={busy || Boolean(item.revoked_at)} onClick={() => void revoke(item.id)}>Cabut</button></div></div>)}</div>}
      </div>
      <div className="card compact-card"><h3>Cara pakai</h3><div className="code-example"><code>{`curl ${AI_BASE_URL}/chat/completions \\\n  -H "Authorization: Bearer $PMMI_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"pmmi-coder","messages":[{"role":"user","content":"Halo"}]}'`}</code></div></div>
    </div>
  );
}

function AdminApiKeyPanel() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; full_name?: string; fullName?: string; email: string }>>([]);
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('Developer Access');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  async function reload() {
    try {
      const [keyData, userData] = await Promise.all([
        api<{ items: ApiKeyItem[] }>('/v1/admin/ai/api-keys'),
        api<{ items: Array<{ id: string; full_name?: string; fullName?: string; email: string }> }>('/v1/admin/users'),
      ]);
      setKeys(keyData.items ?? []);
      setUsers(userData.items ?? []);
      if (!userId && userData.items?.[0]?.id) setUserId(userData.items[0].id);
    } catch (err) { setError((err as Error).message); }
  }
  useEffect(() => { void reload(); }, []);

  async function create() {
    if (!userId) return;
    setError(''); setSecret('');
    try {
      const created = await api<ApiKeyItem & { secret: string }>('/v1/admin/ai/api-keys', { method: 'POST', body: JSON.stringify({ userId, name, kind: 'DEVELOPER', expiresInDays: 90 }) });
      setSecret(created.secret);
      await reload();
    } catch (err) { setError((err as Error).message); }
  }

  async function revoke(id: string) {
    if (!window.confirm('Cabut API key ini?')) return;
    try { await api(`/v1/ai/api-keys/${id}`, { method: 'DELETE' }); await reload(); }
    catch (err) { setError((err as Error).message); }
  }

  return <div className="stack">
    {error && <div className="notice error">{error}</div>}
    {secret && <div className="notice secret-notice"><strong>Secret baru</strong><p>Secret hanya ditampilkan sekali.</p><div className="copy-row"><code className="secret-code">{secret}</code><CopyButton value={secret} /></div></div>}
    <div className="card compact-card"><div className="sectionTitle"><div><h2>API Key</h2><p className="muted">Buat Developer Key berdasarkan nama pengguna, tanpa memasukkan UUID secara manual.</p></div></div><div className="formRow"><label className="field-label">Pengguna<select value={userId} onChange={event => setUserId(event.target.value)}>{users.map(user => <option key={user.id} value={user.id}>{user.full_name ?? user.fullName ?? user.email} · {user.email}</option>)}</select></label><label className="field-label">Nama key<input value={name} onChange={event => setName(event.target.value)} /></label><div className="field-action"><button type="button" className="btn" onClick={() => void create()} disabled={!userId || name.trim().length < 2}><Icon name="key" size={17} />Buat Key</button></div></div></div>
    <div className="card compact-card"><h3>Key yang terdaftar</h3><div className="key-list">{keys.map(item => <div className="key-row" key={item.id}><div><strong>{item.full_name ?? item.email ?? item.name}</strong><div className="muted">{item.kind} · {item.key_prefix} · {item.revoked_at ? 'Nonaktif' : 'Aktif'}</div></div><button type="button" className="btn danger" disabled={Boolean(item.revoked_at)} onClick={() => void revoke(item.id)}>Cabut</button></div>)}</div></div>
  </div>;
}

function AdminWorkspace({ page }: { page: string }) {
  // v1.4 wireframe W04 (Agen & Koneksi — external API integrations)
  // and W05 (Keamanan & Cadangan — backup/audit restore/logs) are
  // deferred until the backing services (Hermes gateway, backup drill,
  // restore tooling) pass operational verification on the home server.
  // When they are ready, add new nav items and workspace cases here.
  // See docs/ux/v1.4/20_SYSTEM_ADMIN.md and UX_ACCEPTANCE DoD #3.
  // W03 Model AI tab is the existing AI & Agents legacy pane;
  // a standalone usage/pemakaian tab is deferred until the billing
  // dashboard is wired to the ai_usage_logs aggregate.

  if (page === 'home') return <LegacyPane target="Overview" />;
  if (page === 'admissions') return <WorkspaceTabs tabs={[
    { id: 'applicants', label: 'Pendaftar', view: <LegacyPane target="Admissions" /> },
    { id: 'students', label: 'Santri', view: <LegacyPane target="Students" /> },
    { id: 'enrollment', label: 'Daftar Ulang', view: <AdminEnrollmentPanel /> },
  ]} />;
  if (page === 'academic') return <WorkspaceTabs tabs={[
    { id: 'classes', label: 'Kelas', view: <LegacyPane target="Academic" /> },
    { id: 'certificates', label: 'Sertifikat', view: <LegacyPane target="Certificates" /> },
    { id: 'rewards', label: 'Reward', view: <LegacyPane target="Rewards" /> },
    { id: 'portfolio', label: 'Portfolio', view: <AdminPortfolioPanel /> },
  ]} />;
  if (page === 'ai') return <WorkspaceTabs tabs={[
    { id: 'ai', label: 'AI & Agen', view: <LegacyPane target="AI & Agents" /> },
    { id: 'keys', label: 'API Key', view: <AdminApiKeyPanel /> },
    { id: 'audit', label: 'Audit Agen', view: <AdminHermesAuditPanel /> },
  ]} />;
  return <WorkspaceTabs tabs={[
    { id: 'users', label: 'Pengguna', view: <LegacyPane target="Users" /> },
    { id: 'ops', label: 'Operasional', view: <LegacyPane target="Ops" /> },
    { id: 'notifications', label: 'Notifikasi', view: <LegacyPane target="Notifications" /> },
    { id: 'settings', label: 'Setup', view: <AdminSetupPanel /> },
  ]} />;
}

function UstadzWorkspace({ page }: { page: string }) {
  if (page === 'home') return <LegacyPane target="Overview" />;
  if (page === 'classes') return <WorkspaceTabs tabs={[
    { id: 'class', label: 'Kelas & Materi', view: <LegacyPane target="Academic" /> },
    { id: 'attendance', label: 'Absensi', view: <UstadzAttendancePanel /> },
  ]} />;
  if (page === 'grading') return <WorkspaceTabs tabs={[
    { id: 'grading', label: 'Penilaian', view: <LegacyPane target="Academic" /> },
    { id: 'history', label: 'Riwayat', view: <LegacyPane target="Riwayat" /> },
  ]} />;
  return <LegacyPane target="AI" />;
}

function SantriWorkspace({ page }: { page: string }) {
  if (page === 'home') return <LegacyPane target="Overview" />;
  if (page === 'learn') return <WorkspaceTabs tabs={[
    { id: 'tasks', label: 'Tugas', view: <LegacyPane target="Assignments" /> },
    { id: 'academic', label: 'Akademik', view: <LegacyPane target="Academic" /> },
  ]} />;
  if (page === 'results') return <WorkspaceTabs tabs={[
    { id: 'grades', label: 'Nilai & Akademik', view: <LegacyPane target="Academic" /> },
    { id: 'portfolio', label: 'Portfolio', view: <LegacyPane target="Portfolio" /> },
    { id: 'certificates', label: 'Sertifikat', view: <LegacyPane target="Certificates" /> },
  ]} />;
  if (page === 'agent') return <LegacyPane target="AI" />;
  return <WorkspaceTabs tabs={[
    { id: 'notifications', label: 'Notifikasi', view: <LegacyPane target="Notifications" /> },
    { id: 'preferences', label: 'Pengaturan Notifikasi', view: <NotificationSettingsPanel /> },
    { id: 'developer-api', label: 'API untuk Proyek', view: <DeveloperApiPanel /> },
  ]} />;
}

function AlumniWorkspace({ page }: { page: string }) {
  if (page === 'home') return <LegacyPane target="Overview" />;
  if (page === 'results') return <WorkspaceTabs tabs={[
    { id: 'transcript', label: 'Transkrip', view: <LegacyPane target="Transkrip" /> },
    { id: 'certificate', label: 'Sertifikat', view: <LegacyPane target="Sertifikat" /> },
    { id: 'portfolio', label: 'Portfolio', view: <LegacyPane target="Portfolio" /> },
  ]} />;
  return <LegacyPane target="Notifications" />;
}

function renderWorkspace(role: Role, page: string) {
  if (role === 'ADMIN') return <AdminWorkspace page={page} />;
  if (role === 'USTADZ') return <UstadzWorkspace page={page} />;
  if (role === 'SANTRI') return <SantriWorkspace page={page} />;
  return <AlumniWorkspace page={page} />;
}

export default function AppV14() {
  const [session, setCurrentSession] = useState<Session | null>(() => getSession());
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('pmmi-theme') === 'dark' ? 'dark' : 'light');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('pmmi-sidebar-collapsed') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = session?.user.role;
  const nav = useMemo(() => role ? navByRole[role] : [], [role]);
  const [page, setPage] = useState('home');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pmmi-theme', theme);
  }, [theme]);
  useEffect(() => { localStorage.setItem('pmmi-sidebar-collapsed', String(collapsed)); }, [collapsed]);
  useEffect(() => {
    const sync = () => setCurrentSession(getSession());
    window.addEventListener('pmmi-session-changed', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('pmmi-session-changed', sync); window.removeEventListener('storage', sync); };
  }, []);
  useEffect(() => { if (!nav.some(item => item.id === page)) setPage('home'); }, [nav, page]);
  useEffect(() => { setMobileOpen(false); }, [page]);

  if (!session || !role) return <Login onLogin={setCurrentSession} />;

  const current = nav.find(item => item.id === page) ?? nav[0];
  const name = session.user.fullName ?? session.user.full_name ?? session.user.email;
  function logout() { setSession(null); setCurrentSession(null); }

  return (
    <div className={`v14-shell ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-nav-open' : ''}`}>
      <button type="button" aria-label="Tutup menu" className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
      <aside className="v14-sidebar" aria-label="Navigasi utama">
        <div className="sidebar-head">
          <div className="brand-lockup"><div className="brand-icon"><Icon name="book" size={20} /></div><div className="brand-copy"><strong>PMMI</strong><span>Digital Campus</span></div></div>
          <button type="button" className="icon-btn sidebar-collapse" aria-label={collapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'} title={collapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'} onClick={() => setCollapsed(value => !value)}><Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={18} /></button>
        </div>
        <nav className="v14-nav">
          {nav.map(item => <button key={item.id} type="button" className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)} title={collapsed ? item.label : undefined}><Icon name={item.icon} size={20} /><span>{item.label}</span></button>)}
        </nav>
        <div className="sidebar-user"><div className="user-avatar"><Icon name="user" size={19} /></div><div className="sidebar-user-copy"><strong>{name}</strong><span>{roleNames[role]}</span></div><button type="button" className="icon-btn" aria-label="Keluar" title="Keluar" onClick={logout}><Icon name="logout" size={18} /></button></div>
      </aside>

      <main className="v14-main">
        <header className="v14-topbar">
          <div className="topbar-title"><button type="button" className="icon-btn mobile-menu" aria-label="Buka menu" onClick={() => setMobileOpen(true)}><Icon name="menu" size={21} /></button><div><h1>{current?.label ?? 'PMMI'}</h1><p>{current?.description}</p></div></div>
          <div className="topbar-actions"><button type="button" className="icon-btn" aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'} title={theme === 'light' ? 'Mode gelap' : 'Mode terang'} onClick={() => setTheme(value => value === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={19} /></button><span className="role-chip">{roleNames[role]}</span></div>
        </header>
        <section className="v14-content">{renderWorkspace(role, page)}</section>
        <footer className="v14-footer"><span>PMMI Digital Campus</span><span className="muted">API: {API_URL}</span></footer>
      </main>
    </div>
  );
}
