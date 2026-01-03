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
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="md:w-72 md:shrink-0 md:order-2 sticky top-6 md:top-24 z-30 self-start">
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
                                            alt={plant.title}
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
