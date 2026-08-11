import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3001';

const ApplyPage: React.FC = () => {
  const [periods, setPeriods] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [form, setForm] = useState({
    admissionPeriodId: '',
    programId: '',
    applicantName: '',
    email: '',
    phone: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/v1/admissions/periods`).then(r => r.json()),
      fetch(`${API_URL}/v1/catalog/programs`).then(r => r.json()).catch(() => ({ items: [] })),
    ]).then(([periodsData, programsData]) => {
      setPeriods(periodsData.items ?? []);
      setPrograms(programsData.items ?? []);
      if (periodsData.items?.[0]) {
        setForm(f => ({ ...f, admissionPeriodId: periodsData.items[0].id }));
      }
    }).catch(() => setError('Belum dapat memuat data pendaftaran.'));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload: any = {
        admissionPeriodId: form.admissionPeriodId,
        applicantName: form.applicantName,
        email: form.email,
        phone: form.phone,
      };
      if (form.programId) payload.programId = form.programId;

      const r = await fetch(`${API_URL}/v1/admissions/applications`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? 'Pendaftaran gagal');

      // Upload doc if selected
      if (file && body.id) {
        try {
          const intent = await fetch(`${API_URL}/v1/admissions/applications/${body.id}/documents/upload`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ kind: 'IDENTITY', originalName: file.name, contentType: file.type || 'application/octet-stream' }),
          }).then(r => r.json());

          if (intent.url) {
            await fetch(intent.url, {
              method: 'PUT', body: file,
              headers: { 'content-type': file.type || 'application/octet-stream' },
            });
            await fetch(`${API_URL}/v1/admissions/applications/${body.id}/documents/complete`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ uploadId: intent.uploadId }),
            });
          }
        } catch {
          // Doc upload is best-effort; application already succeeded
        }
      }

      localStorage.setItem(`pmmi-applicant-${body.id}`, body.applicantToken);
      setResult(body);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-fuchsia-400 font-semibold tracking-widest uppercase text-sm">Penerimaan Santri</p>
          <h1 className="text-4xl md:text-6xl font-bold mt-3">Daftar PMMI</h1>
          <p className="text-zinc-400 mt-4 text-lg">
            Isi data diri dan pilih program yang diminati. Setelah terkirim, data kamu akan diverifikasi oleh tim PMMI.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-800 bg-red-950/60 text-red-200">
            {error}
          </div>
        )}

        {result ? (
          <div className="p-7 rounded-2xl border border-fuchsia-700/50 bg-zinc-950/80">
            <h2 className="text-2xl font-bold">Pendaftaran diterima</h2>
            <p className="text-zinc-300 mt-3">ID pendaftaran: <code>{result.id}</code></p>
            <p className="text-zinc-400 mt-2">
              Token applicant sudah disimpan di browser ini. Simpan juga token di tempat aman karena diperlukan bila portal dibuka dari perangkat lain.
            </p>
            <div className="mt-5 p-4 rounded-xl border border-zinc-700 bg-black/70">
              <div className="text-xs uppercase tracking-widest text-zinc-500">Applicant token</div>
              <code className="block break-all mt-2 text-sm text-zinc-200">{result.applicantToken}</code>
            </div>
            <Link
              to={`/daftar/${result.id}`}
              className="mt-5 inline-flex w-full justify-center py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 font-bold transition"
            >
              Lanjut ke Portal Applicant
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="space-y-5 p-7 rounded-2xl border border-zinc-800 bg-zinc-950/80"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm text-zinc-300">Periode Pendaftaran</span>
                <select
                  required
                  value={form.admissionPeriodId}
                  onChange={e => setForm({ ...form, admissionPeriodId: e.target.value })}
                  className="mt-2 w-full bg-black border border-zinc-700 rounded-xl p-3"
                >
                  <option value="">Pilih periode</option>
                  {periods.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-zinc-300">Program Pilihan</span>
                <select
                  value={form.programId}
                  onChange={e => setForm({ ...form, programId: e.target.value })}
                  className="mt-2 w-full bg-black border border-zinc-700 rounded-xl p-3"
                >
                  <option value="">Pilih program</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-zinc-300">Nama Lengkap</span>
              <input
                required
                minLength={2}
                value={form.applicantName}
                onChange={e => setForm({ ...form, applicantName: e.target.value })}
                placeholder="Nama sesuai KTP/KK"
                className="mt-2 w-full bg-black border border-zinc-700 rounded-xl p-3"
              />
            </label>

            <div className="grid md:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm text-zinc-300">Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@contoh.com"
                  className="mt-2 w-full bg-black border border-zinc-700 rounded-xl p-3"
                />
              </label>
              <label className="block">
                <span className="text-sm text-zinc-300">WhatsApp</span>
                <input
                  required
                  minLength={8}
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="0812-3456-7890"
                  className="mt-2 w-full bg-black border border-zinc-700 rounded-xl p-3"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-zinc-300">Dokumen (opsional)</span>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-700 bg-black/50 cursor-pointer hover:border-fuchsia-500 transition">
                  <span className="material-icons text-zinc-400" style={{ fontSize: 20 }}>upload_file</span>
                  <span className="text-sm text-zinc-400">{file ? file.name : 'Upload KTP/KK'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-sm text-zinc-500 hover:text-zinc-300"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </label>

            <button
              disabled={busy || !periods.length}
              className="w-full py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 font-bold transition disabled:opacity-50"
            >
              {busy ? 'Mengirim…' : 'Daftar Sekarang'}
            </button>

            {!periods.length && (
              <p className="text-sm text-zinc-500 text-center">
                Belum ada periode pendaftaran yang aktif. Silakan cek kembali nanti.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplyPage;
