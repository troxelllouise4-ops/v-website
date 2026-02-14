import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { SakuraPetals } from './SakuraTree'

export default function LoveLetter({ onClose }) {
    const overlayRef = useRef(null)
    const envelopeRef = useRef(null)
    const letterRef = useRef(null)
    const [showLetter, setShowLetter] = useState(false)

    /* Envelope open animation */
    useEffect(() => {
        const tl = gsap.timeline()

        tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
            .fromTo(envelopeRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }, 0.2)

        /* Auto-open after a pause */
        const timer = setTimeout(() => {
            gsap.to(envelopeRef.current, {
                scale: 0.9, opacity: 0, duration: 0.5, ease: 'power2.in',
                onComplete: () => setShowLetter(true),
            })
        }, 1200)

        return () => clearTimeout(timer)
    }, [])

    /* Letter reveal */
    useEffect(() => {
        if (showLetter && letterRef.current) {
            gsap.fromTo(letterRef.current,
                { scale: 0.85, opacity: 0, y: 30 },
                { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
            )
        }
    }, [showLetter])

    const handleClose = () => {
        gsap.to(overlayRef.current, {
            opacity: 0, duration: 0.5,
            onComplete: onClose,
        })
    }

    return (
        <div ref={overlayRef} style={{
            position: 'fixed', inset: 0, zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent',
        }} onClick={handleClose}>
            {/* Ambient petals */}
            <SakuraPetals count={25} />

            {/* Vignette */}
            <div className="vignette" />

            {!showLetter ? (
                /* Envelope */
                <div ref={envelopeRef} style={{ position: 'relative', zIndex: 35 }} onClick={e => e.stopPropagation()}>
                    <svg width="200" height="150" viewBox="0 0 200 150" style={{ filter: 'drop-shadow(0 12px 40px rgba(255,179,217,0.25))' }}>
                        <defs>
                            <linearGradient id="envGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f5f0e1" />
                                <stop offset="100%" stopColor="#e8dcc8" />
                            </linearGradient>
                        </defs>
                        <rect x="5" y="25" width="190" height="120" rx="5" fill="url(#envGrad2)" stroke="#d4c5a9" strokeWidth="1.5" />
                        <path d="M5,25 L100,80 L195,25" fill="#ede5d0" stroke="#d4c5a9" strokeWidth="1.5" />
                        <circle cx="100" cy="75" r="20" fill="#c62828" />
                        <circle cx="100" cy="75" r="17" fill="#d32f2f" />
                        <path d="M100 81 L96 76 C93.5 73, 96 69, 100 72 C104 69, 106.5 73, 104 76 Z" fill="#ffcdd2" />
                    </svg>
                </div>
            ) : (
                /* Letter */
                <div
                    ref={letterRef}
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'relative',
                        zIndex: 35,
                        width: 'min(580px, 90vw)',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        background: 'linear-gradient(135deg, #f5f0e1, #ede5d0, #f0ead8)',
                        borderRadius: '8px',
                        padding: 'clamp(24px, 5vw, 48px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(255,179,217,0.08)',
                        scrollbarWidth: 'none',
                    }}
                >
                    {/* Paper texture overlay */}
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: '8px',
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(200,180,150,0.08) 28px, rgba(200,180,150,0.08) 29px)',
                        pointerEvents: 'none',
                    }} />

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        aria-label="Close letter"
                        style={{
                            position: 'absolute', top: '16px', right: '16px',
                            width: '32px', height: '32px', borderRadius: '50%',
                            border: 'none', background: 'rgba(150,130,100,0.15)',
                            color: '#8d7b6a', fontSize: '16px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(150,130,100,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(150,130,100,0.15)'}
                    >
                        ✕
                    </button>

                    {/* Letter content */}
                    <div style={{
                        position: 'relative',
                        fontFamily: "'Dancing Script', cursive",
                        color: '#3e3228',
                        lineHeight: 1.6,
                        fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)',
                    }}>
                        {/* Salutation */}
                        <p style={{
                            fontFamily: "inherit",
                            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                            color: '#5a3e34',
                            marginBottom: '24px',
                        }}>
                            Tanvi,
                        </p>

                        <p style={{ marginBottom: '20px', fontStyle: 'italic' }}>
                            I don't know the exact moment you became this important to me.
                        </p>

                        <p style={{ marginBottom: '6px' }}>Maybe it was in those quiet conversations that somehow lasted longer than they were supposed to.</p>
                        <p style={{ marginBottom: '6px' }}>Maybe it was the small laughs that stayed in my head long after they ended.</p>
                        <p style={{ marginBottom: '6px' }}>Maybe it was the afternoons we cooked together, simple moments that somehow felt like memories even while they were happening.</p>
                        <p style={{ marginBottom: '20px' }}>Or maybe… it was something even quieter than that.</p>

                        <p style={{ marginBottom: '20px' }}>Some people enter your life like a storm, loud and undeniable.</p>

                        <p style={{ marginBottom: '20px' }}>You didn't.</p>

                        <p style={{ marginBottom: '4px' }}>You arrived gently.</p>
                        <p style={{ marginBottom: '4px' }}>Like starlight you don't notice at first,</p>
                        <p style={{ marginBottom: '4px' }}>until one evening you look up</p>
                        <p style={{ marginBottom: '20px' }}>and realize the whole sky has changed.</p>

                        <p style={{ marginBottom: '20px' }}>
                            There's something about you, your kindness, the way you think of others before yourself, the way you make space for people, that makes ordinary moments feel different.
                        </p>

                        <p style={{ marginBottom: '4px' }}>Softer.</p>
                        <p style={{ marginBottom: '4px' }}>Brighter.</p>
                        <p style={{ marginBottom: '20px' }}>Warmer.</p>

                        <p style={{ marginBottom: '4px' }}>And I don't know if you realize this,</p>
                        <p style={{ marginBottom: '4px' }}>but the world shifts slightly whenever I'm talking to you.</p>
                        <p style={{ marginBottom: '4px' }}>Like the air feels lighter.</p>
                        <p style={{ marginBottom: '20px' }}>Like time slows down just a little.</p>

                        <p style={{ marginBottom: '20px' }}>I built this small universe just to say something simple.</p>

                        <p style={{
                            marginBottom: '20px',
                            fontFamily: 'var(--font-script)',
                            fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
                            color: '#c62828',
                            textAlign: 'center',
                        }}>
                            I like you.
                        </p>

                        <p style={{ marginBottom: '4px' }}>Not in a loud, dramatic, fireworks kind of way.</p>
                        <p style={{ marginBottom: '20px' }}>Not in a fleeting, passing-through kind of way.</p>

                        <p style={{ marginBottom: '4px' }}>But in a quiet, steady way.</p>
                        <p style={{ marginBottom: '4px' }}>The kind that grows slowly</p>
                        <p style={{ marginBottom: '4px' }}>without announcing itself</p>
                        <p style={{ marginBottom: '20px' }}>and then one day you realize it has taken root somewhere deep inside you.</p>

                        <p style={{ marginBottom: '4px' }}>I'm really glad you were the brave one.</p>
                        <p style={{ marginBottom: '20px' }}>The one who said it first.</p>

                        <p style={{ marginBottom: '4px' }}>Sometimes I feel a little dumb for not saying it before you did.</p>
                        <p style={{ marginBottom: '4px' }}>Maybe I was still trying to understand my own heart.</p>
                        <p style={{ marginBottom: '20px' }}>Maybe I still am.</p>

                        <p style={{ marginBottom: '4px' }}>I don't always say the exact words you might be waiting to hear.</p>
                        <p style={{ marginBottom: '20px' }}>Maybe I'm still learning how to translate what I feel into something clear and fearless.</p>

                        <p style={{ marginBottom: '20px' }}>But what I do know is this:</p>

                        <p style={{ marginBottom: '4px', fontStyle: 'italic' }}>You are important to me.</p>
                        <p style={{ marginBottom: '4px' }}>More than I probably show sometimes.</p>
                        <p style={{ marginBottom: '20px' }}>And I truly treasure every moment we've shared, the conversations, the laughter, the quiet in-betweens.</p>

                        <p style={{ marginBottom: '4px' }}>If someday you look at the sky</p>
                        <p style={{ marginBottom: '4px' }}>and see a streak of light cutting across it,</p>
                        <p style={{ marginBottom: '20px' }}>I hope you remember this feeling.</p>

                        <p style={{ marginBottom: '4px' }}>Because meeting you</p>
                        <p style={{ marginBottom: '20px' }}>was never ordinary to me.</p>

                        <p style={{ marginBottom: '28px' }}>And I'm grateful, deeply grateful, that our paths crossed the way they did.</p>

                        {/* The Question */}
                        <div style={{
                            textAlign: 'center',
                            padding: '24px 0',
                            borderTop: '1px solid rgba(150,130,100,0.2)',
                            borderBottom: '1px solid rgba(150,130,100,0.2)',
                            margin: '16px 0 28px',
                        }}>
                            <p style={{
                                fontFamily: 'var(--font-script)',
                                fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
                                fontWeight: 700,
                                color: '#c62828',
                                animation: 'letterGlow 3s ease-in-out infinite',
                                lineHeight: 1.4,
                            }}>
                                Will you be my Valentine?
                            </p>
                            <p style={{
                                fontSize: '1.8rem',
                                marginTop: '8px',
                            }}>
                                💕
                            </p>
                        </div>

                        {/* Signature */}
                        <p style={{
                            textAlign: 'right',
                            fontFamily: 'var(--font-script)',
                            fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                            color: '#5a3e34',
                            marginTop: '8px',
                        }}>
                            — Kathan
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
