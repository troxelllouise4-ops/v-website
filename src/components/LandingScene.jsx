import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useTheme } from '../ThemeContext'
import Snowfall from './Snowfall'

export default function LandingScene({ onBegin }) {
    const containerRef = useRef(null)
    const hasAnimated = useRef(false)
    const { theme } = useTheme()



    /* GSAP entrance */
    useEffect(() => {
        if (!containerRef.current || hasAnimated.current) return
        hasAnimated.current = true

        const el = containerRef.current
        gsap.set(el, { opacity: 0 })
        gsap.set(el.querySelectorAll('.land-text-block, .land-image-wrap'), { opacity: 0 })
        gsap.set(el.querySelector('.land-text-block'), { x: -40 })
        gsap.set(el.querySelector('.land-image-wrap'), { x: 40 })

        gsap.timeline()
            .to(el, { opacity: 1, duration: 1.5 })
            .to(el.querySelector('.land-image-wrap'), { opacity: 1, x: 0, duration: 2, ease: 'power3.out' }, 0.4)
            .to(el.querySelector('.land-text-block'), { opacity: 1, x: 0, duration: 1.8, ease: 'power3.out' }, 0.6)
    }, [])

    /* Click-anywhere → transition */
    const handleClick = () => {
        const overlay = document.createElement('div')
        overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 999; pointer-events: none; opacity: 0;
      background: radial-gradient(ellipse at center,
        rgba(255,255,255,0.85) 0%, rgba(200,180,230,0.4) 50%, transparent 100%);
    `
        document.body.appendChild(overlay)

        gsap.timeline()
            .to(overlay, { opacity: 1, duration: 0.5, ease: 'power2.in' })
            .to(containerRef.current, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 0.2)
            .to(overlay, { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.7)
            .call(() => { overlay.remove(); onBegin() })
    }

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            style={{
                position: 'fixed', inset: 0, zIndex: 2, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            {/* Snowfall */}
            <Snowfall />

            {/* ═══ LEFT: Text Content ═══ */}
            <div className="land-text-block" style={{
                flex: '0 1 480px',
                zIndex: 5,
                padding: 'clamp(24px, 4vw, 60px)',
                paddingRight: 'clamp(16px, 3vw, 40px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
            }}>
                {/* Decorative line */}
                <div style={{
                    width: '40px', height: '2px', marginBottom: '20px',
                    background: 'var(--accent-line)',
                    borderRadius: '2px',
                }} />

                {/* Title */}
                <h1 style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                    marginBottom: '16px',
                    lineHeight: 1.15,
                    textShadow: `0 0 40px var(--accent-glow), 0 2px 10px rgba(0,0,0,0.3)`,
                }}>
                    For You, Tanvi
                </h1>

                {/* Description */}
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(0.82rem, 1.5vw, 0.95rem)',
                    color: 'var(--text-body)',
                    fontWeight: 300,
                    lineHeight: 1.8,
                    marginBottom: '16px',
                    maxWidth: '400px',
                }}>
                    Some people walk into your life and everything just feels
                    different - the sky looks more vivid, the quiet moments
                    feel warmer, and even time seems to slow down.
                </p>

                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(0.78rem, 1.4vw, 0.9rem)',
                    color: 'var(--text-muted)',
                    fontWeight: 300,
                    lineHeight: 1.75,
                    marginBottom: '30px',
                    maxWidth: '380px',
                    fontStyle: 'italic',
                }}>
                    I built this little world for you. Catch the falling hearts,
                    unlock a letter written across time, and find something
                    that's meant only for you.
                </p>

                {/* Divider */}
                <div style={{
                    width: '30px', height: '1px', marginBottom: '20px',
                    background: 'var(--divider)',
                }} />

                {/* Tagline */}
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(0.6rem, 1.2vw, 0.75rem)',
                    color: 'var(--text-subtle)',
                    fontWeight: 300,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                }}>
                    A moment across time
                </p>

                {/* CTA */}
                <p style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                    color: 'var(--text-accent)',
                    fontWeight: 400,
                    letterSpacing: '0.04em',
                    animation: 'gentlePulse 3s ease-in-out infinite',
                }}>
                    ✦ touch the sky to begin ✦
                </p>
            </div>

            {/* ═══ RIGHT: Image with premium blend ═══ */}
            <div className="land-image-wrap" style={{
                flex: '1 1 55%',
                height: '100%',
                position: 'relative',
                zIndex: 3,
            }}>
                {/* Feathered left edge — seamless blend from text to image */}
                <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: 0,
                    width: 'clamp(80px, 12vw, 200px)',
                    background: `linear-gradient(to right, var(--feather-left), transparent)`,
                    zIndex: 2,
                    pointerEvents: 'none',
                }} />

                {/* Top and bottom feather */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '15%',
                    background: `linear-gradient(to bottom, var(--feather-top), transparent)`,
                    zIndex: 2, pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%',
                    background: `linear-gradient(to top, var(--feather-bottom), transparent)`,
                    zIndex: 2, pointerEvents: 'none',
                }} />

                {/* The image itself */}
                <img
                    src="images/landing-bg.jpeg"
                    alt="A twilight scene — two silhouettes under a starlit sky"
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center',
                    }}
                />

                {/* Soft color overlay for cohesion */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'var(--img-overlay)',
                    zIndex: 1, pointerEvents: 'none',
                }} />
            </div>

            {/* Vignette */}
            <div className="vignette" />

            {/* ═══ Responsive ═══ */}
            <style>{`
        @media (max-width: 768px) {
          .land-text-block {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 8 !important;
            padding: 24px 20px 36px !important;
            background: var(--mobile-text-bg) !important;
            text-align: center !important;
            align-items: center !important;
            flex: unset !important;
          }
          .land-image-wrap {
            position: absolute !important;
            inset: 0 !important;
            flex: unset !important;
          }
        }
      `}</style>
        </div>
    )
}
