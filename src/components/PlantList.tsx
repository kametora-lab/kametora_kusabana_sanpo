import React, { useEffect, useMemo, useState } from 'react';
import { PlantFilters } from './PlantFilters';

interface Plant {
    id: string;
    slug: string;
    title: string;
    description: string;
    images: Array<string | PlantImage>;
    colors?: string[];
    months?: string[];
}

interface PlantImage {
    src: string;
    memo?: string;
    alt?: string;
}

interface Color {
    id: string;
    name: string;
    value: string;
}

interface PlantListProps {
    initialPlants: Plant[];
    colors: Color[];
}

const getImageSrc = (images?: Array<string | PlantImage>) => {
    if (!images || images.length === 0) return '';
    const first = images[0];
    return typeof first === 'string' ? first : first.src;
};

const getImageAlt = (images: Array<string | PlantImage> | undefined, fallback: string) => {
    if (!images || images.length === 0) return fallback;
    const first = images[0];
    if (typeof first === 'string') return fallback;
    return first.alt?.trim() || fallback;
};

const toKatakana = (str: string) => {
    return str.replace(/[\u3041-\u3096]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
};

export const PlantList: React.FC<PlantListProps> = ({ initialPlants, colors }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const toMonthLabel = (month: string) => (month.includes('月') ? month : `${month}月`);
    const normalizeMonth = (month: string) => month.replace('月', '').trim();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') ?? '';
        const colorsParam = params.get('colors');
        const monthsParam = params.get('months');

        if (query) setSearchQuery(query);
        if (colorsParam) setSelectedColors(colorsParam.split(',').filter(Boolean));
        if (monthsParam) {
            const nextMonths = monthsParam
                .split(',')
                .map(value => value.trim())
                .filter(Boolean)
                .map(toMonthLabel);
            setSelectedMonths(nextMonths);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams();
        const query = searchQuery.trim();
        if (query) params.set('q', query);
        if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
        if (selectedMonths.length > 0) params.set('months', selectedMonths.join(','));

        const base = '/kametora_kusabana_sanpo/plants';
        const url = params.toString() ? `${base}?${params.toString()}` : base;
        window.history.replaceState(null, '', url);
    }, [searchQuery, selectedColors, selectedMonths]);

    const toggleColor = (colorId: string) => {
        setSelectedColors(prev =>
            prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
        );
    };

    const toggleMonth = (month: string) => {
        setSelectedMonths(prev =>
            prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
        );
    };

    const filteredPlants = useMemo(() => {
        const query = toKatakana(searchQuery.toLowerCase().trim());
        return initialPlants.filter(plant => {
            const title = toKatakana(plant.title.toLowerCase());
            const description = toKatakana((plant.description || '').toLowerCase());

            const matchesSearch = title.includes(query) || description.includes(query);

            const matchesColor = selectedColors.length === 0 ||
                (plant.colors && plant.colors.some(c => selectedColors.includes(c)));

            const selectedMonthValues = selectedMonths.map(normalizeMonth);
            const matchesMonth = selectedMonths.length === 0 ||
                (plant.months && plant.months.some(m => selectedMonthValues.includes(normalizeMonth(m))));

            return matchesSearch && matchesColor && matchesMonth;
        });
    }, [initialPlants, searchQuery, selectedColors, selectedMonths]);

    const activeFiltersCount = (selectedColors.length > 0 ? 1 : 0) + 
                               (selectedMonths.length > 0 ? 1 : 0) + 
                               (searchQuery.trim() ? 1 : 0);

    return (
        <div className="flex flex-col gap-8 md:flex-row md:items-start w-full">
            {/* PC・タブレット用サイドバー固定フィルター */}
            <div className="hidden md:block md:w-72 md:shrink-0 md:order-2 sticky top-6 md:top-24 z-30 self-start">
                <PlantFilters
                    colors={colors}
                    resultsCount={filteredPlants.length}
                    searchQuery={searchQuery}
                    selectedColors={selectedColors}
                    selectedMonths={selectedMonths}
                    onSearchChange={setSearchQuery}
                    onToggleColor={toggleColor}
                    onToggleMonth={toggleMonth}
                />
            </div>

            {/* スマホ用フローティングフィルターボタン (FAB) */}
            <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="fixed bottom-6 right-6 z-40 md:hidden flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#0f0f0f]/90 text-neutral-200 shadow-xl backdrop-blur-md hover:bg-neutral-800 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
                aria-label="フィルターを開く"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-900 shadow">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* スマホ用フィルターモーダルオーバーレイ */}
            <div
                onClick={(e) => {
                    if (e.target === e.currentTarget) setIsMobileFiltersOpen(false);
                }}
                className={`fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 transition-opacity duration-300 ${
                    isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-2xl transition-transform duration-300 ${
                        isMobileFiltersOpen ? 'translate-y-0' : 'translate-y-8'
                    }`}
                >
                    <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                        <h3 className="font-serif text-lg text-neutral-100 font-medium">絞り込み条件</h3>
                        <button
                            type="button"
                            onClick={() => setIsMobileFiltersOpen(false)}
                            className="text-neutral-500 hover:text-white p-1 focus:outline-none cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-1">
                        <PlantFilters
                            colors={colors}
                            resultsCount={filteredPlants.length}
                            searchQuery={searchQuery}
                            selectedColors={selectedColors}
                            selectedMonths={selectedMonths}
                            onSearchChange={setSearchQuery}
                            onToggleColor={toggleColor}
                            onToggleMonth={toggleMonth}
                            isModal={true}
                            className="border-0 bg-transparent p-0 max-h-none overflow-visible"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="mt-6 w-full py-3 bg-neutral-100 text-neutral-950 font-medium rounded-xl hover:bg-neutral-200 transition active:scale-98 cursor-pointer text-center text-sm"
                    >
                        結果を表示する ({filteredPlants.length}件)
                    </button>
                </div>
            </div>

            <div className="flex-1 md:order-1">
                {filteredPlants.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredPlants.map(plant => (
                            <a
                                href={`/kametora_kusabana_sanpo/plants/${plant.slug}`}
                                key={plant.id}
                                className="group block"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
                                    {plant.images && plant.images.length > 0 ? (
                                        <img
                                            src={getImageSrc(plant.images)}
                                            alt={getImageAlt(plant.images, plant.title)}
                                            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-85"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-600">
                                            NO IMAGE
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 space-y-1">
                                    <h3 className="font-serif text-lg text-neutral-100">{plant.title}</h3>
                                    <p className="text-xs leading-relaxed text-neutral-500 line-clamp-2">
                                        {plant.description || '（説明文が未入力です）'}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center text-sm text-neutral-500">
                        該当する草花が見つかりませんでした。
                    </div>
                )}
            </div>
        </div>
    );
};
