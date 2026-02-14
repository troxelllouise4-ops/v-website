import React, { useState, useEffect, useRef, useCallback } from 'react'

const GAME_TIME = 60
const HEARTS_TO_WIN = 8
const PENALTY = 3

let lanternIdCounter = 0

export default function LanternCatch({ onWin }) {
    const [lanterns, setLanterns] = useState([])
    const [hearts, setHearts] = useState(0)
    const [timer, setTimer] = useState(GAME_TIME)
    const [phase, setPhase] = useState('ready') // ready | playing | win | lost
    const containerRef = useRef(null)
    const spawnRef = useRef(null)
    const timerRef = useRef(null)

    /* Start game */
    const startGame = useCallback(() => {
        setPhase('playing')
        setHearts(0)
        setTimer(GAME_TIME)
        setLanterns([])
    }, [])

    /* Timer */
    useEffect(() => {
        if (phase !== 'playing') return
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                    setPhase('lost')
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [phase])

    /* Spawn lanterns — they use CSS animation for smooth movement */
    useEffect(() => {
        if (phase !== 'playing') return

        const spawn = () => {
            const elapsed = GAME_TIME - timer

            setLanterns(prev => {
                // Remove expired lanterns
                const filtered = prev.filter(l => Date.now() - l.spawnTime < l.duration * 1000)

                const hasHeart = Math.random() < 0.4
                const riseDuration = Math.max(4, 9 - elapsed * 0.06) // gets faster
                const newLantern = {
                    id: lanternIdCounter++,
                    x: 8 + Math.random() * 84,
                    hasHeart,
                    spawnTime: Date.now(),
                    duration: riseDuration,
                    size: 0.85 + Math.random() * 0.35,
                    opened: false,
                    sway: Math.random() * 20 - 10, // random horizontal sway
                }
                return [...filtered, newLantern]
            })

            const delay = Math.max(500, 1600 - elapsed * 12)
            spawnRef.current = setTimeout(spawn, delay + Math.random() * 500)
        }

        spawn()
        return () => { if (spawnRef.current) clearTimeout(spawnRef.current) }
    }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

    /* Tap lantern */
    const handleTap = useCallback((id) => {
        if (phase !== 'playing') return

        const lantern = lanterns.find(l => l.id === id)
        if (!lantern || lantern.opened) return

        setLanterns(prev => prev.map(l =>
            l.id === id ? { ...l, opened: true } : l
        ))

        if (lantern.hasHeart) {
            const newHearts = hearts + 1
            setHearts(newHearts)
            if (newHearts >= HEARTS_TO_WIN) {
                clearInterval(timerRef.current)
                if (spawnRef.current) clearTimeout(spawnRef.current)
                setPhase('win')
                setTimeout(() => onWin(), 2000)
            }
        } else {
            setTimer(prev => Math.max(1, prev - PENALTY))
        }
    }, [phase, lanterns, hearts, onWin])

    return (
        <div ref={containerRef} style={{
            position: 'fixed', inset: 0, zIndex: 2,
            overflow: 'hidden',
        }}>
            {/* Lantern rise keyframes — injected once */}
            <style>{`
        @keyframes lanternRise {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(var(--sway)) translateY(calc(-100vh - 80px));
            opacity: 0;
          }
        }
        @keyframes lanternPop {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.8; }
          100% { transform: scale(0.3); opacity: 0; }
        }
      `}</style>

            {/* Header HUD */}
            <div style={{
                position: 'absolute', top: 'clamp(16px, 3vh, 32px)',
                left: 0, right: 0, textAlign: 'center', zIndex: 10,
            }}>
                {phase === 'playing' && (
                    <>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '24px', marginBottom: '8px',
                        }}>
                            <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.8rem', color: 'var(--text-muted)',
                            }}>
                                💖 {hearts} / {HEARTS_TO_WIN}
                            </span>
                            <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.8rem',
                                color: timer <= 10 ? '#ff6b6b' : 'var(--text-muted)',
                            }}>
                                ⏱ {timer}s
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            {Array.from({ length: HEARTS_TO_WIN }, (_, i) => (
                                <div key={i} style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: i < hearts ? '#ff6b6b' : 'rgba(255,255,255,0.1)',
                                    boxShadow: i < hearts ? '0 0 8px rgba(255,107,107,0.5)' : 'none',
                                    transition: 'all 0.3s',
                                }} />
                            ))}
                        </div>
                    </>
                )}

                {phase === 'ready' && (
                    <div style={{ marginTop: '30vh' }}>
                        <p style={{
                            fontFamily: "'Dancing Script', cursive",
                            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                            color: 'var(--text-heading)', marginBottom: '12px',
                            textShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}>Lantern Catch</p>
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.8rem', color: 'var(--text-body)',
                            marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px',
                            lineHeight: 1.6,
                        }}>
                            Tap the rising lanterns. Some hide hearts 💖, others are empty ✧.
                            Find {HEARTS_TO_WIN} hearts before time runs out!
                            Empty lanterns cost you {PENALTY} seconds.
                        </p>
                        <button onClick={startGame} style={{
                            padding: '12px 36px', fontFamily: "'Inter', sans-serif",
                            fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)',
                            background: 'rgba(255,138,101,0.15)',
                            border: '1px solid rgba(255,138,101,0.3)',
                            borderRadius: '10px', cursor: 'pointer',
                            backdropFilter: 'blur(8px)',
                        }}>Start</button>
                    </div>
                )}

                {phase === 'win' && (
                    <div style={{ marginTop: '30vh' }}>
                        <p style={{
                            fontFamily: "'Dancing Script', cursive",
                            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
                            color: '#4dd0e1',
                            textShadow: '0 0 30px rgba(77,208,225,0.3)',
                        }}>🎉 You found all the hearts!</p>
                    </div>
                )}

                {phase === 'lost' && (
                    <div style={{ marginTop: '30vh', textAlign: 'center' }}>
                        <p style={{
                            fontFamily: "'Dancing Script', cursive",
                            fontSize: 'clamp(1.4rem, 4vw, 2rem)',
                            color: '#ff8a65', marginBottom: '16px',
                        }}>Time's up! Found {hearts} / {HEARTS_TO_WIN} hearts</p>
                        <button onClick={startGame} style={{
                            padding: '10px 28px', fontFamily: "'Inter', sans-serif",
                            fontSize: '0.8rem', fontWeight: 500, color: '#f0edf6',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px', cursor: 'pointer', backdropFilter: 'blur(8px)',
                        }}>Try Again</button>
                    </div>
                )}
            </div>

            {/* Lanterns — CSS animation driven for silky smooth movement */}
            {phase === 'playing' && lanterns.map(lantern => {
                if (lantern.opened) {
                    return (
                        <div key={lantern.id} style={{
                            position: 'absolute',
                            left: `${lantern.x}%`, bottom: '50%',
                            fontSize: `${1.6 * lantern.size}rem`,
                            animation: 'lanternPop 0.5s ease-out forwards',
                            pointerEvents: 'none', zIndex: 5,
                        }}>
                            {lantern.hasHeart ? '💖' : '✧'}
                        </div>
                    )
                }

                return (
                    <div
                        key={lantern.id}
                        onClick={() => handleTap(lantern.id)}
                        style={{
                            position: 'absolute',
                            left: `${lantern.x}%`,
                            bottom: '-60px',
                            fontSize: `${2.2 * lantern.size}rem`,
                            cursor: 'pointer',
                            filter: 'drop-shadow(0 0 14px rgba(255,138,101,0.5))',
                            zIndex: 5,
                            willChange: 'transform, opacity',
                            '--sway': `${lantern.sway}px`,
                            animation: `lanternRise ${lantern.duration}s ease-in-out forwards`,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.filter = 'drop-shadow(0 0 24px rgba(255,200,100,0.8)) brightness(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.filter = 'drop-shadow(0 0 14px rgba(255,138,101,0.5))'}
                    >
                        🏮
                    </div>
                )
            })}
        </div>
    )
}
