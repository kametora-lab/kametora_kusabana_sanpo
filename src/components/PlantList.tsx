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

export const PlantList: React.FC<PlantListProps> = ({ initialPlants, colors }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

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
        return initialPlants.filter(plant => {
            const matchesSearch = plant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                plant.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesColor = selectedColors.length === 0 ||
                (plant.colors && plant.colors.some(c => selectedColors.includes(c)));

            const selectedMonthValues = selectedMonths.map(normalizeMonth);
            const matchesMonth = selectedMonths.length === 0 ||
                (plant.months && plant.months.some(m => selectedMonthValues.includes(normalizeMonth(m))));

            return matchesSearch && matchesColor && matchesMonth;
        });
    }, [initialPlants, searchQuery, selectedColors, selectedMonths]);

    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="md:w-80 md:shrink-0 md:order-2 sticky top-0 md:top-24 z-30 self-start">
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

            <div className="flex-1 md:order-1">
                {filteredPlants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlants.map(plant => (
                            <a href={`/kametora_kusabana_sanpo/plants/${plant.slug}`} key={plant.id} className="group block glass-panel overflow-hidden hover:border-neon-cyan/50 hover:bg-white/5 transition-all duration-300">
                                <div className="aspect-square bg-black/50 relative overflow-hidden">
                                    {plant.images && plant.images.length > 0 ? (
                                        <img
                                            src={getImageSrc(plant.images)}
                                            alt={plant.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs">NO IMG</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                </div>
                                <div className="p-4 relative -mt-12">
                                    <h3 className="font-display text-xl text-white mb-1 group-hover:text-neon-cyan transition-colors truncate">{plant.title}</h3>
                                    <div className="flex gap-2 mb-2">
                                        {plant.colors?.slice(0, 3).map(cid => {
                                            const c = colors.find(col => col.id === cid);
                                            return c ? (
                                                <span key={cid} className="w-2 h-2 rounded-full" style={{ backgroundColor: c.value, boxShadow: `0 0 5px ${c.value}` }}></span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center text-gray-500 font-mono border-2 border-dashed border-white/10 rounded-xl">
                        NO DATA MATCHED
                    </div>
                )}
            </div>
        </div>
    );
};
