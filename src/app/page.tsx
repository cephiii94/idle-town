'use client';

import Link from 'next/link';

export default function MainMenuPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full animate-pulse delay-700"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <div className="mb-12 animate-in fade-in zoom-in duration-1000">
           <div className="w-32 h-32 bg-slate-900 rounded-[40px] flex items-center justify-center text-7xl shadow-2xl border border-white/10 mb-8 mx-auto rotate-12 hover:rotate-0 transition-transform duration-500 ring-4 ring-blue-500/20">
             🏡
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-400 to-cyan-400 tracking-tighter drop-shadow-sm mb-4">
             IDLE TOWN
           </h1>
           <p className="text-slate-400 text-lg md:text-xl font-medium tracking-widest uppercase opacity-60">
             Pembangun Desa Masa Depan
           </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link 
            href="/map"
            className="group relative bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-sm text-center uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">Mulai Petualangan</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </Link>
          <button 
            className="bg-slate-900/50 hover:bg-slate-800 border border-white/5 py-4 rounded-2xl font-bold text-slate-400 hover:text-white text-[10px] uppercase tracking-widest transition-all"
          >
            Pengaturan Permainan
          </button>
          <button 
            className="bg-slate-900/50 hover:bg-slate-800 border border-white/5 py-4 rounded-2xl font-bold text-slate-400 hover:text-white text-[10px] uppercase tracking-widest transition-all"
          >
            Tentang Kreator
          </button>
        </div>

        <footer className="absolute bottom-8 text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] flex items-center gap-4">
          <span>VERSION 1.2.0</span>
          <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
          <span>GOOGLE DEEPMIND AGENTIC UI</span>
        </footer>
      </div>
    </main>
  );
}
