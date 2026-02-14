import React, { useState, useCallback } from 'react'
import StarfieldBackground from './components/StarfieldBackground'
import LandingScene from './components/LandingScene'
import GameScene from './components/GameScene'
import UnlockSequence from './components/UnlockSequence'
import LoveLetter from './components/LoveLetter'
import MusicToggle from './components/MusicToggle'
import useAudio from './hooks/useAudio'

export default function App() {
  const [scene, setScene] = useState('landing') // landing | game | unlock | letter
  const { isPlaying, toggle } = useAudio('/music.mp3')

  const handleBegin = useCallback(() => setScene('game'), [])
  const handleWin = useCallback(() => setScene('unlock'), [])
  const handleOpenLetter = useCallback(() => setScene('letter'), [])
  const handleClose = useCallback(() => setScene('landing'), [])

  return (
    <>
      {/* Background gradient */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: scene === 'unlock' || scene === 'letter'
          ? 'linear-gradient(180deg, #12183a 0%, #2d1b4e 40%, #432874 100%)'
          : 'linear-gradient(180deg, #0a0e27 0%, #1a1245 40%, #2d1b4e 100%)',
        transition: 'background 1.5s ease',
      }} />

      {/* Three.js starfield */}
      <StarfieldBackground scene={scene} />

      {/* Scene content */}
      {scene === 'landing' && <LandingScene onBegin={handleBegin} />}
      {scene === 'game' && <GameScene onWin={handleWin} />}
      {scene === 'unlock' && <UnlockSequence onComplete={handleOpenLetter} />}
      {scene === 'letter' && <LoveLetter onClose={handleClose} />}

      {/* Music toggle — always visible */}
      <MusicToggle isPlaying={isPlaying} onToggle={toggle} />
    </>
  )
}
