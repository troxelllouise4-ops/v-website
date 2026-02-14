import React, { useMemo } from 'react'

export default function Snowfall() {
    /* ── Realistic snowflakes: 3 sizes, increased count ── */
    const snowflakes = useMemo(() => {
        // Increased count as requested: 300 on desktop, 150 on mobile
        const count = typeof window !== 'undefined' && window.innerWidth < 768 ? 150 : 300
        return Array.from({ length: count }, (_, i) => {
            let sizeCategory, size, speed, glowSize
            const rand = Math.random()

            if (rand < 0.6) {
                // Small: 60% of particles
                sizeCategory = 'small'
                size = Math.random() * 2 + 1
                speed = Math.random() * 6 + 5
                glowSize = size * 2
            } else if (rand < 0.9) {
                // Medium: 30% of particles
                sizeCategory = 'medium'
                size = Math.random() * 2 + 4
                speed = Math.random() * 5 + 8
                glowSize = size * 2.5
            } else {
                // Large: 10% of particles
                sizeCategory = 'large'
                size = Math.random() * 3 + 7
                speed = Math.random() * 6 + 12
                glowSize = size * 3
            }

            // Random sway values for realistic movement
            const sway1 = `${(Math.random() - 0.5) * 40}px`
            const sway2 = `${(Math.random() - 0.5) * 30}px`
            const sway3 = `${(Math.random() - 0.5) * 50}px`
            const sway4 = `${(Math.random() - 0.5) * 35}px`

            return {
                id: i,
                left: `${Math.random() * 100}%`,
                animDuration: `${speed}s`,
                animDelay: `${Math.random() * 10}s`,
                size,
                sizeCategory,
                glowSize,
                opacity: sizeCategory === 'large' ? Math.random() * 0.3 + 0.5 : Math.random() * 0.4 + 0.3,
                colorIndex: Math.random() > 0.5 ? 1 : 2, // alternate between two snow colors
                sway1, sway2, sway3, sway4,
            }
        })
    }, [])

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', overflow: 'hidden' }}>
            {snowflakes.map(s => (
                <div key={s.id} style={{
                    position: 'absolute',
                    left: s.left,
                    top: '-10px',
                    width: `${s.size}px`,
                    height: `${s.size}px`,
                    borderRadius: '50%',
                    backgroundColor: s.colorIndex === 1
                        ? `var(--snow-color-1)`
                        : `var(--snow-color-2)`,
                    opacity: 0,
                    animation: `snowfallSway ${s.animDuration} ${s.animDelay} linear infinite`,
                    '--snow-opacity': s.opacity,
                    '--snow-opacity-end': s.opacity * 0.6,
                    '--sway-1': s.sway1,
                    '--sway-2': s.sway2,
                    '--sway-3': s.sway3,
                    '--sway-4': s.sway4,
                    boxShadow: s.sizeCategory === 'large'
                        ? `0 0 ${s.glowSize}px var(--snow-glow-1), 0 0 ${s.glowSize * 0.5}px var(--snow-glow-2)`
                        : s.sizeCategory === 'medium'
                            ? `0 0 ${s.glowSize}px var(--snow-glow-1)`
                            : 'none',
                    filter: s.sizeCategory === 'large' ? `blur(0.5px)` : 'none',
                }} />
            ))}
        </div>
    )
}
