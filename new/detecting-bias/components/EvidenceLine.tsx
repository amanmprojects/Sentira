interface EvidenceLineProps {
    label: string;
    value: string;
}

export function EvidenceLine({ label, value }: EvidenceLineProps) {
    return (
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic">{value}</span>
        </div>
    );
}
