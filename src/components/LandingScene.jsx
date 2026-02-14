import React, { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'

export default function LandingScene({ onBegin }) {
    const containerRef = useRef(null)
    const hasAnimated = useRef(false)

    /* Generate snowflakes once */
    const snowflakes = useMemo(() => {
        return Array.from({ length: 60 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animDuration: `${Math.random() * 8 + 6}s`,
            animDelay: `${Math.random() * 10}s`,
            fontSize: `${Math.random() * 0.6 + 0.4}em`,
            opacity: Math.random() * 0.6 + 0.2,
        }))
    }, [])

    useEffect(() => {
        if (!containerRef.current || hasAnimated.current) return
        hasAnimated.current = true

        const els = containerRef.current
        const tl = gsap.timeline()

        gsap.set(els, { opacity: 0 })
        gsap.set(els.querySelectorAll('.land-title, .land-subtitle, .land-btn, .land-scene'), { opacity: 0, y: 30 })

        tl.to(els, { opacity: 1, duration: 1 })
            .to(els.querySelector('.land-scene'), { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, 0.3)
            .to(els.querySelector('.land-title'), { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, 0.8)
            .to(els.querySelector('.land-subtitle'), { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 1.3)
            .to(els.querySelector('.land-btn'), { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }, 1.8)
    }, [])

    const handleBegin = () => {
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;inset:0;background:white;z-index:999;opacity:0;pointer-events:none;'
        document.body.appendChild(overlay)

        gsap.timeline()
            .to(overlay, { opacity: 0.8, duration: 0.3, ease: 'power2.in' })
            .to(overlay, { opacity: 0, duration: 0.5, ease: 'power2.out' })
            .to(containerRef.current, { opacity: 0, duration: 0.3 }, 0.3)
            .call(() => {
                overlay.remove()
                onBegin()
            })
    }

    return (
        <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,39,0.3) 0%, rgba(26,18,69,0.5) 50%, rgba(45,27,78,0.7) 100%)', zIndex: 1 }} />

            {/* Snow */}
            {snowflakes.map(s => (
                <div key={s.id} className="snowflake" style={{ left: s.left, animationDuration: s.animDuration, animationDelay: s.animDelay, fontSize: s.fontSize }}>
                    ❄
                </div>
            ))}

            {/* Scene illustration */}
            <div className="land-scene" style={{ position: 'relative', zIndex: 3, marginBottom: '24px' }}>
                <svg width="340" height="220" viewBox="0 0 340 220" style={{ maxWidth: '85vw' }}>
                    {/* Hill / ground */}
                    <ellipse cx="170" cy="210" rx="200" ry="45" fill="rgba(20,16,50,0.8)" />
                    <ellipse cx="170" cy="210" rx="195" ry="40" fill="rgba(30,24,65,0.6)" />

                    {/* Deer 1 */}
                    <g transform="translate(70, 145)" opacity="0.8">
                        <ellipse cx="0" cy="0" rx="14" ry="9" fill="#1a1540" /> {/* body */}
                        <ellipse cx="-12" cy="-7" rx="5" ry="4" fill="#1a1540" /> {/* head */}
                        <line x1="-7" y1="7" x2="-9" y2="21" stroke="#1a1540" strokeWidth="2.5" />
                        <line x1="5" y1="7" x2="3" y2="21" stroke="#1a1540" strokeWidth="2.5" />
                        <line x1="-14" y1="-10" x2="-18" y2="-22" stroke="#1a1540" strokeWidth="1.5" /> {/* antler */}
                        <line x1="-16" y1="-16" x2="-21" y2="-20" stroke="#1a1540" strokeWidth="1.2" />
                        <line x1="-11" y1="-10" x2="-8" y2="-21" stroke="#1a1540" strokeWidth="1.5" />
                        <line x1="-10" y1="-16" x2="-5" y2="-19" stroke="#1a1540" strokeWidth="1.2" />
                    </g>

                    {/* Deer 2 */}
                    <g transform="translate(115, 155)" opacity="0.7">
                        <ellipse cx="0" cy="0" rx="11" ry="7" fill="#1a1540" />
                        <ellipse cx="10" cy="-5" rx="4" ry="3.5" fill="#1a1540" />
                        <line x1="-5" y1="5" x2="-7" y2="17" stroke="#1a1540" strokeWidth="2" />
                        <line x1="4" y1="5" x2="3" y2="17" stroke="#1a1540" strokeWidth="2" />
                    </g>

                    {/* Figure 1 (taller) */}
                    <g transform="translate(210, 125)">
                        <circle cx="0" cy="0" r="9" fill="#0f0d2e" /> {/* head */}
                        <path d="M-8,8 Q-10,35 -6,55 L6,55 Q10,35 8,8 Z" fill="#0f0d2e" /> {/* body */}
                        <line x1="-6" y1="55" x2="-8" y2="75" stroke="#0f0d2e" strokeWidth="4" strokeLinecap="round" />
                        <line x1="6" y1="55" x2="8" y2="75" stroke="#0f0d2e" strokeWidth="4" strokeLinecap="round" />
                        {/* scarf detail */}
                        <path d="M-8,12 Q0,17 8,12" stroke="rgba(77,208,225,0.3)" strokeWidth="2" fill="none" />
                    </g>

                    {/* Figure 2 (shorter) */}
                    <g transform="translate(235, 135)">
                        <circle cx="0" cy="0" r="8" fill="#0f0d2e" />
                        <path d="M-7,7 Q-9,30 -5,48 L5,48 Q9,30 7,7 Z" fill="#0f0d2e" />
                        {/* flowing hair detail */}
                        <path d="M5,-2 Q12,5 10,12" stroke="#0f0d2e" strokeWidth="3" fill="none" />
                        <line x1="-5" y1="48" x2="-7" y2="65" stroke="#0f0d2e" strokeWidth="3.5" strokeLinecap="round" />
                        <line x1="5" y1="48" x2="7" y2="65" stroke="#0f0d2e" strokeWidth="3.5" strokeLinecap="round" />
                        {/* scarf detail */}
                        <path d="M-7,10 Q0,14 7,10" stroke="rgba(255,179,217,0.3)" strokeWidth="2" fill="none" />
                    </g>

                    {/* Soft glow around figures */}
                    <defs>
                        <radialGradient id="figureGlow">
                            <stop offset="0%" stopColor="rgba(77,208,225,0.15)" />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </defs>
                    <circle cx="222" cy="160" r="60" fill="url(#figureGlow)" />
                </svg>
            </div>

            {/* Text content */}
            <div style={{ position: 'relative', zIndex: 4, textAlign: 'center', padding: '0 24px' }}>
                <h1 className="land-title" style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '12px',
                    letterSpacing: '0.02em',
                    textShadow: '0 0 40px rgba(77,208,225,0.3), 0 2px 10px rgba(0,0,0,0.5)',
                }}>
                    A Moment Across Time
                </h1>

                <p className="land-subtitle" style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)',
                    color: 'var(--text-secondary)',
                    fontWeight: 300,
                    letterSpacing: '0.05em',
                    marginBottom: '36px',
                    fontStyle: 'italic',
                }}>
                    Can you catch what slips away?
                </p>

                <button
                    className="land-btn"
                    id="begin-button"
                    onClick={handleBegin}
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        padding: '14px 48px',
                        borderRadius: '50px',
                        border: '1px solid rgba(77,208,225,0.3)',
                        background: 'linear-gradient(135deg, rgba(77,208,225,0.15), rgba(45,27,78,0.4))',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        letterSpacing: '0.1em',
                        transition: 'all 0.4s ease',
                        boxShadow: '0 0 30px rgba(77,208,225,0.15), 0 4px 15px rgba(0,0,0,0.3)',
                        textTransform: 'uppercase',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 0 50px rgba(77,208,225,0.3), 0 8px 25px rgba(0,0,0,0.4)'
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.borderColor = 'rgba(77,208,225,0.5)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(77,208,225,0.15), 0 4px 15px rgba(0,0,0,0.3)'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.borderColor = 'rgba(77,208,225,0.3)'
                    }}
                >
                    Begin
                </button>
            </div>

            {/* Vignette */}
            <div className="vignette" />
        </div>
    )
}
