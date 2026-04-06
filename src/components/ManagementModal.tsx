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
                onClick={() => setActiveTab('karakter')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'karakter' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Karakter
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {villagers.length === 0 && (
                <div className="col-span-2 py-10 text-center text-slate-500 italic">
                  Sedang mengambil data penduduk...
                </div>
              )}
              {villagers.map((v) => (
                <div key={v.id} className="bg-slate-800/40 rounded-2xl p-5 border border-white/5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{v.emoji}</span>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">{v.name}</h3>
                        <p className="text-[10px] text-blue-400 font-mono">LVL {v.level} • EXP {v.exp}/{v.maxExp}</p>
                      </div>
                    </div>
                    <div className="bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">{v.sp} SP Available</span>
                    </div>
                  </div>

                  {/* Manual Actions inside Modal */}
                  <div className="flex gap-2 p-2 bg-slate-950/50 rounded-xl border border-white/5">
                    <ActionButton icon="🌲" onClick={() => onForceOrder(v.id, 'kayu')} title="Kumpul Kayu" />
                    <ActionButton icon="🍎" onClick={() => onForceOrder(v.id, 'buah')} title="Petik Buah" />
                    <ActionButton icon="⛰️" onClick={() => onForceOrder(v.id, 'batu')} title="Tambang Batu" />
                    <ActionButton icon="🏠" onClick={() => onForceOrder(v.id, 'REST')} title="Istirahat" color="rose" />
                  </div>

                  {/* Stats Upgrade Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <StatItem 
                      label="MAX HP" 
                      value={v.maxHp} 
                      onUpgrade={() => onUpgradeStat(v.id, 'hp')} 
                      canUpgrade={v.sp > 0}
                      icon="❤️"
                    />
                    <StatItem 
                      label="VITALITY" 
                      value={v.vitality.toFixed(1)} 
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
              ))}
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
