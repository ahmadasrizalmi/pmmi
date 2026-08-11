import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL ?? 'http://localhost:3001';

interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  student_name?: string;
  thumbnail_url?: string;
  published_at?: string;
}

const PortfolioPage: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/v1/portfolio`)
      .then(async r => {
        const b = await r.json();
        if (!r.ok) throw new Error(b.error ?? 'Gagal memuat portfolio');
        setItems(b.items ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-fuchsia-400 uppercase tracking-widest text-sm font-semibold">Featured Works</p>
        <h1 className="text-4xl md:text-6xl font-bold mt-2">Portfolio Santri PMMI</h1>
        <p className="text-zinc-400 mt-4 max-w-2xl">
          Karya yang telah dinilai dan dipilih Ustadz/Admin sebagai Featured dipublikasikan langsung di sini.
        </p>

        {error && (
          <div className="mt-8 p-4 border border-red-800 rounded-xl bg-red-950/40 text-red-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(n => (
              <div key={n} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 animate-pulse">
                <div className="h-3 w-20 bg-zinc-800 rounded mb-4" />
                <div className="h-7 w-3/4 bg-zinc-800 rounded mb-3" />
                <div className="h-4 w-full bg-zinc-800 rounded mb-2" />
                <div className="h-4 w-1/2 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {items.map((p) => (
              <Link
                to={`/portfolio/${p.slug}`}
                key={p.id}
                className="block p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 hover:border-fuchsia-700 transition group"
              >
                <div className="text-xs uppercase tracking-widest text-fuchsia-400">Featured</div>
                <h2 className="text-2xl font-bold mt-3 group-hover:text-fuchsia-300 transition-colors">
                  {p.title}
                </h2>
                <p className="text-zinc-400 mt-3 line-clamp-2">{p.summary ?? 'Karya santri PMMI'}</p>
                <div className="text-sm text-zinc-500 mt-5">
                  {p.student_name ?? ''}
                  {p.published_at && (
                    <span className="ml-2">
                      &middot; {new Date(p.published_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="mt-10 text-center p-12 rounded-2xl border border-zinc-800 bg-zinc-950/80">
            <p className="text-zinc-400 text-lg">Belum ada karya Featured yang dipublikasikan.</p>
            <p className="text-zinc-500 mt-2 text-sm">
              Portfolio akan muncul di sini setelah Ustadz atau Admin menandai karya santri sebagai Featured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
