import { Search } from "lucide-react";

interface SearchHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSearch: () => void;
    onKeyPress: (e: React.KeyboardEvent) => void;
}

export function SearchHeader({
    searchQuery,
    onSearchChange,
    onSearch,
    onKeyPress,
}: SearchHeaderProps) {
    return (
        <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={onKeyPress}
                placeholder="Search across social media platforms..."
                className="w-full px-16 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan/50 focus:bg-white/[0.08] transition-all font-medium text-base"
            />
            <button
                onClick={onSearch}
                disabled={!searchQuery.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-aurora-cyan text-black font-black text-xs uppercase tracking-widest hover:bg-aurora-cyan/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Search
            </button>
        </div>
    );
}
