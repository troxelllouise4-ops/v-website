import React, { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'

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

/* ── Sakura Petals ── */
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
        }))
    }, [actualCount])

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 6, overflow: 'hidden' }}>
            {petals.map(p => (
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
                    <svg viewBox="0 0 20 20" width={p.size} height={p.size}>
                        <defs>
                            <linearGradient id={`pg${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ffd6ec" />
                                <stop offset="100%" stopColor="#ffb3d9" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M10 2 C8 0, 3 1, 2 5 C1 9, 5 13, 10 18 C15 13, 19 9, 18 5 C17 1, 12 0, 10 2 Z"
                            fill={`url(#pg${p.id})`}
                            opacity="0.85"
                        />
                    </svg>
                </div>
            ))}
        </div>
    )
}
