'use client';

import { useState, useRef, useEffect } from 'react';
import GameCanvas, { GameCanvasHandle, ResourceType, Villager } from '@/components/GameCanvas';

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
  const handleGainResource = (item: ResourceType, amount: number) => {
    setResources((prev) => ({
      ...prev,
      [item]: prev[item as keyof Resources] + amount,
    }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center gap-8">
      {/* Container Utama Atas: Canvas & Visual Stats */}
      <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Kolom 1-2: Simulasi Game (Canvas) */}
        <div className="xl:col-span-2 space-y-4">
          <GameCanvas 
            ref={canvasRef} 
            onGainResource={handleGainResource} 
            onUpdateVillagers={setVillagers}
          />
        </div>

        {/* Kolom 3: Resource Indicators & Villager Stats */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 flex items-center gap-3">
              🏡 Idle Town <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded">v0.2</span>
            </h1>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-amber-900/10 flex items-center justify-between group hover:bg-slate-800 transition-colors">
                <span className="text-md font-medium flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-amber-900/20 group-hover:scale-110 transition-transform">🪵</span> 
                  <span className="text-amber-200/80">Kayu</span>
                </span>
                <span className="text-xl font-mono font-bold text-amber-400">{resources.kayu}</span>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-xl border border-rose-900/10 flex items-center justify-between group hover:bg-slate-800 transition-colors">
                <span className="text-md font-medium flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-rose-900/20 group-hover:scale-110 transition-transform">🍎</span> 
                  <span className="text-rose-200/80">Buah</span>
                </span>
                <span className="text-xl font-mono font-bold text-rose-400">{resources.buah}</span>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/10 flex items-center justify-between group hover:bg-slate-800 transition-colors">
                <span className="text-md font-medium flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-slate-700/30 group-hover:scale-110 transition-transform">🪨</span> 
                  <span className="text-slate-200/80">Batu</span>
                </span>
                <span className="text-xl font-mono font-bold text-slate-300">{resources.batu}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 text-xs text-slate-500 italic leading-relaxed">
            💡 Karakter akan otomatis pulang ke rumah saat HP rendah (merah) untuk makan dan beristirahat.
          </div>
        </div>

        {/* Kolom 4: Village Management (Manual Controls) */}
        <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Management</h2>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {villagers.map((v) => (
              <div 
                key={v.id} 
                className={`bg-slate-800/40 rounded-2xl p-4 border border-white/5 transition-all duration-300 hover:border-emerald-500/30 group ${
                  v.state !== 'IDLE' ? 'ring-1 ring-emerald-500/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform block">{v.emoji}</span>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">{v.name}</div>
                      <div className={`text-[9px] font-bold uppercase tracking-tighter ${
                        v.state === 'IDLE' ? 'text-slate-600' :
                        v.state === 'RESTING' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {v.state}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500">{Math.round(v.hp)}% HP</span>
                    <div className="h-1 w-12 bg-slate-950 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          v.hp > 50 ? 'bg-emerald-500' : v.hp > 20 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${(v.hp / v.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Manual Action Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button 
                    onClick={() => canvasRef.current?.forceOrder(v.id, 'kayu')}
                    className="aspect-square flex items-center justify-center rounded-lg bg-slate-900/60 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 transition-all text-xs"
                    title="Kumpulkan Kayu"
                  >
                    🪵
                  </button>
                  <button 
                    onClick={() => canvasRef.current?.forceOrder(v.id, 'buah')}
                    className="aspect-square flex items-center justify-center rounded-lg bg-slate-900/60 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 transition-all text-xs"
                    title="Petik Buah"
                  >
                    🍎
                  </button>
                  <button 
                    onClick={() => canvasRef.current?.forceOrder(v.id, 'batu')}
                    className="aspect-square flex items-center justify-center rounded-lg bg-slate-900/60 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 transition-all text-xs"
                    title="Tambang Batu"
                  >
                    🪨
                  </button>
                  <button 
                    onClick={() => canvasRef.current?.forceOrder(v.id, 'REST')}
                    className="aspect-square flex items-center justify-center rounded-lg bg-slate-900/60 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/40 transition-all text-xs"
                    title="Istirahat"
                  >
                    🏠
                  </button>
                </div>

                {/* Harvesting Progress Indicator */}
                {v.state === 'HARVESTING' && (
                  <div className="mt-2 h-0.5 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${v.progress * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-900 to-slate-950">
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center space-y-3 opacity-40">
              <span className="text-5xl">🗣️</span>
              <p className="text-sm italic">Berikan instruksi untuk dikerjakan penduduk...</p>
            </div>
          )}
          
          {chatHistory.map((msg, idx) => (
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
    </main>
  );
}
