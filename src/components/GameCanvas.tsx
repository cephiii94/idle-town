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
  gender: 'Pria' | 'Wanita';
  x: number;
  y: number;
  vitality: number;
  maxVitality: number;
  state: 'IDLE' | 'MOVING' | 'HARVESTING' | 'RETURNING' | 'RESTING' | 'PREGNANT';
  targetItem: ResourceType | null;
  targetAmount: number;
  progress: number;
  gestationProgress: number;
  lastTask: ResourceType | null; 
  isWorking: boolean; 
  isPregnant: boolean;
  level: number;
  exp: number;
  maxExp: number;
  sp: number;
  endurance: number; // Mempengaruhi regenerasi Vitalitas
  strength: number; // Mempengaruhi kecepatan panen
  storageCapacity: number; // Berapa banyak yang bisa dibawa per siklus
  inventory: number; // Jumlah yang sedang dibawa
}

export interface TownData {
  houseLevel: number;
  capacity: number;
  villagerCount: number;
}

export interface GameCanvasHandle {
  orderFarm: (item: ResourceType, amount: number, targetName?: string | null) => boolean;
  forceOrder: (villagerId: number, task: ResourceType | 'REST') => void;
  stopWork: (villagerId: number) => void;
  upgradeStat: (villagerId: number, statName: string) => void;
  upgradeHouse: () => boolean;
  getVillagers: () => Villager[];
  getTownData: () => TownData;
}

interface Props {
  onGainResource: (item: ResourceType, amount: number) => void;
  onUpdateVillagers: (villagers: Villager[]) => void;
  onUpdateTown: (town: TownData) => void;
}

