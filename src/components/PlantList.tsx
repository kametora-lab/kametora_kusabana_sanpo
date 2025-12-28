import React, { useState, useMemo } from 'react';
import { resolveImageUrl } from '../utils/paths';

interface Plant {
    id: string;
    slug: string;
    title: string;
    description: string;
    images: string[];
    colors?: string[];
    months?: string[];
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

const ALL_MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export const PlantList: React.FC<PlantListProps> = ({ initialPlants, colors }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

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
            // Text Search
            const matchesSearch = plant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                plant.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Color Filter (OR logic within colors - shows if ANY selected color matches)
            // If no color selected, show all.
            const matchesColor = selectedColors.length === 0 ||
                (plant.colors && plant.colors.some(c => selectedColors.includes(c)));

            // Month Filter (OR logic within months)
            const matchesMonth = selectedMonths.length === 0 ||
                (plant.months && plant.months.some(m => selectedMonths.includes(m)));

            return matchesSearch && matchesColor && matchesMonth;
        });
    }, [initialPlants, searchQuery, selectedColors, selectedMonths]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full md:w-64 space-y-8 flex-shrink-0">

                {/* Search */}
                <div className="space-y-2">
                    <label className="text-neon-cyan font-display text-sm uppercase tracking-wider">Search</label>
                    <input
                        type="text"
                        placeholder="Search plants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-neon-pink focus:outline-none focus:shadow-[0_0_10px_rgba(255,45,149,0.3)] transition-all"
                    />
                </div>

                {/* Color Filter */}
                <div className="space-y-2">
                    <label className="text-neon-cyan font-display text-sm uppercase tracking-wider">Colors</label>
                    <div className="flex flex-wrap gap-2">
                        {colors.map(color => (
                            <button
                                key={color.id}
                                onClick={() => toggleColor(color.id)}
                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${selectedColors.includes(color.id)
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

                {/* Month Filter */}
                <div className="space-y-2">
                    <label className="text-neon-cyan font-display text-sm uppercase tracking-wider">Months</label>
                    <div className="grid grid-cols-4 gap-2">
                        {ALL_MONTHS.map(month => (
                            <button
                                key={month}
                                onClick={() => toggleMonth(month)}
                                className={`text-xs py-1 rounded border transition-all ${selectedMonths.includes(month)
                                    ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                    : 'border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/30'
                                    }`}
                            >
                                {month.replace('月', '')}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-1">
                <div className="mb-4 flex justify-between items-end border-b border-white/10 pb-2">
                    <h2 className="text-2xl font-display font-bold text-white">Database Listings</h2>
                    <span className="text-neon-pink font-mono">{filteredPlants.length} results</span>
                </div>

                {filteredPlants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlants.map(plant => (
                            <a href={`/amamikusabana_2/plants/${plant.slug}`} key={plant.id} className="group block glass-panel overflow-hidden hover:border-neon-cyan/50 hover:bg-white/5 transition-all duration-300">
                                <div className="aspect-square bg-black/50 relative overflow-hidden">
                                    {plant.images && plant.images.length > 0 ? (
                                        <img
                                            src={resolveImageUrl(plant.images[0])}
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
