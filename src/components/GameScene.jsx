import React, { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'

/* ── Heart SVG component ── */
function HeartIcon({ size = 48 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="url(#heartGrad)" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="heartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff758f" />
                    <stop offset="100%" stopColor="#ff4d6d" />
                </linearGradient>
                <filter id="heartGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" filter="url(#heartGlow)" />
        </svg>
    )
}

/* ── Particle Burst ── */
function ParticleBurst({ x, y, onDone }) {
    const ref = useRef(null)

    useEffect(() => {
        if (!ref.current) return
        const particles = ref.current.children
        const tl = gsap.timeline({ onComplete: onDone })

        Array.from(particles).forEach(p => {
            const angle = Math.random() * Math.PI * 2
            const dist = Math.random() * 80 + 30
            tl.fromTo(p, {
                x: 0, y: 0, scale: 1, opacity: 1,
            }, {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                scale: 0,
                opacity: 0,
                duration: 0.6 + Math.random() * 0.3,
                ease: 'power2.out',
            }, 0)
        })
    }, [onDone])

    return (
        <div ref={ref} style={{ position: 'fixed', left: x, top: y, zIndex: 20, pointerEvents: 'none' }}>
            {Array.from({ length: 12 }, (_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    width: `${Math.random() * 6 + 4}px`,
                    height: `${Math.random() * 6 + 4}px`,
                    borderRadius: '50%',
                    background: i % 3 === 0 ? '#ff4d6d' : i % 3 === 1 ? '#ffb3d9' : '#ff758f',
                    boxShadow: `0 0 6px ${i % 2 === 0 ? '#ff4d6d' : '#ffb3d9'}`,
                }} />
            ))}
        </div>
    )
}

/* ── Game Scene ── */
export default function GameScene({ onWin }) {
    const [score, setScore] = useState(0)
    const [timer, setTimer] = useState(30)
    const [hearts, setHearts] = useState([])
    const [particles, setParticles] = useState([])
    const [gameOver, setGameOver] = useState(false)
    const containerRef = useRef(null)
    const hasWon = useRef(false)
    const spawnInterval = useRef(null)
    const timerInterval = useRef(null)
    const heartIdRef = useRef(0)
    const particleIdRef = useRef(0)

    /* Spawn hearts */
    const spawnHeart = useCallback(() => {
        const padding = 80
        const maxW = window.innerWidth - padding * 2
        const maxH = window.innerHeight - padding * 2
        const size = Math.random() * 16 + 40

        const newHeart = {
            id: heartIdRef.current++,
            x: Math.random() * maxW + padding,
            y: Math.random() * maxH + padding,
            size,
            born: Date.now(),
        }
        setHearts(prev => [...prev, newHeart])
    }, [])

    /* Timer logic */
    useEffect(() => {
        if (gameOver) return

        timerInterval.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    setGameOver(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerInterval.current)
    }, [gameOver])

    /* Heart spawning */
    useEffect(() => {
        if (gameOver) return

        spawnHeart()
        spawnInterval.current = setInterval(spawnHeart, 1500)

        return () => clearInterval(spawnInterval.current)
    }, [spawnHeart, gameOver])

    /* Heart expiry */
    useEffect(() => {
        if (gameOver) return

        const expiryCheck = setInterval(() => {
            setHearts(prev => prev.filter(h => Date.now() - h.born < 3000))
        }, 200)

        return () => clearInterval(expiryCheck)
    }, [gameOver])

    /* Win check */
    useEffect(() => {
        if (score >= 10 && !hasWon.current) {
            hasWon.current = true
            setGameOver(true)
            clearInterval(spawnInterval.current)
            clearInterval(timerInterval.current)

            /* Brief pause then trigger unlock */
            setTimeout(() => onWin(), 300)
        }
    }, [score, onWin])

    /* Click handler */
    const handleHeartClick = useCallback((e, heartId) => {
        e.stopPropagation()
        const rect = e.currentTarget.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2

        setParticles(prev => [...prev, { id: particleIdRef.current++, x: cx, y: cy }])
        setHearts(prev => prev.filter(h => h.id !== heartId))
        setScore(prev => prev + 1)
    }, [])

    const removeParticle = useCallback((id) => {
        setParticles(prev => prev.filter(p => p.id !== id))
    }, [])

    /* Fade in */
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })
        }
    }, [])

    return (
        <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 2 }}>
            {/* Game UI overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '24px 32px',
                zIndex: 15,
            }}>
                {/* Timer */}
                <div className="glass" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--comet-cyan)" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.3rem', fontWeight: 600, color: timer <= 5 ? '#ff4d6d' : 'var(--text-primary)', transition: 'color 0.3s', fontVariantNumeric: 'tabular-nums' }}>
                        {timer}s
                    </span>
                </div>

                {/* Score */}
                <div className="glass" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>💕</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.3rem', fontWeight: 600, color: score >= 10 ? '#ffb74d' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {score} / 10
                    </span>
                </div>
            </div>

            {/* Instruction */}
            <div style={{
                position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 15, textAlign: 'center',
            }}>
                <p className="glass" style={{
                    padding: '10px 24px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 300,
                    letterSpacing: '0.05em',
                }}>
                    Catch the hearts before they fade ✨
                </p>
            </div>

            {/* Hearts */}
            {hearts.map(heart => (
                <HeartElement
                    key={heart.id}
                    heart={heart}
                    onClick={handleHeartClick}
                    gameOver={gameOver}
                />
            ))}

            {/* Particles */}
            {particles.map(p => (
                <ParticleBurst key={p.id} x={p.x} y={p.y} onDone={() => removeParticle(p.id)} />
            ))}

            {/* Game over fallback (timer ran out without winning) */}
            {gameOver && !hasWon.current && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', zIndex: 25,
                    background: 'rgba(10,14,39,0.7)',
                    backdropFilter: 'blur(4px)',
                }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        Almost there...
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        You caught {score} hearts. Try again?
                    </p>
                    <button
                        onClick={() => {
                            setScore(0)
                            setTimer(30)
                            setHearts([])
                            setParticles([])
                            setGameOver(false)
                            hasWon.current = false
                        }}
                        style={{
                            fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600,
                            padding: '12px 36px', borderRadius: '50px',
                            border: '1px solid rgba(77,208,225,0.3)',
                            background: 'linear-gradient(135deg, rgba(77,208,225,0.15), rgba(45,27,78,0.4))',
                            color: 'var(--text-primary)', cursor: 'pointer',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    )
}

/* ── Individual Heart Element ── */
function HeartElement({ heart, onClick, gameOver }) {
    const ref = useRef(null)

    useEffect(() => {
        if (!ref.current) return
        gsap.fromTo(ref.current, { scale: 0, rotation: -15 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
    }, [])

    if (gameOver) return null

    return (
        <div
            ref={ref}
            onClick={(e) => onClick(e, heart.id)}
            style={{
                position: 'fixed',
                left: heart.x - heart.size / 2,
                top: heart.y - heart.size / 2,
                width: heart.size,
                height: heart.size,
                cursor: 'pointer',
                zIndex: 10,
                animation: 'heartFloat 2s ease-in-out infinite',
                animationDelay: `${Math.random() * 2}s`,
                filter: 'drop-shadow(0 0 12px rgba(255,77,109,0.5))',
                transition: 'transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            <HeartIcon size={heart.size} />
        </div>
    )
}
