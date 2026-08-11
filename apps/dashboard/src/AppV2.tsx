import React, { useEffect, useState } from 'react';
import App from './App';
import AdminPortfolioPanel from './AdminPortfolioPanel';
import { AgentRuntimePanel, AdminSetupPanel, NotificationSettingsPanel, UstadzAttendancePanel } from './CompletionPanels';
import { getSession } from './api';

export default function AppV2() {
  const [session, setSession] = useState(() => getSession());
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [tool, setTool] = useState('');

  useEffect(() => {
    const sync = () => setSession(getSession());
    window.addEventListener('pmmi-session-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('pmmi-session-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const role = session?.user.role;
  const isAdmin = role === 'ADMIN';
  const isAlumni = role === 'ALUMNI';
  // Role Tools overlay is ADMIN-only: for other roles the same features
  // (attendance, agent runtime, notification settings) already exist as
  // first-class tabs in the main App.tsx. A floating "Role Tools" button
  // for everyone duplicates those tabs and misleads non-admin users.
  const showToolsButton = isAdmin;

  useEffect(() => {
    if (!role) { setToolsOpen(false); setPortfolioOpen(false); setTool(''); return; }
    if (isAlumni) { setTool('notifications'); return; }
    if (!tool) setTool(role === 'ADMIN' ? 'setup' : role === 'USTADZ' ? 'attendance' : 'agent');
  }, [role, tool, isAlumni]);

  const tools: Array<[string, string]> =
    role === 'ADMIN' ? [['setup', 'Setup & Enrollment'], ['notifications', 'Notification Settings']]
      : role === 'USTADZ' ? [['attendance', 'Attendance'], ['notifications', 'Notification Settings']]
        : role === 'ALUMNI' ? [['notifications', 'Notification Settings']]
          : [['agent', 'Agent Runtime'], ['notifications', 'Notification Settings']];

  let toolView: React.ReactNode = null;
  if (tool === 'setup') toolView = <AdminSetupPanel />;
  if (tool === 'attendance') toolView = <UstadzAttendancePanel />;
  if (tool === 'agent') toolView = <AgentRuntimePanel />;
  if (tool === 'notifications') toolView = <NotificationSettingsPanel />;

  return (
    <>
      <App />
      {role && (
        <>
          {/* Floating action buttons — only for non-Alumni roles */}
          <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 70, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {isAdmin && (
              <button className="btn secondary" onClick={() => setPortfolioOpen(!portfolioOpen)}>
                {portfolioOpen ? 'Tutup Portfolio' : 'Portfolio Manager'}
              </button>
            )}
            {showToolsButton && (
              <button className="btn" onClick={() => setToolsOpen(!toolsOpen)}>
                {toolsOpen ? 'Tutup Tools' : 'Role Tools'}
              </button>
            )}
          </div>

          {/* Tools Overlay */}
          {toolsOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 65, background: 'rgba(0,0,0,.9)', overflow: 'auto', padding: '70px 24px 110px' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div className="sectionTitle">
                  <h2>PMMI Role Tools</h2>
                  <button className="btn secondary" onClick={() => setToolsOpen(false)}>Tutup</button>
                </div>
                <div className="actions" style={{ marginBottom: 16 }}>
                  {tools.map(([id, label]) => (
                    <button key={id} className={`btn ${tool === id ? '' : 'secondary'}`} onClick={() => setTool(id)}>
                      {label}
                    </button>
                  ))}
                </div>
                {toolView}
              </div>
            </div>
          )}

          {/* Portfolio Manager Overlay */}
          {portfolioOpen && isAdmin && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 64, background: 'rgba(0,0,0,.9)', overflow: 'auto', padding: '70px 24px 110px' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div className="sectionTitle">
                  <h2>Portfolio Manager</h2>
                  <button className="btn secondary" onClick={() => setPortfolioOpen(false)}>Tutup</button>
                </div>
                <AdminPortfolioPanel />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
