export interface Stage {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  emoji: string;
  accent: string;
  resources: string[];
}

export const stages: Stage[] = [
  {
    id: 'hutan-awal',
    name: 'Hutan Awal',
    subtitle: 'Seimbang',
    description: 'Area pembuka dengan kayu, buah, dan batu yang mudah dijangkau.',
    emoji: '🌲',
    accent: 'from-emerald-400 to-cyan-400',
    resources: ['Kayu', 'Buah', 'Batu'],
  },
  {
    id: 'lembah-buah',
    name: 'Lembah Buah',
    subtitle: 'Subur',
    description: 'Lembah hijau untuk desa yang ingin berkembang lewat stok makanan.',
    emoji: '🍎',
    accent: 'from-rose-400 to-amber-300',
    resources: ['Buah', 'Kayu'],
  },
  {
    id: 'bukit-batu',
    name: 'Bukit Batu',
    subtitle: 'Keras',
    description: 'Medan berbatu untuk pemain yang ingin fokus ke material bangunan.',
    emoji: '⛰️',
    accent: 'from-slate-300 to-blue-400',
    resources: ['Batu', 'Kayu'],
  },
];

export function getStageById(stageId: string | null) {
  return stages.find((stage) => stage.id === stageId) ?? stages[0];
}
