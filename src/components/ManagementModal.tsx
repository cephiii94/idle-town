'use client';

import { useState } from 'react';
import { Villager, ResourceType } from './GameCanvas';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  villagers: Villager[];
  townData: any;
  resources: { kayu: number; buah: number; batu: number };
  onUpgradeStat: (villagerId: number, statName: string) => void;
  onForceOrder: (villagerId: number, task: ResourceType | 'REST') => void;
  onUpgradeHouse: () => boolean;
}

export default function ManagementModal({ 
  isOpen, onClose, villagers, townData, resources, onUpgradeStat, onForceOrder, onUpgradeHouse 
}: ManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'karakter' | 'town'>('karakter');
  const [selectedVillagerId, setSelectedVillagerId] = useState<number | null>(null);

  if (!isOpen) return null;

  const houseUpgradeCosts = [
    { wood: 0, stone: 0 },
    { wood: 30, stone: 0 },   // Lvl 2
    { wood: 80, stone: 30 },  // Lvl 3
    { wood: 150, stone: 80 }, // Lvl 4
    { wood: 300, stone: 200 },// Lvl 5
  ];

  const nextLevel = townData.houseLevel < 5 ? townData.houseLevel + 1 : null;
  const upgradeCost = nextLevel ? houseUpgradeCosts[nextLevel - 1] : null;
  const canAfford = upgradeCost ? (resources.kayu >= upgradeCost.wood && resources.batu >= upgradeCost.stone) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-slate-900 w-[95%] sm:w-full max-w-4xl max-h-[85vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/50 text-white gap-4">
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 md:gap-6">
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-tighter whitespace-nowrap">Manajemen Desa</h2>
            <div className="flex gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 h-fit">
              <button 
                onClick={() => { setActiveTab('karakter'); setSelectedVillagerId(null); }}
                className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                  activeTab === 'karakter' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Penduduk
              </button>
              <button 
                onClick={() => setActiveTab('town')}
                className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                  activeTab === 'town' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Balai Kota
              </button>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:static p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white z-10 bg-slate-900/80 sm:bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
          {activeTab === 'karakter' && (
            <div className="flex flex-col gap-6">
              {villagers.length === 0 ? (
                <div className="py-10 text-center text-slate-500 italic">
                  Sedang mengambil data penduduk...
                </div>
              ) : !selectedVillagerId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {villagers.map((v) => {
                      const isWarning = v.state === 'RESTING' || v.vitality < 20;
                      const isPregnant = v.state === 'PREGNANT';
                      const orbColor = isPregnant ? 'bg-fuchsia-500 shadow-fuchsia-500/40' :
                                      isWarning ? 'bg-rose-500 shadow-rose-500/40' : 
                                      v.state === 'HARVESTING' ? 'bg-amber-500 shadow-amber-500/40' :
                                      v.state === 'RETURNING' ? 'bg-emerald-500 shadow-emerald-500/40' :
                                      'bg-blue-500 shadow-blue-500/40';

                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVillagerId(v.id)}
                          className="group relative bg-slate-800/40 hover:bg-blue-600/10 rounded-2xl p-6 border border-white/5 hover:border-blue-500/50 transition-all flex flex-col items-center gap-4 active:scale-95 text-center overflow-hidden"
                        >
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] border-2 border-white/10 relative transition-transform duration-300 group-hover:scale-110
                            ${orbColor}`}>
                            <div className="absolute top-1 left-2 w-1/2 h-1/3 bg-white/20 rounded-full blur-[2px] -rotate-12"></div>
                            
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-900 rounded-full border border-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                              {v.level}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-100 group-hover:text-blue-400 text-sm whitespace-nowrap">
                              {v.name} {isPregnant && '(🤰)'}
                            </h3>
                            <div className="flex items-center gap-2 justify-center mt-1">
                               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{v.gender} • {v.state}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Detail Header with Back Button */}
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedVillagerId(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all text-xs font-bold"
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
                          <div className="relative group">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10 relative
                              ${v.state === 'PREGNANT' ? 'bg-fuchsia-500 animate-pulse' :
                                v.state === 'RESTING' || v.vitality < 20 ? 'bg-rose-500 shadow-rose-500/40' : 
                                v.state === 'HARVESTING' ? 'bg-amber-500 shadow-amber-500/40' :
                                v.state === 'RETURNING' ? 'bg-emerald-500 shadow-emerald-500/40' :
                                'bg-blue-500 shadow-blue-500/40'}`}>
                              {/* Inner Shine for 3D look */}
                              <div className="absolute top-2 left-4 w-1/2 h-1/3 bg-white/30 rounded-full blur-[4px] -rotate-12"></div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-2xl border-2 border-blue-500 flex items-center justify-center text-xs font-black text-white shadow-2xl rotate-12">
                              {v.level}
                            </div>
                          </div>
                          <div className="text-center md:text-left">
                            <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">{v.name} {v.gender === 'Pria' ? '♂️' : '♀️'}</h3>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                              <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-500/20">LEVEL {v.level}</span>
                              <span className="text-slate-500 text-[10px] font-mono">{v.gender.toUpperCase()}</span>
                              {v.state === 'PREGNANT' && <span className="bg-fuchsia-600/20 text-fuchsia-400 px-3 py-1 rounded-full text-[10px] font-bold border border-fuchsia-500/20 animate-pulse">SEDANG HAMIL ({Math.floor(v.gestationProgress * 100)}%)</span>}
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
            <div className="flex flex-col gap-8 p-4">
              <div className="bg-slate-800/40 rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-blue-600/10 rounded-3xl border border-blue-500/20 flex items-center justify-center text-5xl md:text-6xl shadow-inner relative flex-none">
                  🏠
                  <div className="absolute -bottom-3 bg-blue-600 text-white text-[9px] md:text-[10px] font-black px-3 md:px-4 py-1 rounded-full shadow-xl uppercase tracking-widest">
                    Level {townData.houseLevel}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-6 w-full">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Kapasitas Perumahan</h3>
                    <p className="text-slate-500 text-[10px] md:text-xs mt-1">Upgrade rumah untuk menampung lebih banyak penduduk dan menghindari status Homeless.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Kapasitas Saat Ini</p>
                      <p className="text-2xl font-black text-white">{townData.capacity} <span className="text-xs text-slate-600">Unit</span></p>
                    </div>
                    <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                      <p className="text-[10px] font-bold text-blue-500 uppercase">Target Populasi</p>
                      <p className="text-2xl font-black text-blue-400">{townData.villagerCount} <span className="text-xs text-blue-900">Unit</span></p>
                    </div>
                  </div>

                  {nextLevel ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-800"></div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Biaya Upgrade Lvl {nextLevel}</span>
                        <div className="flex-1 h-px bg-slate-800"></div>
                      </div>
                      
                      <div className="flex gap-4">
                         <div className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1 ${resources.kayu >= upgradeCost!.wood ? 'bg-slate-900 border-white/5' : 'bg-rose-950/20 border-rose-500/20'}`}>
                           <span className="text-[8px] font-bold text-slate-500 uppercase">Kayu</span>
                           <span className={`text-sm font-black ${resources.kayu >= upgradeCost!.wood ? 'text-white' : 'text-rose-500'}`}>{resources.kayu} / {upgradeCost!.wood}</span>
                         </div>
                         <div className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1 ${resources.batu >= upgradeCost!.stone ? 'bg-slate-900 border-white/5' : 'bg-rose-950/20 border-rose-500/20'}`}>
                           <span className="text-[8px] font-bold text-slate-500 uppercase">Batu</span>
                           <span className={`text-sm font-black ${resources.batu >= upgradeCost!.stone ? 'text-white' : 'text-rose-500'}`}>{resources.batu} / {upgradeCost!.stone}</span>
                         </div>
                      </div>

                      <button 
                        onClick={() => onUpgradeHouse()}
                        disabled={!canAfford}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3
                          ${canAfford ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40' : 'bg-slate-800 text-slate-600 grayscale cursor-not-allowed'}`}
                      >
                        🚀 {canAfford ? 'Mulai Upgrade Rumah' : 'Resource Tidak Cukup'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 text-center">
                      <span className="text-2xl mb-2 block">✨</span>
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Kapasitas Maksimal Tercapai</p>
                    </div>
                  )}
                </div>
              </div>
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
