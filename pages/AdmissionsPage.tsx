import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';

const steps=[
  ['1','Isi Pendaftaran','Calon santri mengisi data awal di portal PMMI dan menerima token applicant.'],
  ['2','Dokumen & Verifikasi','Upload dokumen dilakukan lewat portal applicant. Admin memverifikasi kelengkapan.'],
  ['3','Seleksi & Wawancara','Panitia melakukan scoring, screening, dan wawancara sesuai periode penerimaan.'],
  ['4','Keputusan','Applicant mendapat status Accepted, Waitlisted, atau Rejected melalui sistem.'],
  ['5','Daftar Ulang','Applicant Accepted memilih program dan cohort sebelum enrollment.'],
  ['6','Aktivasi Santri','Setelah Enrolled, akun SANTRI, resource AI, storage, dan entitlement agent diprovisioning.'],
];

const AdmissionsPage:React.FC=()=> (
  <div className="pt-20 pb-24 px-6">
    <div className="container mx-auto max-w-6xl">
      <AnimatedSection>
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-fuchsia-400 font-semibold uppercase tracking-[0.2em] text-sm">Penerimaan Santri</p>
          <h1 className="text-4xl md:text-6xl font-bold mt-4">Mulai perjalananmu di PMMI</h1>
          <p className="text-zinc-400 text-lg mt-5">Pendaftaran, dokumen, seleksi, keputusan, dan daftar ulang dikelola melalui PMMI Digital Campus agar prosesnya transparan dan mudah dipantau.</p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link to="/daftar" className="px-7 py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 font-bold transition">Daftar Sekarang</Link>
            <a href="https://app.pondokmultimedia.id" className="px-7 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 font-semibold transition">Login Digital Campus</a>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
        {steps.map(([number,title,body],index)=><AnimatedSection key={number} delay={index*0.05}><div className="h-full p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70"><div className="w-10 h-10 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-300 font-bold">{number}</div><h2 className="text-xl font-bold mt-5">{title}</h2><p className="text-zinc-400 mt-3 leading-relaxed">{body}</p></div></AnimatedSection>)}
      </div>

      <AnimatedSection>
        <div className="mt-16 p-7 rounded-2xl border border-purple-800/50 bg-purple-950/20">
          <h2 className="text-2xl font-bold">Applicant belum menjadi santri aktif</h2>
          <p className="text-zinc-400 mt-3">Akun SANTRI dan resource Digital Campus baru dibuat setelah keputusan diterima, daftar ulang lengkap, dan status berubah menjadi <strong className="text-zinc-200">ENROLLED</strong>. Hermes AI Agent juga tidak dibuat otomatis; santri membuat agent sendiri dari dashboard sesuai slot yang tersedia.</p>
        </div>
      </AnimatedSection>
    </div>
  </div>
);

export default AdmissionsPage;
