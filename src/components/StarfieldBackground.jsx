import React, { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'

export default function StarfieldBackground({ scene }) {
    const mountRef = useRef(null)
    const stateRef = useRef({})

    const setup = useCallback((container) => {
        if (!container || stateRef.current.renderer) return

        const width = window.innerWidth
        const height = window.innerHeight
        const isMobile = width < 768

        /* renderer */
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(width, height)
        renderer.setClearColor(0x000000, 0)
        container.appendChild(renderer.domElement)

        /* camera */
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
        camera.position.z = 1

        /* scene */
        const threeScene = new THREE.Scene()

        /* stars */
        const starCount = isMobile ? 3000 : 6000
        const starGeo = new THREE.BufferGeometry()
        const starPos = new Float32Array(starCount * 3)
        const starSizes = new Float32Array(starCount)
        const starOpacities = new Float32Array(starCount)
        const starSpeeds = new Float32Array(starCount)

        for (let i = 0; i < starCount; i++) {
            starPos[i * 3] = (Math.random() - 0.5) * 20
            starPos[i * 3 + 1] = (Math.random() - 0.5) * 20
            starPos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 2
            starSizes[i] = Math.random() * 2.5 + 0.5
            starOpacities[i] = Math.random()
            starSpeeds[i] = Math.random() * 2 + 0.5
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
        starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1))
        starGeo.setAttribute('aOpacity', new THREE.BufferAttribute(starOpacities, 1))

        const starMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uAlpha: { value: 1.0 },
                uPixelRatio: { value: renderer.getPixelRatio() },
            },
            vertexShader: `
        attribute float aSize;
        attribute float aOpacity;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vOpacity;
        void main() {
          vOpacity = aOpacity * (0.5 + 0.5 * sin(uTime * aOpacity * 3.0 + aSize * 10.0));
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (150.0 / -mvPosition.z);
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
          strength = pow(strength, 1.5);
          gl_FragColor = vec4(0.85, 0.87, 0.95, strength * vOpacity * uAlpha);
        }
      `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })

        const stars = new THREE.Points(starGeo, starMat)
        threeScene.add(stars)

        /* comet */
        const cometGroup = new THREE.Group()
        const cometHeadGeo = new THREE.SphereGeometry(0.04, 12, 12)
        const cometHeadMat = new THREE.MeshBasicMaterial({
            color: 0x4dd0e1,
            transparent: true,
            opacity: 0.95,
        })
        const cometHead = new THREE.Mesh(cometHeadGeo, cometHeadMat)

        /* comet glow */
        const glowGeo = new THREE.SphereGeometry(0.1, 12, 12)
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x4dd0e1,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
        })
        const glow = new THREE.Mesh(glowGeo, glowMat)
        cometHead.add(glow)

        /* comet tail */
        const tailSegments = 60
        const tailPositions = new Float32Array(tailSegments * 3)
        const tailOpacities = new Float32Array(tailSegments)
        for (let i = 0; i < tailSegments; i++) {
            tailPositions[i * 3] = 0
            tailPositions[i * 3 + 1] = 0
            tailPositions[i * 3 + 2] = 0
            tailOpacities[i] = 1.0 - (i / tailSegments)
        }
        const tailGeo = new THREE.BufferGeometry()
        tailGeo.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3))
        tailGeo.setAttribute('aOpacity', new THREE.BufferAttribute(tailOpacities, 1))

        const tailMat = new THREE.ShaderMaterial({
            uniforms: {
                uAlpha: { value: 1.0 },
            },
            vertexShader: `
        attribute float aOpacity;
        varying float vOpacity;
        void main() {
          vOpacity = aOpacity;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = mix(4.0, 1.0, 1.0 - aOpacity);
        }
      `,
            fragmentShader: `
        uniform float uAlpha;
        varying float vOpacity;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float strength = 1.0 - (dist * 2.0);
          gl_FragColor = vec4(0.3, 0.8, 0.88, strength * vOpacity * uAlpha * 0.6);
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

        /* comet animation state */
        let cometT = Math.random()
        const cometPath = (t) => {
            const loopT = t % 1
            return {
                x: (loopT - 0.5) * 8,
                y: 2.5 - loopT * 3 + Math.sin(loopT * Math.PI) * 1.5,
                z: -3,
            }
        }

        /* camera drift */
        let camAngle = 0

        /* animation loop */
        let frameId
        const clock = new THREE.Clock()
        const animate = () => {
            frameId = requestAnimationFrame(animate)
            const elapsed = clock.getElapsedTime()

            /* star twinkle */
            starMat.uniforms.uTime.value = elapsed

            /* camera drift */
            camAngle += 0.0003
            camera.position.x = Math.sin(camAngle) * 0.15
            camera.position.y = Math.cos(camAngle * 0.7) * 0.1
            camera.lookAt(0, 0, 0)

            /* comet movement */
            cometT += 0.0004
            const cp = cometPath(cometT)
            cometHead.position.set(cp.x, cp.y, cp.z)

            /* update tail to trail behind */
            const tPos = tail.geometry.attributes.position.array
            for (let i = tailSegments - 1; i > 0; i--) {
                tPos[i * 3] = tPos[(i - 1) * 3]
                tPos[i * 3 + 1] = tPos[(i - 1) * 3 + 1]
                tPos[i * 3 + 2] = tPos[(i - 1) * 3 + 2]
            }
            tPos[0] = cp.x
            tPos[1] = cp.y
            tPos[2] = cp.z
            tail.geometry.attributes.position.needsUpdate = true

            renderer.render(threeScene, camera)
        }

        animate()

        /* resize handler */
        const handleResize = () => {
            const w = window.innerWidth
            const h = window.innerHeight
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
        }
        window.addEventListener('resize', handleResize)

        stateRef.current = {
            renderer, camera, threeScene, stars, starMat, tailMat,
            cometGroup, cometHead, cometHeadMat, glowMat, frameId, handleResize,
            starGeo, starSizes, tailGeo, cometHeadGeo, glowGeo, tail
        }
    }, [])

    /* Adjust opacity based on scene */
    useEffect(() => {
        const s = stateRef.current
        if (!s.starMat) return

        if (scene === 'game') {
            s.starMat.uniforms.uAlpha.value = 0.6
            s.tailMat.uniforms.uAlpha.value = 0.6
            s.cometHeadMat.opacity = 0.6
            s.glowMat.opacity = 0.15
        } else if (scene === 'unlock' || scene === 'letter') {
            s.starMat.uniforms.uAlpha.value = 0.25
            s.tailMat.uniforms.uAlpha.value = 0.15
            s.cometHeadMat.opacity = 0.15
            s.glowMat.opacity = 0.05
        } else {
            s.starMat.uniforms.uAlpha.value = 1.0
            s.tailMat.uniforms.uAlpha.value = 1.0
            s.cometHeadMat.opacity = 0.95
            s.glowMat.opacity = 0.25
        }
    }, [scene])

    /* Cleanup */
    useEffect(() => {
        return () => {
            const s = stateRef.current
            if (s.frameId) cancelAnimationFrame(s.frameId)
            if (s.handleResize) window.removeEventListener('resize', s.handleResize)
            if (s.renderer) {
                s.starGeo?.dispose()
                s.starMat?.dispose()
                s.tailGeo?.dispose()
                s.tailMat?.dispose()
                s.cometHeadGeo?.dispose()
                s.cometHeadMat?.dispose()
                s.glowGeo?.dispose()
                s.glowMat?.dispose()
                s.renderer.dispose()
                s.renderer.domElement?.remove()
            }
        }
    }, [])

    return (
        <div
            ref={(el) => {
                mountRef.current = el
                setup(el)
            }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    )
}
