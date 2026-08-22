import React, { useEffect, useState } from 'react';
import { api } from './api';

export function AdminHermesAuditPanel() {
  const [profiles, setProfiles] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState('');
  async function reload() {
    try {
      const data = await api<{ items: Array<Record<string, unknown>> }>('/v1/admin/hermes');
      setProfiles(data.items ?? []);
    } catch (err) { setError((err as Error).message); }
  }
  useEffect(() => { void reload(); }, []);
  async function retry(id: string) {
    try { await api(`/v1/admin/hermes/${id}/retry`, { method: 'POST' }); await reload(); }
    catch (err) { setError((err as Error).message); }
  }
  async function archive(id: string) {
    if (!window.confirm('Archive profile agen ini?')) return;
    try { await api(`/v1/hermes/agents/${id}/archive`, { method: 'POST' }); await reload(); }
    catch (err) { setError((err as Error).message); }
  }
  return (
    <div className="stack">
      <h2>Audit Agen Hermes</h2>
      {error && <div className="notice error">{error}</div>}
      <div className="card">
        <div className="tableWrap"><table><thead><tr><th>Profile</th><th>Status</th><th>Error</th><th></th></tr></thead><tbody>
          {profiles.map(p => (
            <tr key={String(p.id)}>
              <td>{String(p.profile_name)}<div className="muted">{String(p.display_name ?? '')}</div></td>
              <td><span className="pill">{String(p.status)}</span></td>
              <td className="muted">{String(p.last_error ?? '-')}</td>
              <td className="actions">
                <button type="button" className="btn" onClick={() => void retry(String(p.id))}>Retry</button>
                <button type="button" className="btn danger" onClick={() => void archive(String(p.id))}>Archive</button>
              </td>
            </tr>
          ))}
        </tbody></table></div>
        {profiles.length === 0 && <p className="muted">Belum ada profile agen.</p>}
      </div>
    </div>
  );
}
