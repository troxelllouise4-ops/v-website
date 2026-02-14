import React, { useMemo } from 'react'

export default function SakuraTree() {
    return (
        <svg width="300" height="500" viewBox="0 0 300 500" style={{ maxWidth: '60vw', maxHeight: '70vh' }}>
            <defs>
                <filter id="treeGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feFlood floodColor="#9c27b0" floodOpacity="0.4" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="glow" />
                    <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter="url(#treeGlow)" fill="#0a0a1a" stroke="#0a0a1a" strokeWidth="1">
                {/* Trunk */}
                <path d="M145,500 Q140,420 148,350 Q150,320 145,280 Q142,260 150,230" strokeWidth="12" fill="none" stroke="#0a0a1a" strokeLinecap="round" />
                {/* Main branches */}
                <path d="M150,280 Q120,250 80,220 Q60,210 40,195" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M150,280 Q180,245 220,225 Q245,215 265,200" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M148,320 Q110,290 75,275 Q55,268 30,260" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M148,320 Q190,295 230,280 Q250,272 275,265" strokeWidth="5" fill="none" strokeLinecap="round" />
                {/* Upper branches */}
                <path d="M150,230 Q130,200 100,170 Q85,155 65,140" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M150,230 Q170,195 200,165 Q215,150 240,135" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M145,250 Q115,225 85,210" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M150,250 Q185,230 215,215" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Top branches */}
                <path d="M150,230 Q155,190 150,160 Q148,140 155,110" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M155,150 Q175,130 195,115" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M148,155 Q130,135 110,120" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M155,110 Q140,90 125,75" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M155,110 Q170,90 185,80" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Small twigs */}
                <path d="M80,220 Q65,200 55,185" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M220,225 Q240,205 250,190" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M100,170 Q80,155 70,145" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M200,165 Q220,150 235,140" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M40,195 Q30,180 25,170" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M265,200 Q275,185 280,175" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Root flare */}
                <path d="M145,500 Q130,490 115,485" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M145,500 Q160,490 180,488" strokeWidth="5" fill="none" strokeLinecap="round" />
            </g>
        </svg>
    )
}

/* ── Realistic Cherry Blossom Petal SVGs ── */

/* Petal shape 1: Full 5-petal cherry blossom */
function BlossomFull({ size, gradientId }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size}>
            <defs>
                <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff0f5" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#ffd6ec" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#ffb3d9" stopOpacity="0.7" />
                </radialGradient>
            </defs>
            {/* 5 petals arranged radially */}
            <g fill={`url(#${gradientId})`}>
                <ellipse cx="12" cy="5" rx="3.5" ry="5" />
                <ellipse cx="18.5" cy="9.5" rx="3.5" ry="5" transform="rotate(72, 18.5, 9.5)" />
                <ellipse cx="16.5" cy="17" rx="3.5" ry="5" transform="rotate(144, 16.5, 17)" />
                <ellipse cx="7.5" cy="17" rx="3.5" ry="5" transform="rotate(216, 7.5, 17)" />
                <ellipse cx="5.5" cy="9.5" rx="3.5" ry="5" transform="rotate(288, 5.5, 9.5)" />
            </g>
            {/* Center pistil */}
            <circle cx="12" cy="12" r="2" fill="#f8bbd0" opacity="0.8" />
            <circle cx="12" cy="12" r="1" fill="#f48fb1" opacity="0.6" />
        </svg>
    )
}

/* Petal shape 2: Single elongated petal with vein */
function PetalSingle({ size, gradientId }) {
    return (
        <svg viewBox="0 0 16 24" width={size * 0.7} height={size}>
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd6ec" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#ffb3d9" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#f8bbd0" stopOpacity="0.7" />
                </linearGradient>
            </defs>
            <path
                d="M8 1 C4 4, 1 9, 1 14 C1 19, 4 23, 8 23 C12 23, 15 19, 15 14 C15 9, 12 4, 8 1 Z"
                fill={`url(#${gradientId})`}
            />
            {/* Central vein */}
            <path
                d="M8 3 Q8 12, 8 21"
                fill="none"
                stroke="#f8bbd0"
                strokeWidth="0.4"
                opacity="0.5"
            />
            {/* Side veins */}
            <path d="M8 8 Q5 10, 3 12" fill="none" stroke="#f8bbd0" strokeWidth="0.3" opacity="0.3" />
            <path d="M8 8 Q11 10, 13 12" fill="none" stroke="#f8bbd0" strokeWidth="0.3" opacity="0.3" />
            <path d="M8 13 Q5 15, 3 17" fill="none" stroke="#f8bbd0" strokeWidth="0.3" opacity="0.3" />
            <path d="M8 13 Q11 15, 13 17" fill="none" stroke="#f8bbd0" strokeWidth="0.3" opacity="0.3" />
        </svg>
    )
}

/* Petal shape 3: Two-petal cluster (half-open bud) */
function PetalPair({ size, gradientId }) {
    return (
        <svg viewBox="0 0 22 20" width={size} height={size * 0.9}>
            <defs>
                <linearGradient id={`${gradientId}a`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff0f5" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ffb3d9" stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id={`${gradientId}b`} x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffd6ec" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#f8bbd0" stopOpacity="0.7" />
                </linearGradient>
            </defs>
            {/* Left petal */}
            <path
                d="M11 18 C7 16, 1 12, 1 7 C1 3, 5 1, 9 4 C10 5, 11 6, 11 8 Z"
                fill={`url(#${gradientId}a)`}
            />
            {/* Right petal */}
            <path
                d="M11 18 C15 16, 21 12, 21 7 C21 3, 17 1, 13 4 C12 5, 11 6, 11 8 Z"
                fill={`url(#${gradientId}b)`}
            />
            {/* Center */}
            <circle cx="11" cy="8" r="1.2" fill="#f48fb1" opacity="0.5" />
        </svg>
    )
}

/* ── Sakura Petals — uses 3 realistic petal shapes ── */
export function SakuraPetals({ count = 100 }) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const actualCount = isMobile ? Math.floor(count / 2) : count

    const petals = useMemo(() => {
        return Array.from({ length: actualCount }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 10 + 8,
            duration: `${Math.random() * 5 + 4}s`,
            delay: `${Math.random() * 4}s`,
            drift: `${(Math.random() - 0.5) * 80}px`,
            rotation: Math.random() * 720,
            opacity: Math.random() * 0.4 + 0.5,
            shape: Math.floor(Math.random() * 3), // 0=full, 1=single, 2=pair
        }))
    }, [actualCount])

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 6, overflow: 'hidden' }}>
            {petals.map(p => {
                const gradientId = `pg${p.id}`
                let PetalComponent
                if (p.shape === 0) PetalComponent = <BlossomFull size={p.size} gradientId={gradientId} />
                else if (p.shape === 1) PetalComponent = <PetalSingle size={p.size} gradientId={gradientId} />
                else PetalComponent = <PetalPair size={p.size} gradientId={gradientId} />

                return (
                    <div
                        key={p.id}
                        style={{
                            position: 'absolute',
                            left: p.left,
                            top: '-20px',
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            opacity: p.opacity,
                            animation: `petalFall ${p.duration} ${p.delay} linear infinite`,
                            '--drift': p.drift,
                        }}
                    >
                        {PetalComponent}
                    </div>
                )
            })}
        </div>
    )
}
