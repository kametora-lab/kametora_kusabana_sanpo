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
            <div className="aspect-[4/5] border border-white/10 bg-[#111] flex flex-col items-center justify-center text-neutral-600">
                <span className="text-2xl mb-3">NO IMAGE</span>
                <span className="text-xs tracking-widest">DATA NOT FOUND</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image View */}
            <div className="aspect-[4/5] overflow-hidden border border-white/10 bg-[#111] relative group">
                <img
                    src={activeImage.src}
                    alt={title}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                />
            </div>
            <div className="text-xs text-neutral-500 min-h-[1.5rem]">
                {normalizedImages[0]?.memo?.trim() ?? ''}
            </div>

            {/* Thumbnails */}
            {normalizedImages.length > 1 && (
                <div className="grid grid-cols-2 gap-3 pb-2">
                    {normalizedImages.slice(1).map((img, index) => {
                        const imageIndex = index + 1;
                        return (
                        <div key={imageIndex} className="space-y-2">
                            <button
                                onClick={() => setActiveIndex(imageIndex)}
                                className={`relative aspect-[4/5] w-full overflow-hidden border transition-all duration-300 ${activeIndex === imageIndex
                                    ? 'border-white/40'
                                    : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                                    }`}
                            >
                                <img src={img.src} alt={`${title} ${imageIndex + 1}`} className="w-full h-full object-cover" />
                            </button>
                            <div className="text-xs text-neutral-500 min-h-[1.5rem]">
                                {img.memo?.trim() ?? ''}
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
};
