'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import GameCanvas, { GameCanvasHandle, ResourceType, Villager } from '@/components/GameCanvas';
import ManagementModal from '@/components/ManagementModal';
import ResourceBadge from '@/components/ResourceBadge';
import ChatWidget from '@/components/ChatWidget';

// Tipe data untuk resource player
interface Resources {
  kayu: number;
  buah: number;
  batu: number;
}

// Tipe data untuk riwayat chat
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function PlayPage() {
  // State untuk menyimpan resource pemain
  const [resources, setResources] = useState<Resources>({
    kayu: 0,
    buah: 0,
    batu: 0,
  });

  // State untuk memantau penduduk (dikirim dari Canvas)
  const [villagers, setVillagers] = useState<Villager[]>([]);
  const [townData, setTownData] = useState<any>({ houseLevel: 1, capacity: 3, villagerCount: 2 });
  
  // State untuk Modal Manajemen
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Ref untuk komunikasi dengan Canvas
  const canvasRef = useRef<GameCanvasHandle>(null);

  // Fungsi callback dari Canvas ketika karakter menaruh item di gudang
  const handleGainResource = useRef((item: ResourceType, amount: number) => {
    setResources((prev) => ({
      ...prev,
      [item]: prev[item as keyof Resources] + amount,
    }));
  }).current;

  return (
    <main className="h-[100dvh] bg-slate-950 text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-1000">
      {/* HEADER UI: Menampilkan Resource & Menu */}
      <header className="w-full sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 py-2 flex justify-center flex-none">
        <div className="w-full max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-tighter flex items-center gap-1.5 cursor-pointer">
              <span className="text-xl">🏡</span> IDLE TOWN
            </Link>
            
            {/* Global Resources in Header */}
            <div className="hidden md:flex items-center gap-3">
              <ResourceBadge emoji="🪵" label="KAYU" value={resources.kayu} color="amber" />
              <ResourceBadge emoji="🍎" label="BUAH" value={resources.buah} color="rose" />
              <ResourceBadge emoji="🪨" label="BATU" value={resources.batu} color="slate" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)] active:scale-95 flex items-center gap-2"
            >
              <span>⚙️</span> MANAJEMEN
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-3 md:p-4 flex flex-col gap-3 md:gap-4 overflow-hidden">
        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Kolom 1-2: Game Canvas */}
          <div className="xl:col-span-2 h-full flex flex-col justify-center">
            <GameCanvas 
              ref={canvasRef} 
              onGainResource={handleGainResource} 
              onUpdateVillagers={setVillagers}
              onUpdateTown={setTownData}
            />
          </div>

          {/* Kolom 3: Info Aktivitas */}
          <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800/50 shadow-inner flex flex-col overflow-hidden max-h-full mb-20 xl:mb-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] flex-none">Aktivitas Penduduk</h2>
              <div className="text-[9px] font-bold text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                🏠 LVL {townData.houseLevel} ({townData.villagerCount}/{townData.capacity})
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {villagers.map(v => (
                <div key={v.id} className="flex items-center justify-between text-xs p-2.5 bg-slate-950/50 rounded-xl border border-white/5 transition-all hover:border-blue-500/30">
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] border border-white/10 ${
                      v.state === 'PREGNANT' ? 'bg-fuchsia-500 animate-pulse' :
                      v.state === 'RESTING' || v.vitality < 20 ? 'bg-rose-500' : 
                      v.state === 'HARVESTING' ? 'bg-amber-500' :
                      v.state === 'RETURNING' ? 'bg-emerald-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex flex-col">
                      <span className="font-bold tracking-tight text-[11px] leading-none mb-1">
                        {v.name} {v.state === 'PREGNANT' && '🤰'}
                      </span>
                      <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest leading-none">
                        {v.state === 'PREGNANT' ? `HAMIL ${Math.floor(v.gestationProgress * 100)}%` : v.state}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[50px]">
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          v.vitality < 20 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-blue-500'
                        }`}
                        style={{ width: `${(v.vitality / v.maxVitality) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 bg-slate-950/40 p-3 rounded-xl border border-blue-500/10 text-[9px] text-blue-400/60 italic leading-snug flex-none">
              💡 {townData.villagerCount > townData.capacity ? '⚠️ OVERKAPASITAS! Penduduk tunawisma regenerasi lebih lambat.' : 'Klik tombol ⚙️ MANAJEMEN untuk perintah manual atau upgrade.'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Chat Widget */}
      <ChatWidget 
        villagers={villagers} 
        onOrderFarm={(item, amount, target) => canvasRef.current?.orderFarm(item, amount, target) || false} 
      />
      <ManagementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        villagers={villagers}
        townData={townData}
        resources={resources}
        onUpgradeStat={(id, stat) => canvasRef.current?.upgradeStat(id, stat)}
        onForceOrder={(id, task) => canvasRef.current?.forceOrder(id, task)}
        onUpgradeHouse={() => canvasRef.current?.upgradeHouse() || false}
      />
    </main>
  );
}