const GameCanvas = forwardRef<GameCanvasHandle, Props>(({ onGainResource, onUpdateVillagers, onUpdateTown }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Inisialisasi Kota
  const town = useRef<TownData>({
    houseLevel: 1,
    capacity: 3,
    villagerCount: 2
  });

  // Reset Penduduk Awal (1 Pria, 1 Wanita)
  const villagers = useRef<Villager[]>([
    { id: 1, name: 'Budi', gender: 'Pria', emoji: '🧑‍🌾', x: 40, y: 50, vitality: 100, maxVitality: 100, state: 'IDLE', targetItem: null, targetAmount: 0, progress: 0, gestationProgress: 0, lastTask: null, isWorking: false, isPregnant: false, level: 1, exp: 0, maxExp: 100, sp: 0, endurance: 1.2, strength: 1.2, storageCapacity: 12, inventory: 0 },
    { id: 2, name: 'Siti', gender: 'Wanita', emoji: '👩‍🌾', x: 60, y: 50, vitality: 100, maxVitality: 100, state: 'IDLE', targetItem: null, targetAmount: 0, progress: 0, gestationProgress: 0, lastTask: null, isWorking: false, isPregnant: false, level: 1, exp: 0, maxExp: 100, sp: 0, endurance: 1.0, strength: 1.0, storageCapacity: 10, inventory: 0 },
  ]);

  // Ekspos fungsi ke parent
  useImperativeHandle(ref, () => ({
    orderFarm: (item, amount, targetName = null) => {
      let candidate: Villager | undefined;
      if (targetName) {
        candidate = villagers.current.find(v => v.name.toLowerCase() === targetName.toLowerCase() && v.state === 'IDLE' && v.vitality > 15);
      } else {
        candidate = villagers.current.find(v => v.state === 'IDLE' && v.vitality > 30);
      }

      if (candidate) {
        candidate.targetItem = item;
        candidate.targetAmount = amount;
        candidate.lastTask = item;
        candidate.isWorking = true;
        candidate.state = 'MOVING';
        return true;
      }
      return false;
    },
    forceOrder: (villagerId, task) => {
      const v = villagers.current.find(v => v.id === villagerId);
      if (!v) return;

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
      if (v) v.isWorking = false;
    },
    upgradeStat: (villagerId, statName) => {
      const v = villagers.current.find(v => v.id === villagerId);
      if (!v || v.sp <= 0) return;

      if (statName === 'hp') {
        v.maxVitality += 20;
        v.vitality = v.maxVitality;
      } else if (statName === 'vitality') {
        v.endurance += 0.5;
      } else if (statName === 'strength') {
        v.strength += 0.2;
      } else if (statName === 'storage') {
        v.storageCapacity += 5;
      }
      v.sp -= 1;
      onUpdateVillagers([...villagers.current]);
    },
    upgradeHouse: () => {
      const caps = [0, 3, 4, 6, 7, 8];
      if (town.current.houseLevel < 5) {
        town.current.houseLevel++;
        town.current.capacity = caps[town.current.houseLevel];
        onUpdateTown({ ...town.current });
        return true;
      }
      return false;
    },
    getVillagers: () => villagers.current,
    getTownData: () => town.current,
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
      const now = Date.now();
      const currentVillagerCount = villagers.current.length;
      const isOverCapacity = currentVillagerCount > town.current.capacity;

      villagers.current.forEach(v => {
        // --- LOGIKA STATE MACHINE ---
        
        // Cek Kelelahan (Auto Rest)
        if (v.vitality < 10 && v.state !== 'RESTING' && v.state !== 'PREGNANT' && v.state !== 'IDLE') {
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
        else if (v.state === 'HARVESTING') {
          v.progress += 0.002 * (0.5 + v.strength * 0.5);
          v.vitality -= 0.04 / v.endurance;
          if (v.progress >= 1) {
            v.inventory = v.storageCapacity;
            v.state = 'RETURNING';
          }
        } 
        else if (v.state === 'RETURNING') {
          moveTowards(v, LOCATIONS.STORAGE, () => {
            if (v.targetItem) {
              onGainResource(v.targetItem, v.inventory);
              v.exp += 25;
              if (v.exp >= v.maxExp) {
                v.level += 1;
                v.exp = 0;
                v.maxExp = Math.floor(v.maxExp * 1.25);
                v.sp += 3;
              }
            }
            v.inventory = 0;
            if (v.isWorking && v.lastTask) {
              v.targetItem = v.lastTask;
              v.state = 'MOVING';
            } else {
              v.state = 'IDLE';
            }
          });
        } 
        else if (v.state === 'RESTING') {
          moveTowards(v, LOCATIONS.HOME, () => {
            // Homeless Penalty: Jika melebihi kapasitas, regenerasi lebih lambat
            const regenMultiplier = isOverCapacity ? 0.3 : 1;
            v.vitality += 0.25 * v.endurance * regenMultiplier;

            if (v.vitality >= v.maxVitality) {
              v.vitality = v.maxVitality;
              if (v.isWorking && v.lastTask) {
                v.targetItem = v.lastTask;
                v.state = 'MOVING';
              } else {
                v.state = 'IDLE';
              }
            }

            // --- LOGIKA REPRODUKSI (CERITA DI RUMAH) ---
            if (v.gender === 'Wanita' && !v.isPregnant && currentVillagerCount < town.current.capacity) {
              // Cek apakah ada Pria yang juga sedang istirahat di rumah
              const partner = villagers.current.find(other => 
                other.gender === 'Pria' && 
                other.state === 'RESTING' && 
                Math.abs(other.x - v.x) < 20 &&
                other.vitality > 80
              );

              if (partner && Math.random() < 0.001) { // Peluang kecil tiap frame
                v.isPregnant = true;
                v.state = 'PREGNANT';
                v.gestationProgress = 0;
                console.log(`${v.name} mulai mengandung!`);
              }
            }
          });
        }
        else if (v.state === 'PREGNANT') {
          moveTowards(v, LOCATIONS.HOME, () => {
            // 30 Detik Gestasi (60fps * 30s = 1800 frames)
            v.gestationProgress += 1 / 1800; 
            
            if (v.gestationProgress >= 1) {
              // MELAHIRKAN
              const namesM = ["Arka", "Kenzo", "Rafa", "Zaki", "Elio"];
              const namesF = ["Kira", "Nala", "Zia", "Lulu", "Feya"];
              const babyGender = Math.random() > 0.5 ? 'Pria' : 'Wanita';
              const babyName = babyGender === 'Pria' ? namesM[Math.floor(Math.random() * namesM.length)] : namesF[Math.floor(Math.random() * namesF.length)];
              
              const newVillager: Villager = {
                id: now + Math.random(),
                name: babyName,
                gender: babyGender,
                emoji: babyGender === 'Pria' ? '👶' : '👧', 
                x: v.x + (Math.random() - 0.5) * 20,
                y: v.y + 20,
                vitality: 100,
                maxVitality: 100,
                state: 'IDLE',
                targetItem: null,
                targetAmount: 0,
                progress: 0,
                gestationProgress: 0,
                lastTask: null,
                isWorking: false,
                isPregnant: false,
                level: 1,
                exp: 0,
                maxExp: 100,
                sp: 0,
                endurance: 1,
                strength: 1,
                storageCapacity: 10,
                inventory: 0
              };

              villagers.current.push(newVillager);
              town.current.villagerCount = villagers.current.length;
              onUpdateTown({ ...town.current });

              v.isPregnant = false;
              v.state = 'RESTING';
              v.gestationProgress = 0;
              console.log(`${v.name} melahirkan ${babyName}!`);
            }
          });
        }
        else if (v.state === 'IDLE') {
          v.x += (Math.random() - 0.5) * 0.3;
          v.y += (Math.random() - 0.5) * 0.3;
        }

        // --- DRAWING VILLAGER (ANIMATED PURE ORB) ---
        
        let labelColor = '#38bdf8';
        if (v.state === 'PREGNANT') labelColor = '#d946ef'; // Magenta untuk hamil
        else if (v.state === 'RESTING' || v.vitality < 20) labelColor = '#f43f5e';

        if (v.state !== 'IDLE') {
          ctx.font = 'bold 8px "Inter", sans-serif';
          ctx.fillStyle = labelColor;
          const label = v.state === 'MOVING' ? 'MENUJU LOKASI' : 
                        v.state === 'HARVESTING' ? `PANEN ${v.targetItem?.toUpperCase()}` : 
                        v.state === 'RETURNING' ? 'PULANG' : 
                        v.state === 'PREGNANT' ? `HAMIL (${Math.floor(v.gestationProgress * 100)}%)` : 'ISTIRAHAT';
          ctx.textAlign = 'center';
          ctx.fillText(label, v.x, v.y - 30);
        }

        // 6. Gambar Karakter Orb
        const orbRadius = 11;
        const vitPercent = v.vitality / v.maxVitality;
        
        const isMoving = v.state === 'MOVING' || v.state === 'RETURNING' || v.state === 'RESTING' || v.state === 'PREGNANT';
        const bob = isMoving ? Math.sin(now * 0.008) * 3 : 0;
        const drawY = v.y + bob;

        let orbColor = '#38bdf8'; 
        let glowColor = 'rgba(56, 189, 248, 0.7)';
        
        if (v.state === 'PREGNANT') {
          orbColor = '#d946ef';
          glowColor = 'rgba(217, 70, 239, 0.7)';
        } else if (v.state === 'RESTING' || v.vitality < 20) {
          orbColor = '#f43f5e';
          glowColor = 'rgba(244, 63, 94, 0.7)';
        } else if (v.state === 'HARVESTING') {
          orbColor = '#fbbf24';
          glowColor = 'rgba(251, 191, 36, 0.7)';
        } else if (v.state === 'RETURNING') {
          orbColor = '#10b981';
          glowColor = 'rgba(16, 185, 129, 0.7)';
        }

        ctx.save();
        ctx.shadowBlur = isMoving ? 15 + Math.sin(now * 0.01) * 5 : 12;
        ctx.shadowColor = glowColor;
        
        const orbGrad = ctx.createRadialGradient(v.x - orbRadius/3, drawY - orbRadius/3, 1, v.x, drawY, orbRadius);
        orbGrad.addColorStop(0, v.state === 'PREGNANT' ? '#fdf4ff' : '#ffffff');
        orbGrad.addColorStop(0.2, orbColor);
        orbGrad.addColorStop(1, '#020617');
        
        ctx.beginPath();
        ctx.arc(v.x, drawY, orbRadius, 0, Math.PI * 2);
        ctx.fillStyle = orbGrad;
        ctx.fill();
        
        ctx.strokeStyle = orbColor + 'aa';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(v.x - orbRadius/2.5, drawY - orbRadius/2.5, orbRadius/3, orbRadius/4, -Math.PI/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        
        ctx.restore();

        // 7. Vitality Bar (Mini & Clean)
        const barWidth = 18;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        roundRect(ctx, v.x - barWidth/2, drawY + 18, barWidth, 2.5, 1);
        ctx.fill();
        
        ctx.fillStyle = vitPercent > 0.4 ? '#38bdf8' : vitPercent > 0.2 ? '#fbbf24' : '#f43f5e';
        roundRect(ctx, v.x - barWidth/2, drawY + 18, barWidth * vitPercent, 2.5, 1);
        ctx.fill();

        // 8. Progress ring (Spinning around orb)
        if (v.state === 'HARVESTING') {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(v.x, drawY, orbRadius + 4, -Math.PI/2, (-Math.PI/2) + (Math.PI * 2 * v.progress));
          ctx.stroke();
        }

        // Level Badge (Floating static beside)
        ctx.beginPath();
        ctx.arc(v.x + 10, drawY + 10, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = orbColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.font = 'bold 6px "Inter", sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(v.level.toString(), v.x + 10, drawY + 10);

        // Nama
        ctx.font = '8px "Inter", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textBaseline = 'top';
        ctx.fillText(v.name.toUpperCase(), v.x, drawY + 23);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    // Helper untuk rounded rectangle (karena canvas asli tidak punya)
    const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
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
