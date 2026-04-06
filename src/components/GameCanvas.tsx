'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Dasar koordinat lokasi di desa
const LOCATIONS = {
  HOME: { x: 50, y: 70, icon: '🏠' },
  STORAGE: { x: 250, y: 180, icon: '📦' },
  WOOD: { x: 450, y: 50, icon: '🌲' },
  FRUIT: { x: 450, y: 180, icon: '🌳' },
  STONE: { x: 450, y: 310, icon: '⛰️' },
};

export type ResourceType = 'kayu' | 'buah' | 'batu';

export interface Villager {
  id: number;
  name: string;
  emoji: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  state: 'IDLE' | 'MOVING' | 'HARVESTING' | 'RETURNING' | 'RESTING';
  targetItem: ResourceType | null;
  targetAmount: number;
  progress: number;
  lastTask: ResourceType | null; 
  isWorking: boolean; 
  level: number;
  exp: number;
  maxExp: number;
  sp: number;
  vitality: number; // Mempengaruhi regenerasi HP
  strength: number; // Mempengaruhi kecepatan panen
  storageCapacity: number; // Berapa banyak yang bisa dibawa per siklus
  inventory: number; // Jumlah yang sedang dibawa
}

export interface GameCanvasHandle {
  orderFarm: (item: ResourceType, amount: number, targetName?: string | null) => boolean;
  forceOrder: (villagerId: number, task: ResourceType | 'REST') => void;
  stopWork: (villagerId: number) => void;
  upgradeStat: (villagerId: number, statName: string) => void;
  getVillagers: () => Villager[];
}

interface Props {
  onGainResource: (item: ResourceType, amount: number) => void;
  onUpdateVillagers: (villagers: Villager[]) => void;
}

