'use client';

import { useState } from 'react';
import { Villager, ResourceType } from './GameCanvas';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  villagers: Villager[];
  onUpgradeStat: (villagerId: number, statName: string) => void;
  onForceOrder: (villagerId: number, task: ResourceType | 'REST') => void;
}

export default function ManagementModal({ isOpen, onClose, villagers, onUpgradeStat, onForceOrder }: ManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'karakter' | 'town'>('karakter');
  const [selectedVillagerId, setSelectedVillagerId] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[80vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-slate-100 uppercase tracking-tighter">Manajemen Desa</h2>
            <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button 
                onClick={() => { setActiveTab('karakter'); setSelectedVillagerId(null); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'karakter' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Penduduk
              </button>
              <button 
                onClick={() => setActiveTab('town')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'town' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Balai Kota
              </button>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
          {activeTab === 'karakter' && (
            <div className="flex flex-col gap-6">
              {villagers.length === 0 ? (
                <div className="py-10 text-center text-slate-500 italic">
                  Sedang mengambil data penduduk...
                </div>
              ) : !selectedVillagerId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {villagers.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVillagerId(v.id)}
                      className="group relative bg-slate-800/40 hover:bg-blue-600/20 rounded-2xl p-6 border border-white/5 hover:border-blue-500/50 transition-all flex flex-col items-center gap-3 active:scale-95 text-center"
                    >
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{v.emoji}</span>
                      <div>
                        <h3 className="font-bold text-slate-100 group-hover:text-blue-400 text-base">{v.name}</h3>
                        <p className="text-[10px] text-slate-500 font-mono">LVL {v.level}</p>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-blue-400 text-xs">➔</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Detail Header with Back Button */}
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedVillagerId(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all text-xs font-bold"
                    >
                      ← Kembali ke List
                    </button>
                    <div className="h-px flex-1 bg-slate-800"></div>
                  </div>

                  {/* Character Detail Card */}
                  {villagers.filter(v => v.id === selectedVillagerId).map((v) => (
                    <div key={v.id} className="bg-slate-800/40 rounded-3xl p-8 border border-white/5 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-6xl shadow-inner border border-white/5">
                            {v.emoji}
                          </div>
                          <div className="text-center md:text-left">
                            <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">{v.name}</h3>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                              <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-500/20">LEVEL {v.level}</span>
                              <span className="text-slate-500 text-[10px] font-mono">EXP {v.exp}/{v.maxExp}</span>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <div className="bg-amber-600/20 px-3 py-1.5 rounded-xl border border-amber-500/30">
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">{v.sp} Skill Points</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Vitality Bar in Detail */}
                        <div className="w-full md:w-64">
                           <div className="flex justify-between items-end mb-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vitalitas</span>
                             <span className="text-xs font-mono font-bold text-slate-200">{Math.round(v.vitality)} / {v.maxVitality}</span>
                           </div>
                           <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                             <div 
                               className={`h-full rounded-full transition-all duration-500 ${v.vitality / v.maxVitality > 0.4 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' : v.vitality / v.maxVitality > 0.2 ? 'bg-amber-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}
                               style={{ width: `${(v.vitality / v.maxVitality) * 100}%` }}
                             ></div>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Action Panel */}
                        <div className="flex flex-col gap-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Perintah Manual</h4>
                          <div className="grid grid-cols-4 gap-3">
                            <ActionButton icon="🌲" onClick={() => onForceOrder(v.id, 'kayu')} title="Kumpul Kayu" />
                            <ActionButton icon="🍎" onClick={() => onForceOrder(v.id, 'buah')} title="Petik Buah" />
                            <ActionButton icon="⛰️" onClick={() => onForceOrder(v.id, 'batu')} title="Tambang Batu" />
                            <ActionButton icon="🏠" onClick={() => onForceOrder(v.id, 'REST')} title="Istirahat" color="rose" />
                          </div>
                        </div>

                        {/* Upgrade Panel */}
                        <div className="flex flex-col gap-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Statistik ({v.sp} SP)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <StatItem 
                              label="MAX VITALITAS" 
                              value={v.maxVitality} 
                              onUpgrade={() => onUpgradeStat(v.id, 'hp')} 
                              canUpgrade={v.sp > 0}
                              icon="❤️"
                            />
                            <StatItem 
                              label="DAYA TAHAN" 
                              value={v.endurance.toFixed(1)} 
                              onUpgrade={() => onUpgradeStat(v.id, 'vitality')} 
                              canUpgrade={v.sp > 0}
                              icon="💊"
                            />
                            <StatItem 
                              label="STRENGTH" 
                              value={v.strength.toFixed(1)} 
                              onUpgrade={() => onUpgradeStat(v.id, 'strength')} 
                              canUpgrade={v.sp > 0}
                              icon="💪"
                            />
                            <StatItem 
                              label="CAPACITY" 
                              value={v.storageCapacity} 
                              onUpgrade={() => onUpgradeStat(v.id, 'storage')} 
                              canUpgrade={v.sp > 0}
                              icon="🎒"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'town' && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <span className="text-4xl mb-4">🏗️</span>
              <p className="text-sm italic">Fitur Balai Kota akan segera hadir...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, onClick, title, color = 'blue' }: { 
  icon: string; 
  onClick: () => void; 
  title: string;
  color?: 'blue' | 'rose';
}) {
  const colorStyles = {
    blue: 'hover:bg-blue-600/20 border-blue-500/10 hover:border-blue-500/40',
    rose: 'hover:bg-rose-600/20 border-rose-500/10 hover:border-rose-500/40'
  };

  return (
    <button 
      onClick={onClick}
      title={title}
      className={`flex-1 aspect-square flex items-center justify-center text-xl rounded-lg bg-slate-900 border transition-all active:scale-90 ${colorStyles[color]}`}
    >
      {icon}
    </button>
  );
}

function StatItem({ label, value, onUpgrade, canUpgrade, icon }: { 
  label: string; 
  value: any; 
  onUpgrade: () => void; 
  canUpgrade: boolean;
  icon: string;
}) {
  return (
    <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
      <div className="flex items-center gap-2">
        <span className="text-xs grayscale group-hover:grayscale-0 transition-all">{icon}</span>
        <div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">{label}</p>
          <p className="text-sm font-mono font-bold text-slate-200">{value}</p>
        </div>
      </div>
      {canUpgrade && (
        <button 
          onClick={onUpgrade}
          className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white text-xs font-bold transition-all shadow-lg active:scale-90"
        >
          +
        </button>
      )}
    </div>
  );
}
