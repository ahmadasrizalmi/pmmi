import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL ?? 'http://localhost:3001';

interface PortfolioDetail {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  body?: string;
  student_name?: string;
  thumbnail_url?: string;
  published_at?: string;
}

const PortfolioDetailPage: React.FC = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<PortfolioDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_URL}/v1/portfolio/${slug}`)
      .then(async r => {
        const b = await r.json();
        if (!r.ok) throw new Error(b.error ?? 'Portfolio tidak ditemukan');
        setItem(b);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-4 w-32 bg-zinc-800 rounded mb-6" />
          <div className="h-12 w-3/4 bg-zinc-800 rounded mb-4" />
          <div className="h-5 w-48 bg-zinc-800 rounded mb-12" />
          <div className="h-40 bg-zinc-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <article className="max-w-4xl mx-auto">
        <Link to="/portfolio" className="text-fuchsia-400 hover:text-fuchsia-300 transition">
          &larr; Semua portfolio
        </Link>

        {error && (
          <div className="mt-8 p-4 border border-red-800 rounded-xl bg-red-950/40 text-red-200">
            {error}
          </div>
        )}

        {item && (
          <>
            <p className="mt-8 text-fuchsia-400 uppercase tracking-widest text-sm font-semibold">
              Featured Project
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mt-2">{item.title}</h1>
            <p className="text-zinc-400 mt-4 text-lg">
              Oleh {item.student_name}
              {item.published_at && (
                <span className="ml-2 text-zinc-500">
                  &middot; {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </p>

            <div className="mt-10 p-7 rounded-2xl border border-zinc-800 bg-zinc-950/80">
              <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">
                {item.summary ?? 'Karya santri PMMI.'}
              </p>
              {item.body && (
                <div className="mt-6 pt-6 border-t border-zinc-800 text-zinc-400 leading-relaxed">
                  {item.body}
                </div>
              )}
            </div>
          </>
        )}
      </article>
    </div>
  );
};

export default PortfolioDetailPage;
