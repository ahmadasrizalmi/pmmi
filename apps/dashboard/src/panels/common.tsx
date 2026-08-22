import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

export function useData<T = unknown>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function reload() {
    if (!path) return;
    setLoading(true);
    setError('');
    try { setData(await api<T>(path)); } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }
  useEffect(() => { void reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [path, ...deps]);
  return { data, loading, error, reload };
}

export function Notice({ kind, children }: { kind?: 'error' | 'success'; children: React.ReactNode }) {
  if (!children) return null;
  return <div className={`notice ${kind === 'error' ? 'error' : ''}`}>{children}</div>;
}

export function Empty({ text = 'Belum ada data.' }: { text?: string }) {
  return <div className="card"><p className="muted">{text}</p></div>;
}

export function SearchBox({ value, onChange, placeholder = 'Cari…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input className="search-input" type="search" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} aria-label={placeholder} />;
}

export function useSearch<T>(items: T[] | undefined, keys: Array<(item: T) => string>) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!items) return items;
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(item => keys.some(k => String(k(item) ?? '').toLowerCase().includes(needle)));
  }, [items, q, keys]);
  return { q, setQ, filtered };
}

export function ConfirmDelete({ onDelete, label = 'Hapus', title = 'Hapus data ini?' }: { onDelete: () => void; label?: string; title?: string }) {
  return (
    <button type="button" className="btn danger" onClick={() => { if (window.confirm(title)) onDelete(); }}>
      {label}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field-label">{label}{children}</label>;
}

export function Pager({ items }: { items: Array<Record<string, unknown>> | undefined }) {
  if (!items || items.length === 0) return <Empty />;
  return null;
}
