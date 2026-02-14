import { useRef, useCallback, useState } from 'react'

export default function useAudio(src) {
    const audioRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)

    const toggle = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(src)
            audioRef.current.loop = true
            audioRef.current.volume = 0.3
        }
        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => { })
        }
    }, [src, isPlaying])

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            setIsPlaying(false)
        }
    }, [])

    return { isPlaying, toggle, stop }
}
