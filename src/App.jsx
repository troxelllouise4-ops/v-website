import React, { useState, useCallback } from 'react'
import { ThemeProvider, useTheme } from './ThemeContext'
import StarfieldBackground from './components/StarfieldBackground'
import LandingScene from './components/LandingScene'
import GameSelect from './components/GameSelect'
import StarMemory from './components/games/StarMemory'
import CometTrace from './components/games/CometTrace'
import LanternCatch from './components/games/LanternCatch'
import GameBackground from './components/GameBackground'
import UnlockSequence from './components/UnlockSequence'
import LoveLetter from './components/LoveLetter'
import ControlButtons from './components/ControlButtons'
import useAudio from './hooks/useAudio'

function AppContent() {
  // landing | gameSelect | starMemory | cometTrace | lanternCatch | unlock | letter
  console.log("Version: Visuals Restored + Fixed Paths (Date: 2026-02-14)") // Debug log to confirm deployment
  const [scene, setScene] = useState('landing')
  const { isPlaying, toggle } = useAudio('music.mp3')
  const { theme } = useTheme()

  const handleBegin = useCallback(() => setScene('gameSelect'), [])
  const handleGameSelect = useCallback((gameId) => setScene(gameId), [])
  const handleWin = useCallback(() => setScene('unlock'), [])
  const handleOpenLetter = useCallback(() => setScene('letter'), [])
  const handleClose = useCallback(() => setScene('landing'), [])

  return (
    <>
      {/* ── Tree background — ONLY for Unlock & Letter scenes ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        overflow: 'hidden',
        // Show tree ONLY on letter scene as requested.
        opacity: (scene === 'letter') ? 1 : 0,
        transition: 'opacity 1s ease',
        pointerEvents: 'none',
      }}>
        <img
          src={theme === 'dark' ? 'images/tree-dark.svg' : 'images/tree.svg'}
          alt=""
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
            transition: 'opacity 0.5s ease',
          }}
        />
      </div>

      {/* Three.js animated overlay (transparent canvas) */}
      <StarfieldBackground scene={scene} theme={theme} />

      {/* Japanese-style ambient background — visible during game scenes */}{/* REMOVED per user request for "old website" */}
      {/* {['gameSelect', 'starMemory', 'cometTrace', 'lanternCatch'].includes(scene) && <GameBackground />} */}

      {/* Scene content */}
      {scene === 'landing' && <LandingScene onBegin={handleBegin} />}
      {scene === 'gameSelect' && <GameSelect onSelect={handleGameSelect} />}
      {scene === 'starMemory' && <StarMemory onWin={handleWin} />}
      {scene === 'cometTrace' && <CometTrace onWin={handleWin} />}
      {scene === 'lanternCatch' && <LanternCatch onWin={handleWin} />}
      {scene === 'unlock' && <UnlockSequence onComplete={handleOpenLetter} />}
      {scene === 'letter' && <LoveLetter onClose={handleClose} />}

      {/* Control buttons — always visible */}
      <ControlButtons isPlaying={isPlaying} onToggle={toggle} />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
