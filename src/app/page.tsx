'use client';

import { useState, useRef, useEffect } from 'react';
import GameCanvas, { GameCanvasHandle, ResourceType, Villager } from '@/components/GameCanvas';
import ManagementModal from '@/components/ManagementModal';

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

export default function IdleTownPage() {
  // State untuk menyimpan resource pemain
  const [resources, setResources] = useState<Resources>({
    kayu: 0,
    buah: 0,
    batu: 0,
  });

  // State untuk riwayat percakapan
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk memantau penduduk (dikirim dari Canvas)
  const [villagers, setVillagers] = useState<Villager[]>([]);
  
  // State untuk Modal Manajemen
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Ref untuk komunikasi dengan Canvas
  const canvasRef = useRef<GameCanvasHandle>(null);
  
  // Ref untuk scroll otomatis ke bawah chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Tambahkan pesan user ke riwayat
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Panggil API chat dengan data status penduduk terbaru
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          villagerStats: villagers // Mengirimkan status Nama, HP, State penduduk
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Log data mentah dari AI untuk debugging
      console.log('AI Response:', data);

      // Update riwayat dengan balasan AI
      setChatHistory((prev) => [...prev, { role: 'assistant', content: data.reply }]);

      // Proses tiap aksi (FARM) yang dikirim oleh AI
      if (data.actions && Array.isArray(data.actions)) {
        let totalAssigned = 0;
        
        data.actions.forEach((act: any) => {
          if (act.action === 'FARM') {
            const item = act.item.toLowerCase() as ResourceType;
            const amount = act.amount || 0;
            const targetName = act.target_villager || null;
            
            // Beri perintah ke penduduk (bisa target Nama spesifik)
            const success = canvasRef.current?.orderFarm(item, amount, targetName);
            if (success) totalAssigned++;
          }
        });

        // Feedback jika semua penduduk sibuk
        if (data.actions.length > 0 && totalAssigned === 0) {
          setChatHistory((prev) => [...prev, { 
            role: 'assistant', 
            content: 'Maaf, semua penduduk sedang sibuk atau kelelahan saat ini.' 
          }]);
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Maaf, sepertinya ada masalah koneksi. Coba lagi ya!' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi callback dari Canvas ketika karakter menaruh item di gudang
  const handleGainResource = useRef((item: ResourceType, amount: number) => {
    setResources((prev) => ({
      ...prev,
      [item]: prev[item as keyof Resources] + amount,
    }));
  }).current;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* HEADER UI: Menampilkan Resource & Menu */}
      <header className="w-full sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-center">
        <div className="w-full max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-tighter flex items-center gap-2">
              <span className="text-2xl">🏡</span> IDLE TOWN
            </h1>
            
            {/* Global Resources in Header */}
            <div className="hidden md:flex items-center gap-4">
              <ResourceBadge emoji="🪵" label="KAYU" value={resources.kayu} color="amber" />
              <ResourceBadge emoji="🍎" label="BUAH" value={resources.buah} color="rose" />
              <ResourceBadge emoji="🪨" label="BATU" value={resources.batu} color="slate" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 flex items-center gap-2"
            >
              <span>⚙️</span> MANAJEMEN
            </button>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl p-4 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Kolom 1-2: Game Canvas */}
        <div className="xl:col-span-2 space-y-4">
          <GameCanvas 
            ref={canvasRef} 
            onGainResource={handleGainResource} 
            onUpdateVillagers={setVillagers}
          />
        </div>

        {/* Kolom 3: Chat Assistant & Aktivitas */}
        <div className="space-y-6 flex flex-col h-full min-h-[400px]">
          {/* Info Card Kecil */}
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Aktivitas Penduduk</h2>
            <div className="space-y-3">
              {villagers.map(v => (
                <div key={v.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span>{v.emoji}</span>
                    <span className="font-bold">{v.name}</span>
                  </div>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                    v.state === 'IDLE' ? 'bg-slate-800 text-slate-500' : 
                    v.state === 'RESTING' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {v.state}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/30 p-4 rounded-2xl border border-blue-500/10 text-[10px] text-blue-400/60 italic leading-relaxed">
            💡 Gunakan tombol ⚙️ MANAJEMEN di atas untuk upgrade statistik HP & Vitalitas penduduk menggunakan SP.
          </div>
        </div>
      </div>

      {/* Chat Assistant (Bawah) */}
      <div className="w-full max-w-7xl bg-slate-900 rounded-3xl flex flex-col shadow-2xl border border-slate-800 overflow-hidden h-[350px]">
        {/* Chat Header */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
              Command Center Desa
            </p>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-900 to-slate-950">{chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-slate-100 text-slate-950 rounded-tr-none font-medium'
                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none animate-pulse text-slate-600 text-[10px] uppercase font-bold tracking-widest">
                Transmitting Data...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Contoh: Budi, tolong ambilkan kayu di hutan..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-slate-300 placeholder-slate-700 text-sm"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95"
            >
              Send
            </button>
          </div>
        </form>
      </div>
      <ManagementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        villagers={villagers}
        onUpgradeStat={(id, stat) => canvasRef.current?.upgradeStat(id, stat)}
        onForceOrder={(id, task) => canvasRef.current?.forceOrder(id, task)}
      />
    </main>
  );
}

// Sub-component untuk Badge Resource di Header
function ResourceBadge({ emoji, label, value, color }: { emoji: string, label: string, value: number, color: string }) {
  const colors: Record<string, string> = {
    amber: 'from-amber-500/20 to-amber-900/20 border-amber-500/30 text-amber-200',
    rose: 'from-rose-500/20 to-rose-900/20 border-rose-500/30 text-rose-200',
    slate: 'from-slate-500/20 to-slate-900/20 border-slate-500/30 text-slate-200'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border bg-gradient-to-br ${colors[color]} backdrop-blur-sm shadow-lg`}>
      <span className="text-lg">{emoji}</span>
      <div className="flex flex-col">
        <span className="text-[8px] font-bold opacity-60 tracking-wider">{label}</span>
        <span className="text-sm font-mono font-black">{value}</span>
      </div>
    </div>
  );
}
