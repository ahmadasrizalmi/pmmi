import React, { useEffect, useMemo, useState } from 'react';
import AdminEnrollmentPanel from './AdminEnrollmentPanel';
import AdminPortfolioPanel from './AdminPortfolioPanel';
import { AdminHermesAuditPanel } from './BlueprintPanels';
import { NotificationSettingsPanel, AgentRuntimePanel } from './CompletionPanels';
import { AdminOverviewPanel, UsersPanel, ApplicantsPanel, StudentsPanel, AcademicAdminPanel, CertificatesAdminPanel, RewardsPanel, SetupPanel, TemplatesPanel, OpsPanel, AiAdminPanel } from './panels/adminPanels';
import { UstadzOverviewPanel, UstadzClassPanel, AttendancePanel, GradingPanel, UstadzHistoryPanel } from './panels/ustadzPanels';
import { SantriOverviewPanel, TasksPanel, GradesPanel, SantriSchedulePanel, SantriCertificatesPanel, SantriAgentPanel, NotificationsPanel } from './panels/santriPanels';
import { API_URL, api, getSession, setSession, type Session } from './api';
import { Icon, type IconName } from './icons';

type Theme = 'light' | 'dark';
type Role = Session['user']['role'];
type NavItem = { id: string; label: string; icon: IconName; description: string };

type ApiKeyItem = {
  id: string;
  name?: string;
  kind?: string;
  key_prefix?: string;
  revoked_at?: string | null;
  full_name?: string;
  email?: string;
  user_id?: string;
};

const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL ?? 'https://ai.pondokmultimedia.id/v1';

const roleNames: Record<Role, string> = {
  ADMIN: 'Administrator',
  USTADZ: 'Pengajar',
  SANTRI: 'Santri',
  ALUMNI: 'Alumni',
};

const navByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { id: 'home', label: 'Beranda', icon: 'home', description: 'Ringkasan pekerjaan dan kondisi PMMI.' },
    { id: 'admissions', label: 'Pendaftaran', icon: 'clipboard', description: 'Pendaftar, santri, dan daftar ulang.' },
    { id: 'academic', label: 'Akademik', icon: 'book', description: 'Kelas, sertifikat, reward, dan portfolio.' },
    { id: 'ai', label: 'AI & Agen', icon: 'bot', description: 'Akses AI, API key, dan agen Hermes.' },
    { id: 'system', label: 'Sistem', icon: 'settings', description: 'Pengguna, operasional, notifikasi, dan setup.' },
  ],
  USTADZ: [
    { id: 'home', label: 'Beranda', icon: 'home', description: 'Agenda mengajar dan pekerjaan yang perlu diselesaikan.' },
    { id: 'classes', label: 'Kelas Saya', icon: 'book', description: 'Kelas, materi, tugas, dan absensi.' },
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
    try {
      const rotated = await api<{ secret: string }>(`/v1/ai/api-keys/${id}/rotate`, { method: 'POST' });
      setSecret(rotated.secret);
      await reload();
    } catch (err) { setError((err as Error).message); }
  }

  async function revoke(id: string) {
    if (!window.confirm('Cabut API key ini?')) return;
    try { await api(`/v1/ai/api-keys/${id}`, { method: 'DELETE' }); await reload(); }
    catch (err) { setError((err as Error).message); }
  }

  return (
    <div className="stack">
      <h2>API untuk Proyek</h2>
      {error && <div className="notice error">{error}</div>}
      {secret && <div className="notice secret-notice"><strong>Secret baru</strong><p>Secret hanya ditampilkan sekali.</p><div className="copy-row"><code className="secret-code">{secret}</code><CopyButton value={secret} /></div></div>}
      <div className="card compact-card"><div className="sectionTitle"><div><h3>Buat key</h3><p className="muted">Key ini memakai identitas Anda (pmmi_...) untuk memanggil AI Gateway.</p></div></div>
        <div className="formRow"><input value={name} onChange={e => setName(e.target.value)} placeholder="Nama key" /><button type="button" className="btn" onClick={() => void createKey()} disabled={busy || name.trim().length < 2}>Buat</button></div>
        <p className="muted code">Base URL: {AI_BASE_URL}</p>
      </div>
      <div className="card compact-card"><h3>Key terdaftar</h3>{items.map(item => <div className="key-row" key={item.id}><div><strong>{item.name ?? item.full_name ?? item.email}</strong><div className="muted">{item.kind} · {item.key_prefix} · {item.revoked_at ? 'Nonaktif' : 'Aktif'}</div></div><div className="actions"><button type="button" className="btn secondary" disabled={Boolean(item.revoked_at)} onClick={() => void rotate(item.id)}>Rotate</button><button type="button" className="btn danger" disabled={Boolean(item.revoked_at)} onClick={() => void revoke(item.id)}>Cabut</button></div></div>)}{items.length === 0 && <p className="muted">Belum ada key.</p>}</div>
    </div>
  );
}

