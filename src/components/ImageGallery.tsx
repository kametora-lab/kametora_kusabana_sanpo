import React, { useState } from 'react';

interface ImageGalleryProps {
    images: string[];
    title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
    const [activeImage, setActiveImage] = useState(images[0] || '');

    if (!images || images.length === 0) {
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
                    src={activeImage}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-cyan/50 rounded-tl-xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-pink/50 rounded-br-xl pointer-events-none"></div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-2 gap-3 pb-2">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveImage(img)}
                            className={`relative aspect-square rounded-lg overflow-hidden border transition-all duration-300 ${activeImage === img
                                ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                                : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                                }`}
                        >
                            <img src={img} alt={`${title} ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
