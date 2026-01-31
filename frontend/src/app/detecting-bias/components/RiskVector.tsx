interface RiskVectorProps {
    label: string;
    value: string;
    color: 'rose' | 'cyan' | 'blue' | 'white';
    percent: number;
}

export function RiskVector({ label, value, color, percent }: RiskVectorProps) {
    const textColor = color === 'rose' ? 'text-aurora-rose' : color === 'cyan' ? 'text-aurora-cyan' : color === 'blue' ? 'text-aurora-blue' : 'text-white/60';
    const bgColor = color === 'rose' ? 'bg-aurora-rose/10' : color === 'cyan' ? 'bg-aurora-cyan/10' : color === 'blue' ? 'bg-aurora-blue/10' : 'bg-white/5';

    return (
        <div className={`p-4 rounded-2xl ${bgColor} border border-white/5 space-y-1 group hover:border-white/10 transition-all`}>
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">{label}</p>
            <div className="flex justify-between items-end">
                <p className={`text-xl font-black italic ${textColor}`}>{value}</p>
                <p className="text-[10px] font-bold text-white/40 tabular-nums">{percent}%</p>
            </div>
        </div>
    );
}
