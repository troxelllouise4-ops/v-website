import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import { gsap } from 'gsap'
import Snowfall from './Snowfall'

const GAMES = [
    {
        id: 'starMemory',
        icon: '✨',
        title: 'Star Memory',
        desc: 'Watch the stars light up, then repeat the sequence from memory.',
        color: '#4dd0e1',
        glow: 'rgba(77,208,225,0.15)',
    },
    {
        id: 'cometTrace',
        icon: '☄️',
        title: 'Comet Trace',
        desc: 'A comet streaks across the sky — trace its fading trail with precision.',
        color: '#80deea',
        glow: 'rgba(128,222,234,0.15)',
    },
    {
        id: 'lanternCatch',
        icon: '🏮',
        title: 'Lantern Catch',
        desc: 'Tap the rising lanterns to find hidden hearts. Beware of decoys!',
        color: '#ff8a65',
        glow: 'rgba(255,138,101,0.15)',
    },
]

export default function GameSelect({ onSelect }) {
    const containerRef = useRef(null)
    const hasAnimated = useRef(false)

    useEffect(() => {
        if (!containerRef.current || hasAnimated.current) return
        hasAnimated.current = true

        const el = containerRef.current
        gsap.set(el, { opacity: 0 })
        gsap.set(el.querySelectorAll('.gs-card'), { opacity: 0, y: 50, scale: 0.9 })
        gsap.set(el.querySelectorAll('.gs-header'), { opacity: 0, y: -20 })

        const tl = gsap.timeline()
        tl.to(el, { opacity: 1, duration: 0.8 })
            .to(el.querySelectorAll('.gs-header'), { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 0.3)
            .to(el.querySelectorAll('.gs-card'), {
                opacity: 1, y: 0, scale: 1, duration: 0.8,
                ease: 'back.out(1.4)', stagger: 0.15,
            }, 0.6)
    }, [])

    const handleSelect = useCallback((gameId) => {
        if (!containerRef.current) return
        gsap.to(containerRef.current, {
            opacity: 0, duration: 0.5, ease: 'power2.in',
            onComplete: () => onSelect(gameId),
        })
    }, [onSelect])

    /* Floating particles */
    const particles = useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.3 + 0.1,
            duration: `${Math.random() * 15 + 10}s`,
            delay: `${Math.random() * 10}s`,
        }))
    }, [])

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed', inset: 0, zIndex: 2,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: 'clamp(20px, 4vw, 60px)',
                overflow: 'auto',
            }}
        >
            <Snowfall />
            {/* Floating ambient particles (keep for variety) */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                {particles.map(p => (
                    <div key={p.id} style={{
                        position: 'absolute', left: p.left, top: p.top,
                        width: `${p.size}px`, height: `${p.size}px`,
                        borderRadius: '50%',
                        backgroundColor: `rgba(77,208,225,${p.opacity})`,
                        animation: `gentlePulse ${p.duration} ${p.delay} ease-in-out infinite`,
                        boxShadow: `0 0 ${p.size * 4}px rgba(77,208,225,${p.opacity * 0.5})`,
                    }} />
                ))}
            </div>

            {/* Header */}
            <div className="gs-header" style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vh, 48px)', zIndex: 1 }}>
                <h2 style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                    fontWeight: 700, color: 'var(--text-heading)', marginBottom: '10px',
                    textShadow: '0 0 30px var(--accent-glow), 0 2px 8px rgba(0,0,0,0.3)',
                }}>Choose Your Challenge</h2>
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(0.7rem, 1.4vw, 0.85rem)',
                    color: 'var(--text-muted)', fontWeight: 300, letterSpacing: '0.12em',
                }}>Complete any game to unlock the letter</p>
            </div>

            {/* Game Cards — 3 cards in a row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'clamp(14px, 2vw, 24px)',
                maxWidth: '780px',
                width: '100%',
                zIndex: 1,
            }}>
                {GAMES.map((game) => (
                    <div
                        key={game.id}
                        className="gs-card"
                        onClick={() => handleSelect(game.id)}
                        onMouseEnter={(e) => {
                            gsap.to(e.currentTarget, { scale: 1.04, duration: 0.3, ease: 'power2.out' })
                            gsap.to(e.currentTarget.querySelector('.gs-icon'), { scale: 1.15, duration: 0.3 })
                        }}
                        onMouseLeave={(e) => {
                            gsap.to(e.currentTarget, { scale: 1, duration: 0.3 })
                            gsap.to(e.currentTarget.querySelector('.gs-icon'), { scale: 1, duration: 0.3 })
                        }}
                        style={{
                            background: 'var(--glass-bg)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: 'clamp(20px, 3vw, 32px)',
                            cursor: 'pointer', position: 'relative', overflow: 'hidden',
                            transition: 'border-color 0.3s, box-shadow 0.3s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = `${game.color}40`
                            e.currentTarget.style.boxShadow = `0 0 30px ${game.glow}, 0 4px 20px rgba(0,0,0,0.3)`
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = 'var(--glass-border)'
                            e.currentTarget.style.boxShadow = 'none'
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                            background: `linear-gradient(90deg, transparent, ${game.color}60, transparent)`,
                            opacity: 0.6,
                        }} />
                        <div className="gs-icon" style={{
                            fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '14px', display: 'inline-block',
                        }}>{game.icon}</div>
                        <h3 style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                            fontWeight: 600, color: game.color, marginBottom: '8px',
                        }}>{game.title}</h3>
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 'clamp(0.7rem, 1.2vw, 0.8rem)',
                            color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.6,
                        }}>{game.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
