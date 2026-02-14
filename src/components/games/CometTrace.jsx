import React, { useState, useEffect, useRef, useCallback } from 'react'

const PATHS = [
    { start: { x: 10, y: 30 }, cp1: { x: 30, y: 10 }, cp2: { x: 70, y: 10 }, end: { x: 90, y: 40 } },
    { start: { x: 85, y: 15 }, cp1: { x: 60, y: 5 }, cp2: { x: 40, y: 50 }, end: { x: 15, y: 35 } },
    { start: { x: 10, y: 20 }, cp1: { x: 50, y: 80 }, cp2: { x: 50, y: 80 }, end: { x: 90, y: 25 } },
    { start: { x: 90, y: 60 }, cp1: { x: 65, y: 15 }, cp2: { x: 35, y: 85 }, end: { x: 10, y: 40 } },
    { start: { x: 15, y: 70 }, cp1: { x: 30, y: 10 }, cp2: { x: 70, y: 90 }, end: { x: 85, y: 20 } },
]

function cubicBezier(t, p0, p1, p2, p3) {
    const u = 1 - t
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

function getPathPoints(path, segments = 80) {
    const pts = []
    for (let i = 0; i <= segments; i++) {
        const t = i / segments
        pts.push({
            x: cubicBezier(t, path.start.x, path.cp1.x, path.cp2.x, path.end.x),
            y: cubicBezier(t, path.start.y, path.cp1.y, path.cp2.y, path.end.y),
        })
    }
    return pts
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

const WIN_ACCURACY = 65
const TOTAL_ROUNDS = 5

export default function CometTrace({ onWin }) {
    const [round, setRound] = useState(0)
    const [phase, setPhase] = useState('watching')
    const [trailPoints, setTrailPoints] = useState([])
    const [playerPoints, setPlayerPoints] = useState([])
    const [cometHead, setCometHead] = useState(null)
    const [accuracy, setAccuracy] = useState(null)
    const [accuracies, setAccuracies] = useState([])
    const [trailVisible, setTrailVisible] = useState(true)
    const containerRef = useRef(null)
    const isDrawing = useRef(false)
    const animRef = useRef(null)
    const pathPoints = useRef(getPathPoints(PATHS[0]))

    useEffect(() => {
        pathPoints.current = getPathPoints(PATHS[round])
    }, [round])

    /* Animate comet */
    useEffect(() => {
        if (phase !== 'watching') return
        setTrailPoints([])
        setPlayerPoints([])
        setAccuracy(null)
        setCometHead(null)
        setTrailVisible(true)

        const pts = pathPoints.current
        let frame = 0
        const totalFrames = 90
        const trail = []

        const animate = () => {
            frame++
            const t = Math.min(frame / totalFrames, 1)
            const idx = Math.floor(t * (pts.length - 1))
            const pt = pts[idx]
            trail.push(pt)
            setTrailPoints([...trail])
            setCometHead(pt)

            if (t < 1) {
                animRef.current = requestAnimationFrame(animate)
            } else {
                setCometHead(null)
                setTimeout(() => {
                    setTrailVisible(false)
                    setPhase('tracing')
                }, 600)
                setTimeout(() => {
                    setTrailPoints([])
                }, 2500 + round * 200)
            }
        }

        animRef.current = requestAnimationFrame(animate)
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
    }, [phase, round])

    /* Mouse/touch handlers */
    const getRelativePos = useCallback((e) => {
        const rect = containerRef.current?.querySelector('.trace-area')?.getBoundingClientRect()
        if (!rect) return null
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        return {
            x: ((clientX - rect.left) / rect.width) * 100,
            y: ((clientY - rect.top) / rect.height) * 100,
        }
    }, [])

    const handlePointerDown = useCallback((e) => {
        if (phase !== 'tracing') return
        e.preventDefault()
        isDrawing.current = true
        const pos = getRelativePos(e)
        if (pos) setPlayerPoints([pos])
    }, [phase, getRelativePos])

    const handlePointerMove = useCallback((e) => {
        if (!isDrawing.current || phase !== 'tracing') return
        e.preventDefault()
        const pos = getRelativePos(e)
        if (pos) setPlayerPoints(prev => [...prev, pos])
    }, [phase, getRelativePos])

    const handlePointerUp = useCallback(() => {
        if (!isDrawing.current) return
        isDrawing.current = false

        const pts = pathPoints.current
        if (playerPoints.length < 5) {
            setAccuracy(0)
            setPhase('result')
            return
        }

        let totalDist = 0
        playerPoints.forEach(pp => {
            let minD = Infinity
            pts.forEach(tp => {
                const d = distance(pp, tp)
                if (d < minD) minD = d
            })
            totalDist += minD
        })

        const avgDist = totalDist / playerPoints.length
        const acc = Math.max(0, Math.min(100, Math.round(100 - avgDist * 2.5)))
        setAccuracy(acc)

        const newAccuracies = [...accuracies, acc]
        setAccuracies(newAccuracies)

        if (round >= TOTAL_ROUNDS - 1) {
            const avg = Math.round(newAccuracies.reduce((a, b) => a + b, 0) / newAccuracies.length)
            if (avg >= WIN_ACCURACY) {
                setPhase('win')
                setTimeout(() => onWin(), 2000)
            } else {
                setPhase('result')
            }
        } else {
            setPhase('result')
        }
    }, [playerPoints, accuracies, round, onWin])

    const nextRound = useCallback(() => {
        if (round < TOTAL_ROUNDS - 1) {
            setRound(r => r + 1)
            setPhase('watching')
        }
    }, [round])

    const avgAccuracy = accuracies.length > 0
        ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length) : 0

    /* Build SVG polyline string from points */
    const toPolyline = (pts) => pts.map(p => `${p.x},${p.y}`).join(' ')

    return (
        <div ref={containerRef} style={{
            position: 'fixed', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            userSelect: 'none',
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px', zIndex: 5 }}>
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.7rem', color: 'var(--text-muted)',
                    letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px',
                }}>
                    Round {round + 1} of {TOTAL_ROUNDS}
                    {accuracies.length > 0 && ` — Avg: ${avgAccuracy}%`}
                </p>
                <p style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                    color: phase === 'win' ? '#4dd0e1'
                        : accuracy !== null && accuracy < WIN_ACCURACY ? '#ff8a65' : 'var(--text-heading)',
                    textShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                    {phase === 'watching' ? 'Watch the comet...'
                        : phase === 'tracing' ? 'Now trace its path!'
                            : phase === 'win' ? `🎉 Average: ${avgAccuracy}% — You did it!`
                                : `Accuracy: ${accuracy}%`}
                </p>
            </div>

            {/* Tracing area */}
            <div
                className="trace-area"
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                style={{
                    position: 'relative',
                    width: 'min(85vw, 85vh, 550px)',
                    height: 'min(65vw, 65vh, 420px)',
                    zIndex: 5,
                    cursor: phase === 'tracing' ? 'crosshair' : 'default',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.15)',
                }}
            >
                <svg viewBox="0 0 100 100" preserveAspectRatio="none"
                    style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                    <defs>
                        {/* Comet trail glow — triple layer */}
                        <filter id="cometGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1.2" result="blur1" />
                            <feGaussianBlur stdDeviation="0.4" in="SourceGraphic" result="sharp" />
                            <feMerge>
                                <feMergeNode in="blur1" />
                                <feMergeNode in="sharp" />
                            </feMerge>
                        </filter>
                        {/* Outer glow for comet */}
                        <filter id="cometOuterGlow" x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur stdDeviation="2.5" />
                        </filter>
                        {/* Player trace glow */}
                        <filter id="playerGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1" result="blur" />
                            <feGaussianBlur stdDeviation="0.3" in="SourceGraphic" result="sharp" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="sharp" />
                            </feMerge>
                        </filter>
                        <filter id="playerOuterGlow" x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur stdDeviation="2" />
                        </filter>
                        {/* Comet head glow */}
                        <radialGradient id="headGrad">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                            <stop offset="30%" stopColor="#b2ebf2" stopOpacity="0.9" />
                            <stop offset="60%" stopColor="#4dd0e1" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#4dd0e1" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* ═══ COMET TRAIL — glowing cyan line ═══ */}
                    {trailPoints.length > 1 && trailVisible && (
                        <>
                            {/* Outer diffuse glow */}
                            <polyline
                                points={toPolyline(trailPoints)}
                                fill="none" stroke="#4dd0e1" strokeWidth="4"
                                filter="url(#cometOuterGlow)"
                                opacity="0.3" strokeLinecap="round" strokeLinejoin="round"
                            />
                            {/* Core bright line */}
                            <polyline
                                points={toPolyline(trailPoints)}
                                fill="none" stroke="#80deea" strokeWidth="1.5"
                                filter="url(#cometGlow)"
                                opacity={phase === 'tracing' ? 0.4 : 0.85}
                                strokeLinecap="round" strokeLinejoin="round"
                                style={{ transition: 'opacity 0.8s' }}
                            />
                            {/* Inner white-hot core */}
                            <polyline
                                points={toPolyline(trailPoints)}
                                fill="none" stroke="#e0f7fa" strokeWidth="0.5"
                                opacity={phase === 'tracing' ? 0.2 : 0.6}
                                strokeLinecap="round" strokeLinejoin="round"
                                style={{ transition: 'opacity 0.8s' }}
                            />
                        </>
                    )}

                    {/* ═══ COMET HEAD — radial glow ═══ */}
                    {cometHead && (
                        <>
                            <circle cx={cometHead.x} cy={cometHead.y} r="4" fill="url(#headGrad)" />
                            <circle cx={cometHead.x} cy={cometHead.y} r="1.2" fill="#ffffff" opacity="0.95" />
                        </>
                    )}

                    {/* ═══ PLAYER TRACE — glowing golden line ═══ */}
                    {playerPoints.length > 1 && (
                        <>
                            {/* Outer warm glow */}
                            <polyline
                                points={toPolyline(playerPoints)}
                                fill="none" stroke="#ffb74d" strokeWidth="3.5"
                                filter="url(#playerOuterGlow)"
                                opacity="0.35" strokeLinecap="round" strokeLinejoin="round"
                            />
                            {/* Core line */}
                            <polyline
                                points={toPolyline(playerPoints)}
                                fill="none" stroke="#ffe082" strokeWidth="1.2"
                                filter="url(#playerGlow)"
                                opacity="0.85" strokeLinecap="round" strokeLinejoin="round"
                            />
                            {/* Inner bright core */}
                            <polyline
                                points={toPolyline(playerPoints)}
                                fill="none" stroke="#fff8e1" strokeWidth="0.4"
                                opacity="0.6" strokeLinecap="round" strokeLinejoin="round"
                            />
                            {/* Current draw position dot */}
                            {playerPoints.length > 0 && (
                                <circle
                                    cx={playerPoints[playerPoints.length - 1].x}
                                    cy={playerPoints[playerPoints.length - 1].y}
                                    r="1.5" fill="#ffe082" opacity="0.9"
                                />
                            )}
                        </>
                    )}
                </svg>
            </div>

            {/* Next / Retry */}
            {phase === 'result' && round < TOTAL_ROUNDS - 1 && (
                <button onClick={nextRound} style={{
                    marginTop: '20px', padding: '10px 28px',
                    fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 500,
                    color: 'var(--text-primary)', background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px', cursor: 'pointer', backdropFilter: 'blur(8px)', zIndex: 5,
                }}>Next Comet →</button>
            )}
            {phase === 'result' && round >= TOTAL_ROUNDS - 1 && avgAccuracy < WIN_ACCURACY && (
                <button onClick={() => { setRound(0); setAccuracies([]); setPhase('watching') }} style={{
                    marginTop: '20px', padding: '10px 28px',
                    fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 500,
                    color: 'var(--text-primary)', background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px', cursor: 'pointer', backdropFilter: 'blur(8px)', zIndex: 5,
                }}>Try Again (need {WIN_ACCURACY}% avg)</button>
            )}
        </div>
    )
}
