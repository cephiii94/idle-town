'use client';

import { useState, useRef, useEffect } from 'react';
import { ResourceType, Villager } from './GameCanvas';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWidgetProps {
  villagers: Villager[];
  onOrderFarm: (item: ResourceType, amount: number, targetName: string | null) => boolean;
}

export default function ChatWidget({ villagers, onOrderFarm }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          villagerStats: villagers 
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setChatHistory((prev) => [...prev, { role: 'assistant', content: data.reply }]);

      if (data.actions && Array.isArray(data.actions)) {
        let totalAssigned = 0;
        data.actions.forEach((act: any) => {
          if (act.action === 'FARM') {
            const item = act.item.toLowerCase() as ResourceType;
            const amount = act.amount || 0;
            const targetName = act.target_villager || null;
            
            const success = onOrderFarm(item, amount, targetName);
            if (success) totalAssigned++;
          }
        });

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
        { role: 'assistant', content: 'Maaf, sepertinya ada masalah koneksi.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[300px] md:w-[340px] h-[450px] bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 duration-300">
          {/* Header */}
          <div className="px-5 py-3 bg-blue-600 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <p className="text-[10px] font-bold text-white tracking-[0.15em] uppercase">
                Asisten Desa
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors text-xs"
            >
              ✕
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 to-slate-950 custom-scrollbar pr-2 overscroll-contain">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
                <span className="text-3xl mb-3">💬</span>
                <p className="text-[10px] font-medium leading-relaxed">Halo! Saya asisten Anda. Berikan perintah kepada penduduk melalui saya.</p>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5 shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-2 rounded-xl rounded-tl-none animate-pulse text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/80 border-t border-white/5 flex-none">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik perintah..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all text-xs placeholder-slate-700"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-all active:scale-90 disabled:opacity-50 text-xs"
              >
                🚀
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-xl transition-all active:scale-90 hover:scale-105 ${
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-blue-600 text-white shadow-blue-500/30'
        }`}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
