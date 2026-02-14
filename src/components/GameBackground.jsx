import React, { useMemo } from 'react'

/*
  Ambient Japanese-style animated overlay for game scenes.
  Adds floating sakura petals, warm glowing orbs (like distant lanterns),
  and atmospheric light shafts for visual depth.
*/
export default function GameBackground() {
    /* Sakura petals — drift across screen */
    const petals = useMemo(() => {
        return Array.from({ length: 25 }, (_, i) => {
            const size = Math.random() * 10 + 6
            return {
                id: i,
                left: `${Math.random() * 110 - 5}%`,
                size,
                opacity: Math.random() * 0.25 + 0.08,
                duration: `${Math.random() * 12 + 10}s`,
                delay: `${Math.random() * 12}s`,
                drift: Math.random() * 60 - 30,
                rotation: Math.random() * 360,
                color: Math.random() > 0.5
                    ? `rgba(255,179,217,${0.12 + Math.random() * 0.15})`
                    : `rgba(255,196,224,${0.1 + Math.random() * 0.12})`,
            }
        })
    }, [])

    /* Warm floating orbs — like distant lanterns or fireflies */
    const orbs = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 80 + 10}%`,
            size: Math.random() * 6 + 3,
            opacity: Math.random() * 0.15 + 0.05,
            pulseDuration: `${Math.random() * 6 + 4}s`,
            driftDuration: `${Math.random() * 20 + 15}s`,
            delay: `${Math.random() * 8}s`,
            color: Math.random() > 0.6
                ? `rgba(255,183,77,${0.08 + Math.random() * 0.1})`
                : `rgba(255,138,101,${0.06 + Math.random() * 0.08})`,
        }))
    }, [])

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden',
        }}>
            {/* Injected keyframes */}
            <style>{`
        @keyframes petalFall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(var(--rot));
            opacity: 0;
          }
          8% { opacity: var(--op); }
          85% { opacity: var(--op); }
          100% {
            transform: translateY(calc(100vh + 40px)) translateX(var(--drift)) rotate(calc(var(--rot) + 540deg));
            opacity: 0;
          }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(8px, -12px); }
          50% { transform: translate(-6px, 6px); }
          75% { transform: translate(10px, 8px); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: var(--op); box-shadow: 0 0 var(--glow) var(--color); }
          50% { opacity: calc(var(--op) * 1.6); box-shadow: 0 0 calc(var(--glow) * 1.5) var(--color); }
        }
      `}</style>

            {/* ═══ Atmospheric light shafts ═══ */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `
          radial-gradient(ellipse at 20% 30%, rgba(77,208,225,0.03) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(255,183,77,0.02) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 90%, rgba(45,27,78,0.06) 0%, transparent 50%)
        `,
            }} />

            {/* ═══ Diagonal light shaft (like sunlight through trees) ═══ */}
            <div style={{
                position: 'absolute',
                top: '-10%', right: '10%',
                width: '150px', height: '120%',
                background: 'linear-gradient(180deg, rgba(255,220,180,0.015) 0%, transparent 100%)',
                transform: 'rotate(20deg)',
                filter: 'blur(30px)',
            }} />

            {/* ═══ Sakura petals ═══ */}
            {petals.map(p => (
                <div key={p.id} style={{
                    position: 'absolute',
                    left: p.left,
                    top: '-20px',
                    width: `${p.size}px`,
                    height: `${p.size * 0.6}px`,
                    borderRadius: '50% 0 50% 0',
                    backgroundColor: p.color,
                    '--rot': `${p.rotation}deg`,
                    '--drift': `${p.drift}px`,
                    '--op': p.opacity,
                    animation: `petalFall ${p.duration} ${p.delay} linear infinite`,
                    filter: `blur(${p.size > 12 ? 1 : 0}px)`,
                }} />
            ))}

            {/* ═══ Floating warm orbs ═══ */}
            {orbs.map(o => (
                <div key={o.id} style={{
                    position: 'absolute',
                    left: o.left,
                    top: o.top,
                    width: `${o.size}px`,
                    height: `${o.size}px`,
                    borderRadius: '50%',
                    backgroundColor: o.color,
                    '--op': o.opacity,
                    '--glow': `${o.size * 3}px`,
                    '--color': o.color,
                    animation: `orbFloat ${o.driftDuration} ${o.delay} ease-in-out infinite, orbPulse ${o.pulseDuration} ${o.delay} ease-in-out infinite`,
                    boxShadow: `0 0 ${o.size * 3}px ${o.color}`,
                }} />
            ))}

            {/* ═══ Bottom mist ═══ */}
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0, height: '15%',
                background: 'linear-gradient(to top, rgba(45,27,78,0.12), transparent)',
                filter: 'blur(8px)',
            }} />
        </div>
    )
}
