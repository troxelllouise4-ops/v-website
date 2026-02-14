import React, { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'

export default function StarfieldBackground({ scene, theme = 'dark' }) {
    const mountRef = useRef(null)
    const stateRef = useRef({})

    const setup = useCallback((container) => {
        if (!container || stateRef.current.renderer) return

        const width = window.innerWidth
        const height = window.innerHeight
        const isMobile = width < 768

        /* ── Renderer ── */
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(width, height)
        renderer.setClearColor(0x000000, 0)
        container.appendChild(renderer.domElement)

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
        camera.position.z = 1

        const threeScene = new THREE.Scene()

        /* ── Simple Twinkling Stars ── */
        const starCount = isMobile ? 1500 : 3000
        const starGeo = new THREE.BufferGeometry()
        const starPos = new Float32Array(starCount * 3)
        const starSizes = new Float32Array(starCount)
        const starPhases = new Float32Array(starCount)

        for (let i = 0; i < starCount; i++) {
            starPos[i * 3] = (Math.random() - 0.5) * 25
            starPos[i * 3 + 1] = (Math.random() - 0.5) * 25
            starPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5
            starSizes[i] = Math.random() * 2.0 + 0.5
            starPhases[i] = Math.random() * Math.PI * 2
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
        starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1))
        starGeo.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1))

        const starMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uAlpha: { value: 1.0 },
                uPixelRatio: { value: renderer.getPixelRatio() },
            },
            vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vOpacity;
        void main() {
          float twinkle = 0.5 + 0.5 * sin(uTime * 1.5 + aPhase);
          vOpacity = twinkle;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (100.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        uniform float uAlpha;
        varying float vOpacity;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity * uAlpha);
        }
      `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })

        const stars = new THREE.Points(starGeo, starMat)
        threeScene.add(stars)

        /* ── Animation loop ── */
        let frameId
        const clock = new THREE.Clock()

        const animate = () => {
            frameId = requestAnimationFrame(animate)
            const elapsed = clock.getElapsedTime()
            starMat.uniforms.uTime.value = elapsed

            // Gentle rotation
            stars.rotation.y = elapsed * 0.05

            renderer.render(threeScene, camera)
        }
        animate()

        /* ── Resize ── */
        const handleResize = () => {
            const w = window.innerWidth, h = window.innerHeight
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
        }
        window.addEventListener('resize', handleResize)

        stateRef.current = {
            renderer, camera, threeScene, stars, starMat, frameId, handleResize,
            starGeo
        }
    }, [])

    /* ── Theme dimming ── */
    useEffect(() => {
        const s = stateRef.current
        if (!s.starMat) return

        // Theme multiplier: dim in light mode
        const tm = theme === 'light' ? 0.3 : 1.0

        // Scene dimming
        if (scene === 'unlock' || scene === 'letter') {
            s.starMat.uniforms.uAlpha.value = 0.5 * tm
        } else {
            s.starMat.uniforms.uAlpha.value = 1.0 * tm
        }
    }, [scene, theme])

    /* ── Cleanup ── */
    useEffect(() => {
        return () => {
            const s = stateRef.current
            if (s.frameId) cancelAnimationFrame(s.frameId)
            if (s.handleResize) window.removeEventListener('resize', s.handleResize)
            if (s.renderer) {
                s.starGeo?.dispose()
                s.starMat?.dispose()
                s.renderer.dispose()
                s.renderer.domElement?.remove()
            }
        }
    }, [])

    return (
        <div
            ref={(el) => { mountRef.current = el; setup(el) }}
            style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        />
    )
}
