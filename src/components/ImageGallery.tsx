import React, { useEffect, useMemo, useState } from 'react';

interface ImageGalleryProps {
    images: Array<string | PlantImage>;
    title: string;
}

interface PlantImage {
    src: string;
    memo?: string;
    alt?: string;
}

const normalizeImages = (images: Array<string | PlantImage>) =>
    images
        .map((img) => (typeof img === 'string' ? { src: img, memo: '', alt: '' } : { ...img, memo: img.memo ?? '', alt: img.alt ?? '' }))
        .filter((img) => img.src?.trim());

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
    const normalizedImages = useMemo(() => normalizeImages(images ?? []), [images]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const activeImage = normalizedImages[activeIndex] ?? normalizedImages[0];
    const activeAlt = activeImage?.alt?.trim() || title;

    useEffect(() => {
        setActiveIndex(0);
    }, [images]);

    useEffect(() => {
        if (!isModalOpen) return;
        const raf = requestAnimationFrame(() => setIsModalVisible(true));
        return () => cancelAnimationFrame(raf);
    }, [isModalOpen]);

    useEffect(() => {
        if (!isModalOpen || isModalVisible) return;
        const timer = window.setTimeout(() => setIsModalOpen(false), 200);
        return () => window.clearTimeout(timer);
    }, [isModalOpen, isModalVisible]);

    const closeModal = () => setIsModalVisible(false);

    if (!normalizedImages || normalizedImages.length === 0 || !activeImage) {
        return (
            <div className="aspect-[4/3] border border-white/10 bg-[#111] flex flex-col items-center justify-center text-neutral-600">
                <span className="text-2xl mb-3">NO IMAGE</span>
                <span className="text-xs tracking-widest">DATA NOT FOUND</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image View */}
            <div className="aspect-[4/3] overflow-hidden border border-white/10 bg-[#111] relative group">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    aria-label={`${activeAlt} を拡大表示する`}
                    className="block w-full h-full cursor-zoom-in"
                >
                    <img
                        src={activeImage.src}
                        alt={activeAlt}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                    />
                    <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                    </span>
                </button>
            </div>

            {/* Thumbnails (all images) */}
            {normalizedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 pb-2 sm:grid-cols-4">
                    {normalizedImages.map((img, imageIndex) => (
                        <div key={imageIndex} className="space-y-1">
                            <button
                                onClick={() => setActiveIndex(imageIndex)}
                                className={`relative aspect-[4/3] w-full overflow-hidden border transition-all duration-300 ${activeIndex === imageIndex
                                    ? 'border-white/40'
                                    : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                                    }`}
                            >
                                <img
                                    src={img.src}
                                    alt={img.alt?.trim() || `${title} ${imageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                            {img.memo?.trim() && (
                                <div className="text-[15px] leading-snug text-neutral-500 line-clamp-2">
                                    {img.memo}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="min-h-[1.5rem]" />

            {isModalOpen && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 transition-opacity duration-200 ${isModalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${activeAlt} の拡大画像`}
                    onClick={closeModal}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') closeModal();
                    }}
                >
                    <div
                        className={`relative w-full max-w-5xl transition-all duration-200 ${isModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            aria-label="拡大表示を閉じる"
                            className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/70 px-3 py-2 text-xs text-white/80 transition hover:text-white"
                            onClick={closeModal}
                        >
                            CLOSE
                        </button>
                        <img
                            src={activeImage.src}
                            alt={activeAlt}
                            className="max-h-[80vh] w-full rounded-md border border-white/10 object-contain shadow-[0_0_30px_rgba(120,255,220,0.15)]"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