const GameCanvas = forwardRef<GameCanvasHandle, Props>(({ onGainResource, onUpdateVillagers }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Inisialisasi 5 Penduduk dengan Profil Berbeda
  const villagers = useRef<Villager[]>([
    { id: 1, name: 'Budi', emoji: '🧑‍🌾', x: 50, y: 50, hp: 100, maxHp: 100, state: 'IDLE', targetItem: null, targetAmount: 0, progress: 0, lastTask: null, isWorking: false, level: 1, exp: 0, maxExp: 100, sp: 0, vitality: 1, strength: 1, storageCapacity: 10, inventory: 0 },
    { id: 2, name: 'Siti', emoji: '👩‍🌾', x: 50, y: 80, hp: 80, maxHp: 80, state: 'IDLE', targetItem: null, targetAmount: 0, progress: 0, lastTask: null, isWorking: false, level: 1, exp: 0, maxExp: 100, sp: 0, vitality: 1, strength: 1, storageCapacity: 10, inventory: 0 },
    { id: 3, name: 'Agus', emoji: '👨‍🌾', x: 50, y: 110, hp: 120, maxHp: 120, state: 'IDLE', targetItem: null, targetAmount: 0, progress: 0, lastTask: null, isWorking: false, level: 1, exp: 0, maxExp: 100, sp: 0, vitality: 1, strength: 1, storageCapacity: 10, inventory: 0 },
    { id: 4, name: 'Dewi', emoji: '👩‍🌾', x: 50, y: 140, hp: 90, maxHp: 90, state: 'IDLE', targetItem: null, targetAmount: 0, progress: 0, lastTask: null, isWorking: false, level: 1, exp: 0, maxExp: 100, sp: 0, vitality: 1, strength: 1, storageCapacity: 10, inventory: 0 },
    { id: 5, name: 'Joko', emoji: '👨‍🌾', x: 50, y: 170, hp: 150, maxHp: 150, state: 'IDLE', targetItem: null, targetAmount: 0, progress: 0, lastTask: null, isWorking: false, level: 1, exp: 0, maxExp: 100, sp: 0, vitality: 1, strength: 1, storageCapacity: 10, inventory: 0 },
  ]);

  // Ekspos fungsi ke parent
  useImperativeHandle(ref, () => ({
    orderFarm: (item, amount, targetName = null) => {
      console.log(`[Canvas] Menerima perintah AI: ${item} (Amount: ${amount}, Target: ${targetName || 'Siapa saja'})`);
      
      let candidate: Villager | undefined;

      if (targetName) {
        candidate = villagers.current.find(v => 
          v.name.toLowerCase() === targetName.toLowerCase() && 
          v.state === 'IDLE' && v.hp > 15
        );
      } else {
        candidate = villagers.current.find(v => v.state === 'IDLE' && v.hp > 30);
      }

      if (candidate) {
        candidate.targetItem = item;
        candidate.targetAmount = amount;
        candidate.lastTask = item;
        candidate.isWorking = true; // Aktifkan mode looping
        candidate.state = 'MOVING';
        return true;
      }
      return false;
    },
    forceOrder: (villagerId, task) => {
      const v = villagers.current.find(v => v.id === villagerId);
      if (!v) return;

      console.log(`[Canvas] Manual Order for ${v.name}: ${task}`);
      if (task === 'REST') {
        v.state = 'RESTING';
        v.lastTask = null;
        v.isWorking = false;
      } else {
        v.targetItem = task as ResourceType;
        v.targetAmount = Math.floor(Math.random() * 20) + 30;
        v.lastTask = task as ResourceType;
        v.isWorking = true;
        v.state = 'MOVING';
      }
      v.progress = 0;
    },
    stopWork: (villagerId) => {
      const v = villagers.current.find(v => v.id === villagerId);
      if (v) {
        console.log(`[Canvas] Stopping work for ${v.name}`);
        v.isWorking = false;
      }
    },
    upgradeStat: (villagerId, statName) => {
      const v = villagers.current.find(v => v.id === villagerId);
      if (!v || v.sp <= 0) return;

      if (statName === 'hp') {
        v.maxHp += 20;
        v.hp = v.maxHp;
        v.sp -= 1;
      } else if (statName === 'vitality') {
        v.vitality += 0.5;
        v.sp -= 1;
      } else if (statName === 'strength') {
        v.strength += 0.2;
        v.sp -= 1;
      } else if (statName === 'storage') {
        v.storageCapacity += 5;
        v.sp -= 1;
      }
      onUpdateVillagers([...villagers.current]);
    },
    getVillagers: () => villagers.current,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastUpdate = -1000; // Pastikan update pertama langsung terkirim

    const render = (time: number) => {
      // Pembatasan update state agar tidak terlalu cepat
      const shouldNotify = time - lastUpdate > 500;
      if (shouldNotify) {
        onUpdateVillagers([...villagers.current]);
        lastUpdate = time;
      }

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f172a'; // Deep slate background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gambar Bangunan
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      Object.entries(LOCATIONS).forEach(([key, loc]) => {
        ctx.fillText(loc.icon, loc.x, loc.y);
      });

      // Update & Gambar tiap Villager
      villagers.current.forEach(v => {
        // --- LOGIKA STATE MACHINE ---
        
        // 1. Cek Kelelahan (Auto Rest)
        if (v.hp < 15 && v.state !== 'RESTING' && v.state !== 'IDLE') {
          v.state = 'RESTING';
          v.progress = 0;
        }

        if (v.state === 'MOVING') {
          const dest = v.targetItem === 'kayu' ? LOCATIONS.WOOD : 
                       v.targetItem === 'buah' ? LOCATIONS.FRUIT : LOCATIONS.STONE;
          moveTowards(v, dest, () => {
            v.state = 'HARVESTING';
            v.progress = 0;
          });
        } 
        // 4. Progress Panen
        if (v.state === 'HARVESTING') {
          v.progress += 0.002 * (0.5 + v.strength * 0.5); // Dipengaruhi strength
          v.hp -= 0.03 / v.vitality; // VIT mengurangi haus darah/lelah
          if (v.progress >= 1) {
            v.inventory = v.storageCapacity; // Ambil barang sesuai kapasitas
            v.state = 'RETURNING';
          }
        } 
        else if (v.state === 'RETURNING') {
          moveTowards(v, LOCATIONS.STORAGE, () => {
            if (v.targetItem) {
              onGainResource(v.targetItem, v.inventory);
              
              // Tambah EXP saat berhasil stor
              v.exp += 25;
              if (v.exp >= v.maxExp) {
                v.level += 1;
                v.exp = 0;
                v.maxExp = Math.floor(v.maxExp * 1.25);
                v.sp += 3; // Beri 3 SP tiap level
                console.log(`${v.name} LEVEL UP TO ${v.level}!`);
              }
            }
            v.inventory = 0;
            
            // Logika Looping: Jika masih harus bekerja, kembali MOVING
            if (v.isWorking && v.lastTask) {
              v.targetItem = v.lastTask;
              v.state = 'MOVING';
            } else {
              v.state = 'IDLE';
              v.lastTask = null;
            }
          });
        } 
        else if (v.state === 'RESTING') {
          moveTowards(v, LOCATIONS.HOME, () => {
            v.hp += 0.25 * v.vitality; // VIT mempercepat pemulihan
            if (v.hp >= v.maxHp) {
              v.hp = v.maxHp;
              // Jika masih dalam status bekerja, kembali ke lokasi
              if (v.isWorking && v.lastTask) {
                v.targetItem = v.lastTask;
                v.state = 'MOVING';
              } else {
                v.state = 'IDLE';
                v.lastTask = null;
              }
            }
          });
        }
        else if (v.state === 'IDLE') {
          // Sedikit pergerakan acak saat idle
          v.x += (Math.random() - 0.5) * 0.5;
          v.y += (Math.random() - 0.5) * 0.5;
        }

        // --- DRAWING VILLAGER ---
        
        // 5. Gambar Status Label (di atas karakter)
        if (v.state !== 'IDLE') {
          ctx.font = 'bold 8px sans-serif';
          ctx.fillStyle = v.state === 'RESTING' ? '#ef4444' : '#10b981';
          const label = v.state === 'MOVING' ? 'MENUJU LOKASI...' : 
                        v.state === 'HARVESTING' ? `PANEN ${v.targetItem?.toUpperCase()}...` : 
                        v.state === 'RETURNING' ? 'PULANG...' : 'ISTIRAHAT...';
          ctx.fillText(label, v.x, v.y - 30);
        }

        // 6. Gambar Karakter
        ctx.font = '24px serif';
        ctx.fillText(v.emoji, v.x, v.y);
        
        // 7. HP Bar (kecil di bawah)
        const barWidth = 24;
        const hpPercent = v.hp / v.maxHp;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(v.x - barWidth/2, v.y + 15, barWidth, 3);
        ctx.fillStyle = hpPercent > 0.4 ? '#10b981' : hpPercent > 0.2 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(v.x - barWidth/2, v.y + 15, barWidth * hpPercent, 3);

        // 8. Progress bar panen (di bawah HP Bar jika sedang panen)
        if (v.state === 'HARVESTING') {
          ctx.fillStyle = '#334155';
          ctx.fillRect(v.x - barWidth/2, v.y + 20, barWidth, 2);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(v.x - barWidth/2, v.y + 20, barWidth * v.progress, 2);
        }

        // Nama
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(v.name, v.x, v.y + 10);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const moveTowards = (entity: any, target: {x: number, y: number}, onReach: () => void) => {
      const speed = 0.6; // Diperlambat agar lebih santai
      const dx = target.x - entity.x;
      const dy = target.y - entity.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 3) {
        onReach();
      } else {
        entity.x += (dx / distance) * speed;
        entity.y += (dy / distance) * speed;
      }
    };

    render(0);
    return () => cancelAnimationFrame(animationFrameId);
  }, [onGainResource, onUpdateVillagers]);

  return (
    <div className="relative border-2 border-slate-800 rounded-3xl overflow-hidden bg-slate-950 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        className="w-full aspect-[5/4] sm:aspect-auto"
      />
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold bg-slate-900/80 px-2 py-1 rounded">Desa Aktif (5 Penduduk)</span>
      </div>
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
