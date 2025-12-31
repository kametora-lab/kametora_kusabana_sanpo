import React, { useEffect, useMemo, useState } from 'react';

interface ImageGalleryProps {
    images: Array<string | PlantImage>;
    title: string;
}

interface PlantImage {
    src: string;
    memo?: string;
}

const normalizeImages = (images: Array<string | PlantImage>) =>
    images
        .map((img) => (typeof img === 'string' ? { src: img, memo: '' } : { ...img, memo: img.memo ?? '' }))
        .filter((img) => img.src?.trim());

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
    const normalizedImages = useMemo(() => normalizeImages(images ?? []), [images]);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeImage = normalizedImages[activeIndex] ?? normalizedImages[0];

    useEffect(() => {
        setActiveIndex(0);
    }, [images]);

    if (!normalizedImages || normalizedImages.length === 0 || !activeImage) {
        return (
            <div className="aspect-square bg-black/50 rounded-2xl overflow-hidden glass-panel border-2 border-white/5 flex flex-col items-center justify-center text-gray-600 font-mono">
                <span className="text-4xl mb-4">NO IMAGE</span>
                <span className="text-xs tracking-widest">DATA NOT FOUND</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image View */}
            <div className="aspect-square bg-black/50 rounded-2xl overflow-hidden glass-panel border-2 border-white/5 relative group">
                <img
                    src={activeImage.src}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-cyan/50 rounded-tl-xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-pink/50 rounded-br-xl pointer-events-none"></div>
            </div>

            {/* Thumbnails */}
            {normalizedImages.length > 1 && (
                <div className="grid grid-cols-2 gap-3 pb-2">
                    {normalizedImages.map((img, index) => (
                        <div key={index} className="space-y-2">
                            <button
                                onClick={() => setActiveIndex(index)}
                                className={`relative aspect-square w-full rounded-lg overflow-hidden border transition-all duration-300 ${activeIndex === index
                                    ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                                    : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                                    }`}
                            >
                                <img src={img.src} alt={`${title} ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                            <div className="text-xs text-gray-300 min-h-[1.5rem]">
                                {img.memo?.trim() ?? ''}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
