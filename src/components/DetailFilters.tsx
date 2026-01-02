import React, { useEffect, useRef, useState } from 'react';
import { PlantFilters } from './PlantFilters';

interface Color {
    id: string;
    name: string;
    value: string;
}

interface DetailFiltersProps {
    colors: Color[];
    resultsCount: number;
}

export const DetailFilters: React.FC<DetailFiltersProps> = ({ colors, resultsCount }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const hasInteractedRef = useRef(false);

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

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!hasInteractedRef.current) {
            hasInteractedRef.current = true;
            return;
        }

        const handle = window.setTimeout(() => {
            const params = new URLSearchParams();
            const query = searchQuery.trim();
            if (query) params.set('q', query);
            if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
            if (selectedMonths.length > 0) params.set('months', selectedMonths.join(','));

            const base = '/kametora_kusabana_sanpo/plants';
            const url = params.toString() ? `${base}?${params.toString()}` : base;
            window.location.assign(url);
        }, 400);

        return () => window.clearTimeout(handle);
    }, [searchQuery, selectedColors, selectedMonths]);

    return (
        <PlantFilters
            colors={colors}
            resultsCount={resultsCount}
            searchQuery={searchQuery}
            selectedColors={selectedColors}
            selectedMonths={selectedMonths}
            onSearchChange={setSearchQuery}
            onToggleColor={toggleColor}
            onToggleMonth={toggleMonth}
        />
    );
};
