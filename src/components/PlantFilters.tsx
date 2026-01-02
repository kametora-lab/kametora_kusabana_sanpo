import React, { useState } from 'react';

interface Color {
    id: string;
    name: string;
    value: string;
}

interface PlantFiltersProps {
    colors: Color[];
    resultsCount?: number;
    title?: string;
    searchQuery: string;
    selectedColors: string[];
    selectedMonths: string[];
    onSearchChange: (value: string) => void;
    onToggleColor: (colorId: string) => void;
    onToggleMonth: (month: string) => void;
}

const ALL_MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export const PlantFilters: React.FC<PlantFiltersProps> = ({
    colors,
    resultsCount,
    title = 'Database Listings',
    searchQuery,
    selectedColors,
    selectedMonths,
    onSearchChange,
    onToggleColor,
    onToggleMonth,
}) => {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isColorsOpen, setIsColorsOpen] = useState(false);
    const [isMonthsOpen, setIsMonthsOpen] = useState(false);

    return (
        <div className="glass-panel border border-white/10 p-3 md:p-6 z-20 bg-black/80 backdrop-blur md:max-h-[calc(100vh-7rem)] md:overflow-auto">
            <div className="mb-3 md:mb-4 flex flex-wrap justify-between items-end gap-3 border-b border-white/10 pb-2 md:pb-3 sticky top-0 z-30 -mx-3 px-3 md:mx-0 md:px-0 bg-black/80 backdrop-blur">
                <h2 className="text-xl md:text-2xl font-display font-bold text-white">{title}</h2>
                <div className="flex items-center gap-3">
                    {typeof resultsCount === 'number' && (
                        <span className="text-neon-pink font-mono text-[11px] md:text-xs">{resultsCount} results</span>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsFiltersOpen(prev => !prev)}
                        className="md:hidden inline-flex items-center gap-2 px-2 py-0.5 border border-white/20 rounded-full text-[10px] font-bold text-white hover:border-white/40 transition-colors"
                        aria-label="Toggle filters"
                        aria-expanded={isFiltersOpen}
                    >
                        <span className="flex flex-col gap-1">
                            <span className="w-3.5 h-[2px] bg-white"></span>
                            <span className="w-3.5 h-[2px] bg-white"></span>
                            <span className="w-3.5 h-[2px] bg-white"></span>
                        </span>
                        Filters
                    </button>
                </div>
            </div>
            <div className={`grid grid-cols-1 gap-4 md:gap-6 ${isFiltersOpen ? 'grid' : 'hidden'} md:grid`}>
                <div className="space-y-2">
                    <label className="text-neon-cyan font-display text-sm uppercase tracking-wider">検索（カタカナ）</label>
                    <input
                        type="text"
                        lang="ja"
                        inputMode="kana"
                        autoCapitalize="none"
                        autoComplete="off"
                        placeholder="カタカナで入力"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-neon-pink focus:outline-none focus:shadow-[0_0_10px_rgba(255,45,149,0.3)] transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => setIsColorsOpen(prev => !prev)}
                        className="md:hidden inline-flex items-center gap-2 text-neon-cyan font-display text-sm uppercase tracking-wider"
                        aria-expanded={isColorsOpen}
                    >
                        Colors
                        <span className={`text-white/70 transition-transform ${isColorsOpen ? 'rotate-180' : ''}`}>?</span>
                    </button>
                    <label className="hidden md:block text-neon-cyan font-display text-sm uppercase tracking-wider">Colors</label>
                    <div className={`${isColorsOpen ? 'grid' : 'hidden'} md:grid grid-cols-3 gap-[0.17rem] justify-items-start`}>
                        {colors.map(color => (
                            <button
                                key={color.id}
                                onClick={() => onToggleColor(color.id)}
                                className={`w-fit px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${selectedColors.includes(color.id)
                                    ? 'border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                                    : 'border-white/10 text-gray-400 hover:border-white/30'
                                    }`}
                                style={{
                                    backgroundColor: selectedColors.includes(color.id) ? color.value : 'transparent',
                                    color: selectedColors.includes(color.id) && ['white', 'yellow'].includes(color.id) ? 'black' : undefined
                                }}
                            >
                                {color.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => setIsMonthsOpen(prev => !prev)}
                        className="md:hidden inline-flex items-center gap-2 text-neon-cyan font-display text-sm uppercase tracking-wider"
                        aria-expanded={isMonthsOpen}
                    >
                        Months
                        <span className={`text-white/70 transition-transform ${isMonthsOpen ? 'rotate-180' : ''}`}>?</span>
                    </button>
                    <label className="hidden md:block text-neon-cyan font-display text-sm uppercase tracking-wider">Months</label>
                    <div className={`${isMonthsOpen ? 'grid' : 'hidden'} md:grid grid-cols-3 gap-[0.17rem] justify-items-start`}>
                        {ALL_MONTHS.map(month => (
                            <button
                                key={month}
                                onClick={() => onToggleMonth(month)}
                                className={`w-fit px-3 text-xs md:text-sm py-2 rounded border transition-all ${selectedMonths.includes(month)
                                    ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                    : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/30'
                                    }`}
                            >
                                {month}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
