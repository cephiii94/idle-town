import Link from 'next/link';
import { stages } from '@/lib/stages';

export default function StageSelectPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden px-4 py-8 flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-12%] left-[-8%] w-[38%] h-[38%] bg-emerald-500/15 blur-[110px] rounded-full"></div>
        <div className="absolute bottom-[-14%] right-[-8%] w-[42%] h-[42%] bg-blue-500/15 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_42%)]"></div>
      </div>

      <section className="relative z-10 w-full max-w-6xl">
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors mb-5">
              <span>←</span> Menu Utama
            </Link>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
              Pilih Stage
            </h1>
            <p className="mt-3 text-slate-400 max-w-xl">
              Tentukan area awal desa sebelum masuk ke game scene.
            </p>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-2 w-fit">
            3 Stage Tersedia
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {stages.map((stage) => (
            <Link
              key={stage.id}
              href={`/map?stage=${stage.id}`}
              className="group bg-slate-900/70 border border-white/10 rounded-2xl p-5 md:p-6 min-h-[300px] flex flex-col justify-between transition-all hover:-translate-y-1 hover:border-blue-400/50 hover:bg-slate-900 shadow-2xl active:scale-[0.98]"
            >
              <div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stage.accent} flex items-center justify-center text-4xl shadow-lg mb-6 group-hover:scale-105 transition-transform`}>
                  {stage.emoji}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                    {stage.subtitle}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-blue-300">
                    Stage
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-3">
                  {stage.name}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              <div className="mt-8">
                <div className="flex flex-wrap gap-2 mb-5">
                  {stage.resources.map((resource) => (
                    <span key={resource} className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-slate-950/70 border border-white/10 rounded-full px-3 py-1">
                      {resource}
                    </span>
                  ))}
                </div>
                <div className="w-full bg-blue-600 group-hover:bg-blue-500 text-white py-3 rounded-xl font-black text-[10px] text-center uppercase tracking-[0.2em] transition-colors">
                  Masuk Stage
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
