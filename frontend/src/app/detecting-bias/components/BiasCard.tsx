import { MapIcon, ChevronRight } from "lucide-react";
import type { BiasCategory } from "../constants/bias-data";

interface BiasCardProps {
    category: BiasCategory;
    onCulturalBiasClick?: () => void;
}

export function BiasCard({ category, onCulturalBiasClick }: BiasCardProps) {
    const isCultural = category.id === 'cultural';

    return (
        <div
            onClick={() => isCultural && onCulturalBiasClick?.()}
            className={`p-8 bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-3xl transition-all group relative overflow-hidden ${isCultural ? 'cursor-pointer hover:border-aurora-cyan/30' : 'cursor-default hover:border-white/20'}`}
        >
            {isCultural && (
                <div className="absolute top-2 right-2 p-2 bg-aurora-cyan/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapIcon size={12} className="text-aurora-cyan" />
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-white/90">{category.label}</h4>
                <div className="flex flex-col items-end gap-1">
                    <div className={`px-3 py-1 rounded text-[10px] font-black uppercase border border-white/5 ${category.strength === 'High' ? 'bg-aurora-blue/20 text-aurora-blue' : 'bg-white/5 text-white/40'}`}>
                        {category.strength} Strength
                    </div>
                    <span className={`text-2xl font-black italic ${category.strength === 'High' ? 'text-aurora-blue' : 'text-white/60'}`}>{category.percent}%</span>
                </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${category.status === 'Detected' ? 'bg-aurora-cyan animate-pulse' : 'bg-white/10'}`}></div>
                <span className={`text-xs font-black uppercase tracking-widest ${category.status === 'Detected' ? 'text-white' : 'text-white/20'}`}>
                    {category.status}
                </span>
            </div>
            <p className="text-sm font-medium text-white/50 leading-relaxed">{category.desc}</p>

            {isCultural && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-aurora-cyan opacity-0 group-hover:opacity-100 transition-all">
                    <span>Visualize Heatmap</span>
                    <ChevronRight size={10} />
                </div>
            )}
        </div>
    );
}
