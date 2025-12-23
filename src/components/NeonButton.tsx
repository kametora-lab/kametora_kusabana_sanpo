import React from 'react';

interface NeonButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent';
    onClick?: () => void;
    className?: string;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
    children,
    variant = 'primary',
    onClick,
    className = ''
}) => {
    const baseStyles = "relative px-8 py-3 font-display font-bold text-sm tracking-wider uppercase transition-all duration-300 clip-path-slant group overflow-hidden";

    const variants = {
        primary: "text-neon-pink border border-neon-pink hover:bg-neon-pink/10 shadow-[0_0_10px_rgba(255,45,149,0.3)] hover:shadow-[0_0_20px_rgba(255,45,149,0.6)]",
        secondary: "text-neon-cyan border border-neon-cyan hover:bg-neon-cyan/10 shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]",
        accent: "text-neon-purple border border-neon-purple hover:bg-neon-purple/10 shadow-[0_0_10px_rgba(176,38,255,0.3)] hover:shadow-[0_0_20px_rgba(176,38,255,0.6)]"
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            <span className="relative z-10">{children}</span>
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </button>
    );
};
