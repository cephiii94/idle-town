// Sub-component untuk Badge Resource di Header
export default function ResourceBadge({ emoji, label, value, color }: { emoji: string, label: string, value: number, color: string }) {
  const colors: Record<string, string> = {
    amber: 'from-amber-500/20 to-amber-900/20 border-amber-500/30 text-amber-200',
    rose: 'from-rose-500/20 to-rose-900/20 border-rose-500/30 text-rose-200',
    slate: 'from-slate-500/20 to-slate-900/20 border-slate-500/30 text-slate-200'
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-gradient-to-br ${colors[color]} backdrop-blur-sm shadow-md`}>
      <span className="text-base">{emoji}</span>
      <div className="flex flex-col select-none">
        <span className="text-[7px] font-bold opacity-50 tracking-widest leading-none mb-0.5">{label}</span>
        <span className="text-xs font-mono font-black border-none leading-none">{value}</span>
      </div>
    </div>
  );
}
