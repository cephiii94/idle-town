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
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  
  // Simpan data kota dan penduduk awal dalam Ref React sebagai data inisialisasi awal
  const town = useRef<TownData>({
    houseLevel: 1,
    capacity: 3,
    villagerCount: 2
  });

  const villagers = useRef<Villager[]>([
    { id: 1, name: 'Budi', gender: 'Pria', emoji: '🧑‍🌾', x: 40, y: 50, vitality: 100, maxVitality: 100, state: 'IDLE', targetItem: null, targetAmount: 0, progress: 0, gestationProgress: 0, lastTask: null, isWorking: false, isPregnant: false, level: 1, exp: 0, maxExp: 100, sp: 0, endurance: 1.2, strength: 1.2, storageCapacity: 12, inventory: 0 },
    { id: 2, name: 'Siti', gender: 'Wanita', emoji: '👩‍🌾', x: 60, y: 50, vitality: 100, maxVitality: 100, state: 'IDLE', targetItem: null, targetAmount: 0, progress: 0, gestationProgress: 0, lastTask: null, isWorking: false, isPregnant: false, level: 1, exp: 0, maxExp: 100, sp: 0, endurance: 1.0, strength: 1.0, storageCapacity: 10, inventory: 0 },
  ]);

  // Gunakan ref untuk membungkus callback agar tidak memicu re-inisialisasi Phaser game
  const callbacksRef = useRef({ onGainResource, onUpdateVillagers, onUpdateTown });
  useEffect(() => {
    callbacksRef.current = { onGainResource, onUpdateVillagers, onUpdateTown };
  }, [onGainResource, onUpdateVillagers, onUpdateTown]);

  // Ekspos fungsi ke parent melalui useImperativeHandle
  useImperativeHandle(ref, () => ({
    orderFarm: (item, amount, targetName = null) => {
      if (sceneRef.current) {
        return sceneRef.current.orderFarm(item, amount, targetName);
      }
      // Fallback sebelum Phaser siap
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
      if (sceneRef.current) {
        sceneRef.current.forceOrder(villagerId, task);
      } else {
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
      }
    },
    stopWork: (villagerId) => {
      if (sceneRef.current) {
        sceneRef.current.stopWork(villagerId);
      } else {
        const v = villagers.current.find(v => v.id === villagerId);
        if (v) v.isWorking = false;
      }
    },
    upgradeStat: (villagerId, statName) => {
      if (sceneRef.current) {
        sceneRef.current.upgradeStat(villagerId, statName);
      } else {
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
        callbacksRef.current.onUpdateVillagers([...villagers.current]);
      }
    },
    upgradeHouse: () => {
      if (sceneRef.current) {
        return sceneRef.current.upgradeHouse();
      }
      const caps = [0, 3, 4, 6, 7, 8];
      if (town.current.houseLevel < 5) {
        town.current.houseLevel++;
        town.current.capacity = caps[town.current.houseLevel];
        callbacksRef.current.onUpdateTown({ ...town.current });
        return true;
      }
      return false;
    },
    getVillagers: () => {
      if (sceneRef.current) {
        return sceneRef.current.getVillagers();
      }
      return villagers.current;
    },
    getTownData: () => {
      if (sceneRef.current) {
        return sceneRef.current.getTownData();
      }
      return town.current;
    },
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let game: any;

    // Impor Phaser secara dinamis di client-side
    import('phaser').then((Phaser) => {
      class TownScene extends Phaser.Scene {
        private villagersData!: Villager[];
        private townData!: TownData;
        private lastUpdate: number = 0;
        
        // Peta Container Phaser untuk render tiap villager
        private villagerContainers: Map<number, Phaser.GameObjects.Container> = new Map();

        constructor() {
          super('TownScene');
        }

        init(data: { villagers: Villager[]; town: TownData }) {
          this.villagersData = data.villagers;
          this.townData = data.town;
        }

        create() {
          sceneRef.current = this;
          
          // Background Color
          this.cameras.main.setBackgroundColor('#0f172a');

          // Gambar Bangunan/Lokasi menggunakan Text Emojis
          Object.entries(LOCATIONS).forEach(([key, loc]) => {
            this.add.text(loc.x, loc.y, loc.icon, {
              fontSize: '28px',
            }).setOrigin(0.5);

            // Tambahkan label teks kecil di bawah emoji lokasi
            this.add.text(loc.x, loc.y + 24, key, {
              fontSize: '8px',
              fontFamily: '"Inter", sans-serif',
              fontStyle: 'bold',
              color: '#475569'
            }).setOrigin(0.5);
          });

          // Inisialisasi visual penduduk awal
          this.villagersData.forEach((v) => {
            this.createVillagerVisual(v);
          });

          // Lakukan sinkronisasi pertama kali ke UI React
          callbacksRef.current.onUpdateVillagers([...this.villagersData]);
          callbacksRef.current.onUpdateTown({ ...this.townData });
        }

        createVillagerVisual(v: Villager) {
          const container = this.add.container(v.x, v.y);

          // Orb bulat (Karakter)
          const orbRadius = 11;
          const orb = this.add.arc(0, 0, orbRadius);
          orb.setStrokeStyle(1, 0x38bdf8, 0.7);
          orb.setFillStyle(0x38bdf8, 1);

          // Sorotan putih/glossy pada orb
          const highlight = this.add.ellipse(-3, -3, 6, 4, 0xffffff, 0.4);
          highlight.setAngle(-45);

          // Level Badge (Lingkaran kecil & teks level)
          const badgeBg = this.add.circle(10, 10, 5, 0x1e293b);
          badgeBg.setStrokeStyle(1, 0x38bdf8, 1);
          const badgeText = this.add.text(10, 10, v.level.toString(), {
            fontSize: '6px',
            color: '#f8fafc',
            fontFamily: '"Inter", sans-serif',
            fontStyle: 'bold'
          }).setOrigin(0.5);

          // Teks Nama Penduduk
          const nameText = this.add.text(0, 23, v.name.toUpperCase(), {
            fontSize: '8px',
            color: '#64748b',
            fontFamily: '"Inter", sans-serif',
            fontStyle: 'bold'
          }).setOrigin(0.5, 0);

          // Teks Status Aktivitas (di atas kepala)
          const stateText = this.add.text(0, -28, '', {
            fontSize: '7px',
            color: '#38bdf8',
            fontFamily: '"Inter", sans-serif',
            fontStyle: 'bold'
          }).setOrigin(0.5);

          // Vitality Bar Background
          const barWidth = 18;
          const barBg = this.add.graphics();
          barBg.fillStyle(0x1e293b, 0.8);
          barBg.fillRect(-barWidth/2, 17, barWidth, 3);

          // Vitality Bar Fill
          const barFill = this.add.graphics();

          // Progress ring untuk panen
          const progressRing = this.add.graphics();

          // Masukkan ke dalam container
          container.add([orb, highlight, badgeBg, badgeText, nameText, stateText, barBg, barFill, progressRing]);
          
          // Simpan referensi sub-objek untuk dimodifikasi pada game loop update
          container.setData('orb', orb);
          container.setData('badgeBg', badgeBg);
          container.setData('badgeText', badgeText);
          container.setData('stateText', stateText);
          container.setData('barFill', barFill);
          container.setData('progressRing', progressRing);

          this.add.existing(container);
          this.villagerContainers.set(v.id, container);
        }

        update(time: number, delta: number) {
          const now = Date.now();
          const currentVillagerCount = this.villagersData.length;
          const isOverCapacity = currentVillagerCount > this.townData.capacity;

          // Batasi pembaruan React state agar tidak menurunkan performa (setiap 500ms)
          if (time - this.lastUpdate > 500) {
            callbacksRef.current.onUpdateVillagers([...this.villagersData]);
            this.lastUpdate = time;
          }

          this.villagersData.forEach((v) => {
            const container = this.villagerContainers.get(v.id);
            if (!container) return;

            const orb = container.getData('orb') as Phaser.GameObjects.Arc;
            const badgeBg = container.getData('badgeBg') as Phaser.GameObjects.Arc;
            const badgeText = container.getData('badgeText') as Phaser.GameObjects.Text;
            const stateText = container.getData('stateText') as Phaser.GameObjects.Text;
            const barFill = container.getData('barFill') as Phaser.GameObjects.Graphics;
            const progressRing = container.getData('progressRing') as Phaser.GameObjects.Graphics;

            // --- UPDATE DATA LEVEL BADGE ---
            badgeText.setText(v.level.toString());

            // --- CONFIG WARNA BERDASARKAN STATE & VITALITAS ---
            let orbColor = 0x38bdf8; // Biru muda default
            let textColorHex = '#38bdf8';

            if (v.state === 'PREGNANT') {
              orbColor = 0xd946ef; // Fuchsia untuk hamil
              textColorHex = '#d946ef';
            } else if (v.state === 'RESTING' || v.vitality < 20) {
              orbColor = 0xf43f5e; // Merah untuk istirahat/lelah
              textColorHex = '#f43f5e';
            } else if (v.state === 'HARVESTING') {
              orbColor = 0xfbbf24; // Amber untuk panen
              textColorHex = '#fbbf24';
            } else if (v.state === 'RETURNING') {
              orbColor = 0x10b981; // Emerald untuk mengantar resource
              textColorHex = '#10b981';
            }

            orb.setFillStyle(orbColor, 1);
            orb.setStrokeStyle(1, orbColor, 0.7);
            badgeBg.setStrokeStyle(1, orbColor, 1);

            // --- UPDATE TEXT STATUS DI ATAS KEPALA ---
            if (v.state !== 'IDLE') {
              const label = v.state === 'MOVING' ? 'MENUJU LOKASI' : 
                            v.state === 'HARVESTING' ? `PANEN ${v.targetItem?.toUpperCase()}` : 
                            v.state === 'RETURNING' ? 'PULANG' : 
                            v.state === 'PREGNANT' ? `HAMIL (${Math.floor(v.gestationProgress * 100)}%)` : 'ISTIRAHAT';
              stateText.setText(label).setColor(textColorHex).setVisible(true);
            } else {
              stateText.setVisible(false);
            }

            // --- STATE MACHINE LOGIC ---
            
            // Cek Kelelahan (Auto Rest)
            if (v.vitality < 10 && v.state !== 'RESTING' && v.state !== 'PREGNANT' && v.state !== 'IDLE') {
              v.state = 'RESTING';
              v.progress = 0;
            }

            if (v.state === 'MOVING') {
              const dest = v.targetItem === 'kayu' ? LOCATIONS.WOOD : 
                           v.targetItem === 'buah' ? LOCATIONS.FRUIT : LOCATIONS.STONE;
              this.moveTowards(v, container, dest, () => {
                v.state = 'HARVESTING';
                v.progress = 0;
              }, delta);
            } 
            else if (v.state === 'HARVESTING') {
              // Menghitung progress secara independen terhadap delta time frame
              const harvestSpeed = 0.00012 * delta * (0.5 + v.strength * 0.5);
              v.progress += harvestSpeed;
              v.vitality -= (0.0024 * delta) / v.endurance;

              if (v.progress >= 1) {
                v.inventory = v.storageCapacity;
                v.state = 'RETURNING';
              }
            } 
            else if (v.state === 'RETURNING') {
              this.moveTowards(v, container, LOCATIONS.STORAGE, () => {
                if (v.targetItem) {
                  callbacksRef.current.onGainResource(v.targetItem, v.inventory);
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
              }, delta);
            } 
            else if (v.state === 'RESTING') {
              this.moveTowards(v, container, LOCATIONS.HOME, () => {
                const regenMultiplier = isOverCapacity ? 0.3 : 1;
                v.vitality += 0.015 * delta * v.endurance * regenMultiplier;

                if (v.vitality >= v.maxVitality) {
                  v.vitality = v.maxVitality;
                  if (v.isWorking && v.lastTask) {
                    v.targetItem = v.lastTask;
                    v.state = 'MOVING';
                  } else {
                    v.state = 'IDLE';
                  }
                }

                // Logika Reproduksi
                if (v.gender === 'Wanita' && !v.isPregnant && currentVillagerCount < this.townData.capacity) {
                  const partner = this.villagersData.find(other => 
                    other.gender === 'Pria' && 
                    other.state === 'RESTING' && 
                    Math.abs(other.x - v.x) < 20 &&
                    other.vitality > 80
                  );

                  if (partner && Math.random() < 0.00006 * delta) {
                    v.isPregnant = true;
                    v.state = 'PREGNANT';
                    v.gestationProgress = 0;
                    console.log(`${v.name} mulai mengandung!`);
                  }
                }
              }, delta);
            }
            else if (v.state === 'PREGNANT') {
              this.moveTowards(v, container, LOCATIONS.HOME, () => {
                v.gestationProgress += delta / 30000; // 30 Detik

                if (v.gestationProgress >= 1) {
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

                  this.villagersData.push(newVillager);
                  this.townData.villagerCount = this.villagersData.length;
                  
                  // Daftarkan visual penduduk baru ke Phaser
                  this.createVillagerVisual(newVillager);

                  // Update data ke UI React
                  callbacksRef.current.onUpdateTown({ ...this.townData });
                  callbacksRef.current.onUpdateVillagers([...this.villagersData]);

                  v.isPregnant = false;
                  v.state = 'RESTING';
                  v.gestationProgress = 0;
                  console.log(`${v.name} melahirkan ${babyName}!`);
                }
              }, delta);
            }
            else if (v.state === 'IDLE') {
              v.x += (Math.random() - 0.5) * 0.018 * delta;
              v.y += (Math.random() - 0.5) * 0.018 * delta;

              // Batasan pergerakan agar tidak keluar canvas
              v.x = Phaser.Math.Clamp(v.x, 20, 480);
              v.y = Phaser.Math.Clamp(v.y, 20, 380);

              container.x = v.x;
              container.y = v.y;
            }

            // Animasi melayang (bobbing) untuk yang sedang beraktivitas (selain IDLE)
            const isMoving = v.state === 'MOVING' || v.state === 'RETURNING' || v.state === 'RESTING' || v.state === 'PREGNANT';
            const bob = isMoving ? Math.sin(time * 0.008) * 3 : 0;
            container.x = v.x;
            container.y = v.y + bob;

            // --- RENDER VITALITAS BAR ---
            barFill.clear();
            const vitPercent = Math.max(0, Math.min(1, v.vitality / v.maxVitality));
            const barFillColor = vitPercent > 0.4 ? 0x38bdf8 : vitPercent > 0.2 ? 0xfbbf24 : 0xf43f5e;
            
            barFill.fillStyle(barFillColor, 1);
            const barWidth = 18;
            barFill.fillRect(-barWidth/2, 17, barWidth * vitPercent, 3);

            // --- RENDER PROGRESS RING (PANEN) ---
            progressRing.clear();
            if (v.state === 'HARVESTING') {
              progressRing.lineStyle(2, 0xfbbf24, 1);
              progressRing.beginPath();
              const startAngle = -Math.PI / 2;
              const endAngle = startAngle + (Math.PI * 2 * Math.max(0, Math.min(1, v.progress)));
              progressRing.arc(0, bob, 15, startAngle, endAngle, false);
              progressRing.strokePath();
            }
          });
        }

        // Fungsi pembantu perpindahan koordinat
        moveTowards(entity: any, container: Phaser.GameObjects.Container, target: { x: number; y: number }, onReach: () => void, delta: number) {
          const speed = 0.036 * delta;
          const dx = target.x - entity.x;
          const dy = target.y - entity.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 3) {
            onReach();
          } else {
            entity.x += (dx / distance) * speed;
            entity.y += (dy / distance) * speed;
            container.x = entity.x;
            container.y = entity.y;
          }
        }

        // --- GAME CONTROLLER INTERFACES ---

        orderFarm(item: ResourceType, amount: number, targetName: string | null = null): boolean {
          let candidate: Villager | undefined;
          if (targetName) {
            candidate = this.villagersData.find(v => v.name.toLowerCase() === targetName.toLowerCase() && v.state === 'IDLE' && v.vitality > 15);
          } else {
            candidate = this.villagersData.find(v => v.state === 'IDLE' && v.vitality > 30);
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
        }

        forceOrder(villagerId: number, task: ResourceType | 'REST') {
          const v = this.villagersData.find(v => v.id === villagerId);
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
        }

        stopWork(villagerId: number) {
          const v = this.villagersData.find(v => v.id === villagerId);
          if (v) v.isWorking = false;
        }

        upgradeStat(villagerId: number, statName: string) {
          const v = this.villagersData.find(v => v.id === villagerId);
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
          callbacksRef.current.onUpdateVillagers([...this.villagersData]);
        }

        upgradeHouse(): boolean {
          const caps = [0, 3, 4, 6, 7, 8];
          if (this.townData.houseLevel < 5) {
            this.townData.houseLevel++;
            this.townData.capacity = caps[this.townData.houseLevel];
            callbacksRef.current.onUpdateTown({ ...this.townData });
            return true;
          }
          return false;
        }

        getVillagers(): Villager[] {
          return this.villagersData;
        }

        getTownData(): TownData {
          return this.townData;
        }
      }

      // Konfigurasi game Phaser
      const config = {
        type: Phaser.AUTO,
        width: 500,
        height: 400,
        parent: containerRef.current || 'phaser-container',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scene: [TownScene],
      };

      game = new Phaser.Game(config);
      
      // Kirim initial data ke scene saat inisiasi
      game.scene.start('TownScene', {
        villagers: villagers.current,
        town: town.current,
      });
    });

    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, []);

  return (
    <div className="relative border-2 border-slate-800 rounded-3xl overflow-hidden bg-slate-950 shadow-2xl">
      {/* Container untuk Phaser game canvas */}
      <div
        ref={containerRef}
        id="phaser-container"
        className="w-full aspect-[5/4] sm:aspect-auto flex justify-center items-center"
        style={{ minHeight: '400px' }}
      />
      <div className="absolute top-4 left-4 flex flex-col gap-1 z-30">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold bg-slate-900/80 px-2 py-1 rounded">Desa Aktif (Phaser v3.80)</span>
      </div>
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
