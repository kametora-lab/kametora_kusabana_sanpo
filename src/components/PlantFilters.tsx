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
    title = '絞り込み',
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
        <div className="border border-white/10 bg-[#0f0f0f] p-4 md:p-6 md:max-h-[calc(100vh-7rem)] md:overflow-auto">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
                <h2 className="font-serif text-lg text-neutral-100 md:text-xl">{title}</h2>
                <div className="flex items-center gap-3">
                    {typeof resultsCount === 'number' && (
                        <span className="text-[11px] text-neutral-500 md:text-xs">{resultsCount}件</span>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsFiltersOpen(prev => !prev)}
                        className="md:hidden inline-flex items-center gap-2 text-[10px] text-neutral-400"
                        aria-label="Toggle filters"
                        aria-expanded={isFiltersOpen}
                    >
                        <span className="flex flex-col gap-1">
                            <span className="h-[2px] w-3.5 bg-neutral-500"></span>
                            <span className="h-[2px] w-3.5 bg-neutral-500"></span>
                            <span className="h-[2px] w-3.5 bg-neutral-500"></span>
                        </span>
                        フィルター
                    </button>
                </div>
            </div>
            <div className={`grid grid-cols-1 gap-5 ${isFiltersOpen ? 'grid' : 'hidden'} md:grid`}>
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-neutral-500">検索</label>
                    <input
                        type="text"
                        lang="ja"
                        inputMode="kana"
                        autoCapitalize="none"
                        autoComplete="off"
                        placeholder="カタカナで入力"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full border border-white/10 bg-transparent px-3 py-2 text-sm text-neutral-200 focus:border-white/30 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => setIsColorsOpen(prev => !prev)}
                        className="md:hidden inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-500"
                        aria-expanded={isColorsOpen}
                    >
                        色
                        <span className={`text-neutral-500 transition-transform ${isColorsOpen ? 'rotate-180' : ''}`}>v</span>
                    </button>
                    <label className="hidden text-xs uppercase tracking-[0.3em] text-neutral-500 md:block">色</label>
                    <div className={`${isColorsOpen ? 'grid' : 'hidden'} md:grid grid-cols-3 gap-2`}>
                        {colors.map(color => (
                            <button
                                key={color.id}
                                onClick={() => onToggleColor(color.id)}
                                className={`w-fit rounded-full border px-3 py-1 text-xs transition ${selectedColors.includes(color.id)
                                    ? 'border-white/40 text-neutral-100 bg-white/5'
                                    : 'border-white/10 text-neutral-500 hover:border-white/30'
                                    }`}
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
                        className="md:hidden inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-500"
                        aria-expanded={isMonthsOpen}
                    >
                        観察月
                        <span className={`text-neutral-500 transition-transform ${isMonthsOpen ? 'rotate-180' : ''}`}>v</span>
                    </button>
                    <label className="hidden text-xs uppercase tracking-[0.3em] text-neutral-500 md:block">観察月</label>
                    <div className={`${isMonthsOpen ? 'grid' : 'hidden'} md:grid grid-cols-3 gap-2`}>
                        {ALL_MONTHS.map(month => (
                            <button
                                key={month}
                                onClick={() => onToggleMonth(month)}
                                className={`w-fit rounded border px-3 py-1 text-xs transition ${selectedMonths.includes(month)
                                    ? 'border-white/40 text-neutral-100 bg-white/5'
                                    : 'border-white/10 text-neutral-500 hover:border-white/30'
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
