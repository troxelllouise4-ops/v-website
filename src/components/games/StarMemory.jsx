import React, { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { useTheme } from '../../ThemeContext'

const TOTAL_STARS = 12
const WIN_ROUND = 3
const INITIAL_SEQ_LEN = 3

function generateStarPositions() {
    const positions = []
    const cx = 50, cy = 50, r = 32
    for (let i = 0; i < TOTAL_STARS; i++) {
        const angle = (i / TOTAL_STARS) * Math.PI * 2 - Math.PI / 2
        positions.push({
            x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 8,
            y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 8,
        })
    }
    return positions
}

export default function StarMemory({ onWin }) {
    const { theme } = useTheme()
    const [starPositions] = useState(generateStarPositions)
    const [sequence, setSequence] = useState([])
    const [playerInput, setPlayerInput] = useState([])
    const [round, setRound] = useState(1)
    const [phase, setPhase] = useState('idle') // idle | showing | input | correct | wrong | win
    const [activeStar, setActiveStar] = useState(-1)
    const [clickedStar, setClickedStar] = useState(-1)
    const containerRef = useRef(null)
    const timeoutsRef = useRef([])

    const clearTimeouts = () => {
        timeoutsRef.current.forEach(clearTimeout)
        timeoutsRef.current = []
    }

    const addTimeout = (fn, ms) => {
        timeoutsRef.current.push(setTimeout(fn, ms))
    }

    /* Generate and show a new sequence */
    const startRound = useCallback((rnd) => {
        clearTimeouts()
        const len = INITIAL_SEQ_LEN + rnd - 1
        const seq = []
        for (let i = 0; i < len; i++) {
            let next
            do { next = Math.floor(Math.random() * TOTAL_STARS) } while (next === seq[seq.length - 1])
            seq.push(next)
        }
        setSequence(seq)
        setPlayerInput([])
        setPhase('showing')

        // Show sequence with delays
        seq.forEach((starIdx, i) => {
            addTimeout(() => setActiveStar(starIdx), (i + 1) * 700)
            addTimeout(() => setActiveStar(-1), (i + 1) * 700 + 450)
        })
        addTimeout(() => {
            setActiveStar(-1)
            setPhase('input')
        }, (seq.length + 1) * 700)
    }, [])

    /* Start first round on mount */
    useEffect(() => {
        addTimeout(() => startRound(1), 1200)
        return clearTimeouts
    }, [startRound])

    /* Handle star click */
    const handleStarClick = useCallback((idx) => {
        if (phase !== 'input') return

        const nextInput = [...playerInput, idx]
        setClickedStar(idx)

        // Check if correct
        if (idx !== sequence[nextInput.length - 1]) {
            setPhase('wrong')
            addTimeout(() => {
                setClickedStar(-1)
                setPhase('idle')
                setPlayerInput([])
                addTimeout(() => startRound(round), 800)
            }, 1000)
            return
        }

        addTimeout(() => setClickedStar(-1), 300)
        setPlayerInput(nextInput)

        // Check if sequence complete
        if (nextInput.length === sequence.length) {
            if (round >= WIN_ROUND) {
                setPhase('win')
                addTimeout(() => onWin(), 2000)
            } else {
                setPhase('correct')
                addTimeout(() => {
                    setRound(r => r + 1)
                    startRound(round + 1)
                }, 1200)
            }
        }
    }, [phase, playerInput, sequence, round, startRound, onWin])

    const statusText = {
        idle: 'Get ready...',
        showing: 'Watch carefully...',
        input: 'Your turn! Repeat the sequence',
        correct: 'Correct! ✨',
        wrong: 'Wrong! Try again...',
        win: '🎉 You did it!',
    }

    return (
        <div ref={containerRef} style={{
            position: 'fixed', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px', zIndex: 5 }}>
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.7rem', color: 'var(--text-muted)',
                    letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px',
                }}>
                    Round {round} of {WIN_ROUND}
                </p>
                <p style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                    color: phase === 'wrong' ? '#ff6b6b' : phase === 'correct' || phase === 'win' ? (theme === 'light' ? '#ff4d6d' : '#4dd0e1') : 'var(--text-heading)',
                    transition: 'color 0.3s',
                    textShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                    {statusText[phase]}
                </p>
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', zIndex: 5 }}>
                {Array.from({ length: WIN_ROUND }, (_, i) => (
                    <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: i < round - 1 ? (theme === 'light' ? '#ff4d6d' : '#4dd0e1')
                            : i === round - 1 ? (phase === 'correct' || phase === 'win' ? (theme === 'light' ? '#ff4d6d' : '#4dd0e1') : (theme === 'light' ? 'rgba(255, 77, 109, 0.4)' : 'rgba(77,208,225,0.3)'))
                                : 'var(--text-subtle)',
                        boxShadow: i < round ? '0 0 8px rgba(77,208,225,0.4)' : 'none',
                        transition: 'all 0.3s',
                    }} />
                ))}
            </div>

            {/* Star field */}
            <div style={{
                position: 'relative',
                width: 'min(80vw, 80vh, 500px)',
                height: 'min(80vw, 80vh, 500px)',
                zIndex: 5,
            }}>
                {starPositions.map((pos, i) => {
                    const isActive = activeStar === i
                    const isClicked = clickedStar === i
                    const isWrong = isClicked && phase === 'wrong'

                    return (
                        <div
                            key={i}
                            onClick={() => handleStarClick(i)}
                            style={{
                                position: 'absolute',
                                left: `${pos.x}%`,
                                top: `${pos.y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: isActive || isClicked ? '28px' : '16px',
                                height: isActive || isClicked ? '28px' : '16px',
                                borderRadius: '50%',
                                cursor: phase === 'input' ? 'pointer' : 'default',
                                background: isWrong ? '#ff6b6b'
                                    : isActive ? (theme === 'light' ? '#ff4d6d' : '#4dd0e1')
                                        : isClicked ? '#ffb74d'
                                            : 'var(--glass-border)',
                                boxShadow: isActive ? `0 0 25px ${theme === 'light' ? 'rgba(255, 77, 109, 0.8)' : 'rgba(77,208,225,0.8)'}, 0 0 50px ${theme === 'light' ? 'rgba(255, 77, 109, 0.4)' : 'rgba(77,208,225,0.4)'}`
                                    : isClicked ? '0 0 25px rgba(255,183,77,0.8)'
                                        : isWrong ? '0 0 25px rgba(255,107,107,0.8)'
                                            : '0 0 8px rgba(232,234,246,0.15)',
                                transition: 'all 0.2s ease',
                                zIndex: isActive || isClicked ? 10 : 1,
                            }}
                        />
                    )
                })}

                {/* Faint lines connecting sequence */}
                {phase === 'input' && playerInput.length > 0 && (
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                        {playerInput.map((starIdx, i) => {
                            if (i === 0) return null
                            const from = starPositions[playerInput[i - 1]]
                            const to = starPositions[starIdx]
                            return (
                                <line key={i}
                                    x1={`${from.x}%`} y1={`${from.y}%`}
                                    x2={`${to.x}%`} y2={`${to.y}%`}
                                    stroke="rgba(77,208,225,0.25)" strokeWidth="1"
                                />
                            )
                        })}
                    </svg>
                )}
            </div>
        </div>
    )
}