function AdminApiKeyPanel() {
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  async function reload() {
    try {
      const [u, k] = await Promise.all([
        api<{ items: Array<Record<string, unknown>> }>('/v1/admin/users'),
        api<{ items: ApiKeyItem[] }>('/v1/admin/ai/api-keys'),
      ]);
      setUsers(u.items ?? []);
      setKeys(k.items ?? []);
    } catch (err) { setError((err as Error).message); }
  }
  useEffect(() => { void reload(); }, []);

  async function create() {
    try {
      const created = await api<{ secret: string }>('/v1/admin/ai/api-keys', { method: 'POST', body: JSON.stringify({ userId, name, expiresInDays: 365 }) });
      setSecret(created.secret);
      setName('');
      await reload();
    } catch (err) { setError((err as Error).message); }
  }
  async function revoke(id: string) {
    if (!window.confirm('Cabut key ini?')) return;
    try { await api(`/v1/ai/api-keys/${id}`, { method: 'DELETE' }); await reload(); }
    catch (err) { setError((err as Error).message); }
  }

  return (
    <div className="stack">
      <h2>API Key — Admin</h2>
      {error && <div className="notice error">{error}</div>}
      {secret && <div className="notice secret-notice"><strong>Secret baru</strong><div className="copy-row"><code className="secret-code">{secret}</code><CopyButton value={secret} /></div></div>}
      <div className="card compact-card"><h3>Buat key untuk pengguna</h3>
        <div className="formRow"><select value={userId} onChange={e => setUserId(e.target.value)}><option value="">Pilih pengguna…</option>{users.map(u => <option key={String(u.id)} value={String(u.id)}>{String(u.full_name ?? u.email)}</option>)}</select><input value={name} onChange={e => setName(e.target.value)} placeholder="Nama key" /><button type="button" className="btn" disabled={!userId || name.trim().length < 2} onClick={() => void create()}>Buat</button></div>
      </div>
      <div className="card compact-card"><h3>Key terdaftar</h3>{keys.map(item => <div className="key-row" key={item.id}><div><strong>{item.full_name ?? item.email ?? item.name}</strong><div className="muted">{item.kind} · {item.key_prefix} · {item.revoked_at ? 'Nonaktif' : 'Aktif'}</div></div><button type="button" className="btn danger" disabled={Boolean(item.revoked_at)} onClick={() => void revoke(item.id)}>Cabut</button></div>)}{keys.length === 0 && <p className="muted">Belum ada key.</p>}</div>
    </div>
  );
}

function AlumniResultsPanel() {
  const grades = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/my/grades');
  const certs = useData<{ items: Array<Record<string, unknown>> }>('/v1/academic/my/certificates');
  return (
    <div className="stack">
      <h2>Transkrip & Sertifikat</h2>
      <div className="card"><h3>Nilai</h3><div className="tableWrap"><table><thead><tr><th>Tugas</th><th>Nilai</th><th>Feedback</th></tr></thead><tbody>{grades.data?.items?.map((g, i) => <tr key={i}><td>{String(g.assignment_title)}</td><td><strong>{String(g.score ?? '-')}</strong></td><td className="muted">{String(g.feedback ?? '-')}</td></tr>)}</tbody></table></div>{!grades.loading && !grades.data?.items?.length && <p className="muted">Belum ada nilai.</p>}</div>
      <div className="card"><h3>Sertifikat</h3>{certs.data?.items?.map(c => <div className="notification" key={String(c.id)}><strong>{String(c.title)}</strong><span className="muted">{String(c.certificate_no)}</span></div>)}{!certs.loading && !certs.data?.items?.length && <p className="muted">Belum ada sertifikat.</p>}</div>
    </div>
  );
}

