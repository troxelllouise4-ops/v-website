import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SakuraPetals } from './SakuraTree'

export default function UnlockSequence({ onComplete }) {
    const containerRef = useRef(null)
    const envelopeRef = useRef(null)
    const flashRef = useRef(null)
    const burstRef = useRef(null)
    const hasRun = useRef(false)

    useEffect(() => {
        if (hasRun.current) return
        hasRun.current = true

        const tl = gsap.timeline()

        /* 0.0s – White flash */
        tl.fromTo(flashRef.current, { opacity: 0 }, { opacity: 0.7, duration: 0.3, ease: 'power2.in' })
            .to(flashRef.current, { opacity: 0, duration: 0.4, ease: 'power2.out' })

        /* 0.5s – Background deepens (handled by parent via scene change) */

        /* 1.0s – Sakura burst particles from center */
        tl.call(() => {
            if (burstRef.current) burstRef.current.style.opacity = '1'
        }, null, 1.0)

        /* 1.0s – Burst particles */
        tl.fromTo(burstRef.current, { scale: 0 }, { scale: 1, duration: 0.8, ease: 'power2.out' }, 1.0)
            .to(burstRef.current, { opacity: 0, duration: 0.5 }, 1.6)



        /* 2.5s – Envelope appears */
        tl.fromTo(envelopeRef.current,
            { scale: 0, rotation: -10, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' },
            2.5
        )

        /* 3.5s – Envelope settles to gentle pulse */
        tl.call(() => {
            if (envelopeRef.current) {
                envelopeRef.current.style.animation = 'gentlePulse 3s ease-in-out infinite'
            }
        }, null, 3.5)
    }, [])

    return (
        <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Deeper gradient background */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(26,18,69,0.6) 0%, rgba(67,40,116,0.5) 50%, rgba(45,27,78,0.7) 100%)',
                zIndex: 1,
            }} />

            {/* White flash overlay */}
            <div ref={flashRef} style={{
                position: 'fixed', inset: 0, background: 'white', opacity: 0, zIndex: 50, pointerEvents: 'none',
            }} />

            {/* Burst particles */}
            <div ref={burstRef} style={{
                position: 'absolute', zIndex: 4, opacity: 0,
                width: '300px', height: '300px',
                left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
            }}>
                {Array.from({ length: 24 }, (_, i) => {
                    const angle = (i / 24) * Math.PI * 2
                    const dist = 60 + Math.random() * 80
                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${50 + Math.cos(angle) * dist / 3}%`,
                            top: `${50 + Math.sin(angle) * dist / 3}%`,
                            width: `${Math.random() * 8 + 4}px`,
                            height: `${Math.random() * 8 + 4}px`,
                            borderRadius: '50%',
                            background: i % 3 === 0 ? '#ffb3d9' : i % 3 === 1 ? '#ffd6ec' : '#e991bf',
                            boxShadow: `0 0 8px ${i % 2 === 0 ? '#ffb3d9' : '#ffd6ec'}`,
                        }} />
                    )
                })}
            </div>

            {/* Sakura petals (begin falling during sequence) */}
            <SakuraPetals count={100} />



            {/* Envelope */}
            <div
                ref={envelopeRef}
                onClick={onComplete}
                style={{
                    position: 'relative',
                    zIndex: 10,
                    cursor: 'pointer',
                    opacity: 0,
                }}
            >
                {/* Envelope SVG */}
                <svg width="160" height="120" viewBox="0 0 160 120" style={{ filter: 'drop-shadow(0 8px 30px rgba(255,179,217,0.3))' }}>
                    <defs>
                        <linearGradient id="envGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f5f0e1" />
                            <stop offset="100%" stopColor="#e8dcc8" />
                        </linearGradient>
                    </defs>
                    {/* Back */}
                    <rect x="5" y="20" width="150" height="95" rx="4" fill="url(#envGrad)" stroke="#d4c5a9" strokeWidth="1" />
                    {/* Flap */}
                    <path d="M5,20 L80,65 L155,20" fill="#ede5d0" stroke="#d4c5a9" strokeWidth="1" />
                    {/* Wax seal */}
                    <circle cx="80" cy="60" r="16" fill="#c62828" />
                    <circle cx="80" cy="60" r="13" fill="#d32f2f" />
                    {/* Heart on seal */}
                    <path d="M80 66 L77 62 C75 59, 77 56, 80 58 C83 56, 85 59, 83 62 Z" fill="#ffcdd2" />
                </svg>

                <p style={{
                    textAlign: 'center',
                    marginTop: '16px',
                    fontFamily: 'var(--font-script)',
                    fontSize: '1rem',
                    color: 'var(--sakura-pink)',
                    letterSpacing: '0.05em',
                    opacity: 0.8,
                }}>
                    tap to open
                </p>
            </div>

            {/* Vignette */}
            <div className="vignette" />
        </div>
    )
}
