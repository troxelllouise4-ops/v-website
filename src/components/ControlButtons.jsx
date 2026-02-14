import React from 'react'
import { useTheme } from '../ThemeContext'

export default function ControlButtons({ isPlaying, onToggle }) {
    const { theme, toggleTheme } = useTheme()

    const btnStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: 'var(--glass-text)',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }

    const handleEnter = (e) => {
        e.currentTarget.style.background = 'var(--glass-hover)'
        e.currentTarget.style.transform = 'scale(1.1)'
    }
    const handleLeave = (e) => {
        e.currentTarget.style.background = 'var(--glass-bg)'
        e.currentTarget.style.transform = 'scale(1)'
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
        }}>
            {/* Theme toggle */}
            <button
                id="theme-toggle"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                style={btnStyle}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
                {theme === 'dark' ? (
                    /* Sun icon — switch to light */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                ) : (
                    /* Moon icon — switch to dark */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                )}
            </button>

            {/* Music toggle */}
            <button
                id="music-toggle"
                onClick={onToggle}
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
                style={btnStyle}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
                {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                )}
            </button>
        </div>
    )
}