function AdminWorkspace({ page }: { page: string }) {
  if (page === 'home') return <AdminOverviewPanel />;
  if (page === 'admissions') return <WorkspaceTabs tabs={[
    { id: 'applicants', label: 'Pendaftar', view: <ApplicantsPanel /> },
    { id: 'students', label: 'Santri', view: <StudentsPanel /> },
    { id: 'enrollment', label: 'Daftar Ulang', view: <AdminEnrollmentPanel /> },
  ]} />;
  if (page === 'academic') return <WorkspaceTabs tabs={[
    { id: 'classes', label: 'Akademik', view: <AcademicAdminPanel /> },
    { id: 'certificates', label: 'Sertifikat', view: <CertificatesAdminPanel /> },
    { id: 'rewards', label: 'Reward', view: <RewardsPanel /> },
    { id: 'portfolio', label: 'Portfolio', view: <AdminPortfolioPanel /> },
  ]} />;
  if (page === 'ai') return <WorkspaceTabs tabs={[
    { id: 'ai', label: 'AI & Kredit', view: <AiAdminPanel /> },
    { id: 'keys', label: 'API Key', view: <AdminApiKeyPanel /> },
    { id: 'audit', label: 'Audit Agen', view: <AdminHermesAuditPanel /> },
  ]} />;
  return <WorkspaceTabs tabs={[
    { id: 'users', label: 'Pengguna', view: <UsersPanel /> },
    { id: 'ops', label: 'Operasional', view: <OpsPanel /> },
    { id: 'templates', label: 'Template Notifikasi', view: <TemplatesPanel /> },
    { id: 'settings', label: 'Setup', view: <SetupPanel /> },
  ]} />;
}

function UstadzWorkspace({ page }: { page: string }) {
  if (page === 'home') return <UstadzOverviewPanel />;
  if (page === 'classes') return <WorkspaceTabs tabs={[
    { id: 'class', label: 'Kelas & Materi', view: <UstadzClassPanel /> },
    { id: 'attendance', label: 'Absensi', view: <AttendancePanel /> },
  ]} />;
  if (page === 'grading') return <WorkspaceTabs tabs={[
    { id: 'grading', label: 'Penilaian', view: <GradingPanel /> },
    { id: 'history', label: 'Riwayat', view: <UstadzHistoryPanel /> },
  ]} />;
  return <AgentRuntimePanel />;
}

function SantriWorkspace({ page }: { page: string }) {
  if (page === 'home') return <SantriOverviewPanel />;
  if (page === 'learn') return <WorkspaceTabs tabs={[
    { id: 'tasks', label: 'Tugas', view: <TasksPanel /> },
    { id: 'schedule', label: 'Jadwal', view: <SantriSchedulePanel /> },
  ]} />;
  if (page === 'results') return <WorkspaceTabs tabs={[
    { id: 'grades', label: 'Nilai', view: <GradesPanel /> },
    { id: 'certificates', label: 'Sertifikat', view: <SantriCertificatesPanel /> },
  ]} />;
  if (page === 'agent') return <SantriAgentPanel />;
  return <WorkspaceTabs tabs={[
    { id: 'notifications', label: 'Notifikasi', view: <NotificationsPanel /> },
    { id: 'preferences', label: 'Pengaturan Notifikasi', view: <NotificationSettingsPanel /> },
    { id: 'developer-api', label: 'API untuk Proyek', view: <DeveloperApiPanel /> },
  ]} />;
}

function AlumniWorkspace({ page }: { page: string }) {
  if (page === 'home') return <AlumniResultsPanel />;
  if (page === 'results') return <WorkspaceTabs tabs={[
    { id: 'transcript', label: 'Transkrip & Sertifikat', view: <AlumniResultsPanel /> },
    { id: 'portfolio', label: 'Portfolio', view: <AdminPortfolioPanel /> },
  ]} />;
  return <WorkspaceTabs tabs={[
    { id: 'notifications', label: 'Notifikasi', view: <NotificationsPanel /> },
    { id: 'preferences', label: 'Pengaturan Notifikasi', view: <NotificationSettingsPanel /> },
  ]} />;
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

function useData<T = unknown>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function reload() {
    setLoading(true);
    setError('');
    try { setData(await api<T>(path)); } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }
  useEffect(() => { void reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [path, ...deps]);
  return { data, loading, error, reload };
}
