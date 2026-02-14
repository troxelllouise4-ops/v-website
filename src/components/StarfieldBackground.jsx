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

        /* ── Renderer (transparent so background image shows through) ── */
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(width, height)
        renderer.setClearColor(0x000000, 0)
        container.appendChild(renderer.domElement)

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
        camera.position.z = 1

        const threeScene = new THREE.Scene()

        /* ═══════════════════════════════════════════════
           LAYER 1: TWINKLING STARS
        ═══════════════════════════════════════════════ */
        const starCount = isMobile ? 2000 : 4500
        const starGeo = new THREE.BufferGeometry()
        const starPos = new Float32Array(starCount * 3)
        const starSizes = new Float32Array(starCount)
        const starPhases = new Float32Array(starCount)

        for (let i = 0; i < starCount; i++) {
            starPos[i * 3] = (Math.random() - 0.5) * 25
            // Bias stars toward upper half of screen
            const yBias = Math.random()
            starPos[i * 3 + 1] = (yBias * yBias) * 12 - 1
            starPos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 3
            starSizes[i] = Math.random() * 2.5 + 0.3
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
        varying float vSize;
        void main() {
          float twinkle = 0.3 + 0.7 * sin(uTime * 1.5 + aPhase);
          vOpacity = twinkle;
          vSize = aSize;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (120.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        uniform float uAlpha;
        varying float vOpacity;
        varying float vSize;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float strength = 1.0 - (dist * 2.0);
          strength = pow(strength, 1.8);
          vec3 color = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.95, 0.85), step(1.8, vSize));
          gl_FragColor = vec4(color, strength * vOpacity * uAlpha);
        }
      `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })

        const stars = new THREE.Points(starGeo, starMat)
        threeScene.add(stars)

        /* ═══════════════════════════════════════════════
           LAYER 2: VIVID TIAMAT COMET
        ═══════════════════════════════════════════════ */
        const cometGroup = new THREE.Group()

        // Bright white-cyan core
        const cometHeadGeo = new THREE.SphereGeometry(0.07, 16, 16)
        const cometHeadMat = new THREE.MeshBasicMaterial({
            color: 0xeefaff, transparent: true, opacity: 1.0,
            blending: THREE.AdditiveBlending,
        })
        const cometHead = new THREE.Mesh(cometHeadGeo, cometHeadMat)

        // Inner glow
        const innerGlowGeo = new THREE.SphereGeometry(0.18, 16, 16)
        const innerGlowMat = new THREE.MeshBasicMaterial({
            color: 0x4dd0e1, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending,
        })
        cometHead.add(new THREE.Mesh(innerGlowGeo, innerGlowMat))

        // Outer glow
        const outerGlowGeo = new THREE.SphereGeometry(0.4, 16, 16)
        const outerGlowMat = new THREE.MeshBasicMaterial({
            color: 0x26a3b5, transparent: true, opacity: 0.2,
            blending: THREE.AdditiveBlending,
        })
        cometHead.add(new THREE.Mesh(outerGlowGeo, outerGlowMat))

        // Long streaming tail
        const tailSegments = isMobile ? 80 : 150
        const tailPositions = new Float32Array(tailSegments * 3)
        const tailOpacities = new Float32Array(tailSegments)
        const tailSizesArr = new Float32Array(tailSegments)
        for (let i = 0; i < tailSegments; i++) {
            tailPositions[i * 3] = 0
            tailPositions[i * 3 + 1] = 0
            tailPositions[i * 3 + 2] = -3
            tailOpacities[i] = Math.pow(1.0 - (i / tailSegments), 1.5)
            tailSizesArr[i] = 4.0 * (1.0 - (i / tailSegments)) + 0.5
        }
        const tailGeo = new THREE.BufferGeometry()
        tailGeo.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3))
        tailGeo.setAttribute('aOpacity', new THREE.BufferAttribute(tailOpacities, 1))
        tailGeo.setAttribute('aSize', new THREE.BufferAttribute(tailSizesArr, 1))

        const tailMat = new THREE.ShaderMaterial({
            uniforms: { uAlpha: { value: 1.0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
            vertexShader: `
        attribute float aOpacity;
        attribute float aSize;
        uniform float uPixelRatio;
        varying float vOpacity;
        void main() {
          vOpacity = aOpacity;
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
          float strength = 1.0 - (dist * 2.0);
          strength = pow(strength, 1.3);
          vec3 color = mix(vec3(0.15, 0.6, 0.7), vec3(0.4, 0.9, 0.95), vOpacity);
          gl_FragColor = vec4(color, strength * vOpacity * uAlpha * 0.85);
        }
      `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })

        const tail = new THREE.Points(tailGeo, tailMat)
        cometGroup.add(cometHead)
        cometGroup.add(tail)
        threeScene.add(cometGroup)

        /* ═══════════════════════════════════════════════
           LAYER 3: BOKEH PARTICLES (warm lens flares)
        ═══════════════════════════════════════════════ */
        const bokehCount = isMobile ? 6 : 14
        const bokehGeo = new THREE.BufferGeometry()
        const bokehPos = new Float32Array(bokehCount * 3)
        const bokehSizes = new Float32Array(bokehCount)
        const bokehPhases = new Float32Array(bokehCount)

        for (let i = 0; i < bokehCount; i++) {
            bokehPos[i * 3] = (Math.random() - 0.5) * 12
            bokehPos[i * 3 + 1] = (Math.random() - 0.5) * 8
            bokehPos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2
            bokehSizes[i] = Math.random() * 12 + 6
            bokehPhases[i] = Math.random() * Math.PI * 2
        }

        bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3))
        bokehGeo.setAttribute('aSize', new THREE.BufferAttribute(bokehSizes, 1))
        bokehGeo.setAttribute('aPhase', new THREE.BufferAttribute(bokehPhases, 1))

        const bokehMat = new THREE.ShaderMaterial({
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
        varying float vPhase;
        void main() {
          vPhase = aPhase;
          vec3 pos = position;
          pos.y += sin(uTime * 0.3 + aPhase) * 0.15;
          pos.x += cos(uTime * 0.2 + aPhase * 1.3) * 0.1;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aSize * uPixelRatio * (60.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        uniform float uAlpha;
        uniform float uTime;
        varying float vPhase;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float strength = 1.0 - smoothstep(0.0, 0.5, dist);
          strength = pow(strength, 3.0);
          float pulse = 0.5 + 0.5 * sin(uTime * 0.5 + vPhase);
          vec3 color = mix(vec3(1.0, 0.72, 0.3), vec3(1.0, 0.6, 0.7), sin(vPhase) * 0.5 + 0.5);
          gl_FragColor = vec4(color, strength * pulse * 0.07 * uAlpha);
        }
      `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })

        const bokeh = new THREE.Points(bokehGeo, bokehMat)
        threeScene.add(bokeh)

        /* ═══════════════════════════════════════════════
           LAYER 4: SHOOTING STARS
        ═══════════════════════════════════════════════ */
        const shootingStars = []
        const maxShootingStars = isMobile ? 1 : 3

        function createShootingStar() {
            const segments = 20
            const geo = new THREE.BufferGeometry()
            const positions = new Float32Array(segments * 3)
            const opacities = new Float32Array(segments)
            for (let i = 0; i < segments; i++) {
                positions[i * 3] = 0; positions[i * 3 + 1] = 0; positions[i * 3 + 2] = -3
                opacities[i] = 1.0 - (i / segments)
            }
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
            geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))

            const mat = new THREE.ShaderMaterial({
                vertexShader: `
          attribute float aOpacity;
          varying float vOpacity;
          void main() {
            vOpacity = aOpacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = mix(1.0, 3.5, aOpacity) * ${renderer.getPixelRatio().toFixed(1)};
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
                fragmentShader: `
          varying float vOpacity;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float s = 1.0 - dist * 2.0;
            gl_FragColor = vec4(1.0, 0.95, 0.85, s * vOpacity * 0.9);
          }
        `,
                transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            })

            const points = new THREE.Points(geo, mat)
            threeScene.add(points)
            return { points, geo, mat, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, active: false }
        }

        for (let i = 0; i < maxShootingStars; i++) shootingStars.push(createShootingStar())

        function activateShootingStar(ss) {
            ss.x = (Math.random() - 0.3) * 10
            ss.y = Math.random() * 5 + 2
            const angle = Math.random() * 0.4 + 0.8
            ss.vx = -Math.cos(angle) * (Math.random() * 3 + 4)
            ss.vy = -Math.sin(angle) * (Math.random() * 3 + 4)
            ss.life = 0
            ss.maxLife = Math.random() * 0.6 + 0.3
            ss.active = true
        }

        /* ── Comet path — diagonal sweep across upper portion ── */
        let cometT = 0.1
        const cometPath = (t) => {
            const loopT = ((t % 1) + 1) % 1
            return {
                x: 7 - loopT * 14,
                y: 5 - loopT * 5 + Math.sin(loopT * Math.PI * 0.7) * 2.5,
                z: -3.5,
            }
        }

        /* ── Mouse parallax ── */
        let mouseX = 0, mouseY = 0
        const handleMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener('mousemove', handleMouseMove)

        /* ── Animation loop ── */
        let frameId, camAngle = 0, lastShootingStarTime = 0
        const clock = new THREE.Clock()

        const animate = () => {
            frameId = requestAnimationFrame(animate)
            const elapsed = clock.getElapsedTime()

            starMat.uniforms.uTime.value = elapsed
            bokehMat.uniforms.uTime.value = elapsed

            // Camera drift + parallax
            camAngle += 0.0002
            camera.position.x = Math.sin(camAngle) * 0.08 + mouseX * 0.06
            camera.position.y = Math.cos(camAngle * 0.7) * 0.05 - mouseY * 0.04
            camera.lookAt(0, 0, -2)

            // Comet
            cometT += 0.0003
            const cp = cometPath(cometT)
            cometHead.position.set(cp.x, cp.y, cp.z)

            const tPos = tail.geometry.attributes.position.array
            for (let i = tailSegments - 1; i > 0; i--) {
                tPos[i * 3] = tPos[(i - 1) * 3]
                tPos[i * 3 + 1] = tPos[(i - 1) * 3 + 1]
                tPos[i * 3 + 2] = tPos[(i - 1) * 3 + 2]
            }
            tPos[0] = cp.x; tPos[1] = cp.y; tPos[2] = cp.z
            tail.geometry.attributes.position.needsUpdate = true

            // Shooting stars
            if (elapsed - lastShootingStarTime > (Math.random() * 3 + 2)) {
                const inactive = shootingStars.find(s => !s.active)
                if (inactive) { activateShootingStar(inactive); lastShootingStarTime = elapsed }
            }
            shootingStars.forEach(ss => {
                if (!ss.active) return
                ss.life += 0.016
                if (ss.life >= ss.maxLife) { ss.active = false; return }
                ss.x += ss.vx * 0.016; ss.y += ss.vy * 0.016
                const p = ss.geo.attributes.position.array
                for (let i = 19; i > 0; i--) { p[i * 3] = p[(i - 1) * 3]; p[i * 3 + 1] = p[(i - 1) * 3 + 1]; p[i * 3 + 2] = p[(i - 1) * 3 + 2] }
                p[0] = ss.x; p[1] = ss.y; p[2] = -3
                ss.geo.attributes.position.needsUpdate = true
            })

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
            renderer, camera, threeScene, stars, starMat, tailMat,
            cometHead, cometHeadMat, innerGlowMat, outerGlowMat,
            bokeh, bokehMat, frameId, handleResize, handleMouseMove,
            starGeo, tailGeo, cometHeadGeo, innerGlowGeo, outerGlowGeo,
            bokehGeo, shootingStars, tail,
        }
    }, [])

    /* ── Scene-based visibility + theme dimming ── */
    useEffect(() => {
        const s = stateRef.current
        if (!s.starMat) return

        // Theme multiplier: dim everything in light mode
        const tm = theme === 'light' ? 0.15 : 1.0

        if (scene === 'game') {
            s.starMat.uniforms.uAlpha.value = 0.5 * tm
            s.tailMat.uniforms.uAlpha.value = 0.5 * tm
            s.cometHeadMat.opacity = 0.5 * tm
            s.innerGlowMat.opacity = 0.2 * tm
            s.outerGlowMat.opacity = 0.08 * tm
            s.bokehMat.uniforms.uAlpha.value = 0.3 * tm
        } else if (scene === 'unlock' || scene === 'letter') {
            s.starMat.uniforms.uAlpha.value = 0.2 * tm
            s.tailMat.uniforms.uAlpha.value = 0.1 * tm
            s.cometHeadMat.opacity = 0.1 * tm
            s.innerGlowMat.opacity = 0.05 * tm
            s.outerGlowMat.opacity = 0.02 * tm
            s.bokehMat.uniforms.uAlpha.value = 0.15 * tm
        } else {
            s.starMat.uniforms.uAlpha.value = 1.0 * tm
            s.tailMat.uniforms.uAlpha.value = 1.0 * tm
            s.cometHeadMat.opacity = 1.0 * tm
            s.innerGlowMat.opacity = 0.5 * tm
            s.outerGlowMat.opacity = 0.2 * tm
            s.bokehMat.uniforms.uAlpha.value = 1.0 * tm
        }
    }, [scene, theme])

    /* ── Cleanup ── */
    useEffect(() => {
        return () => {
            const s = stateRef.current
            if (s.frameId) cancelAnimationFrame(s.frameId)
            if (s.handleResize) window.removeEventListener('resize', s.handleResize)
            if (s.handleMouseMove) window.removeEventListener('mousemove', s.handleMouseMove)
            if (s.renderer) {
                ;[s.starGeo, s.tailGeo, s.cometHeadGeo, s.innerGlowGeo, s.outerGlowGeo, s.bokehGeo]
                    .forEach(g => g?.dispose())
                    ;[s.starMat, s.tailMat, s.cometHeadMat, s.innerGlowMat, s.outerGlowMat, s.bokehMat]
                        .forEach(m => m?.dispose())
                s.shootingStars?.forEach(ss => { ss.geo?.dispose(); ss.mat?.dispose() })
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
