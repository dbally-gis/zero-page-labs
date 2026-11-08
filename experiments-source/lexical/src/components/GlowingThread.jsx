import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, Vector3, AdditiveBlending } from 'three'
import { Text } from '@react-three/drei'

// 3-stop perceptual gradient: sapphire → amber → aqua
// rare (0) = #1a6bff deep sapphire, mid (0.5) = #ff9500 amber, common (1) = #00ffe0 aqua
const FREQ_STOPS = [[26, 107, 255], [255, 149, 0], [0, 255, 224]]
function freqToColor(t) {
    const seg = t < 0.5 ? 0 : 1
    const u = t < 0.5 ? t * 2 : (t - 0.5) * 2
    const a = FREQ_STOPS[seg], b = FREQ_STOPS[seg + 1]
    const r = Math.round(a[0] * (1 - u) + b[0] * u)
    const g = Math.round(a[1] * (1 - u) + b[1] * u)
    const bv = Math.round(a[2] * (1 - u) + b[2] * u)
    return `rgb(${r},${g},${bv})`
}

export function GlowingThread({ path, hoveredIndex, onHover, wordFrequency = {}, symbolizeByFrequency = false }) {
    const pulseRef = useRef()

    useEffect(() => {
        if (pulseRef.current && pulseRef.current.material) {
            pulseRef.current.material.dashed = true;
            pulseRef.current.material.dashSize = 0.5;
            pulseRef.current.material.gapSize = 1.0;
            pulseRef.current.material.needsUpdate = true;
        }
    }, []);

    // Precompute max frequency for normalization
    const maxFreq = useMemo(() => {
        if (!symbolizeByFrequency || Object.keys(wordFrequency).length === 0) return 1
        return Math.max(...Object.values(wordFrequency))
    }, [wordFrequency, symbolizeByFrequency])

    const curve = useMemo(() => {
        if (!path.length) return null
        const points = path.map(p => new Vector3(
            (p.x - 0.5) * 4,
            (0.5 - p.y) * 4,
            (p.z - 0.5) * 8
        ))
        return new CatmullRomCurve3(points, false, 'catmullrom', 0.5)
    }, [path])

    useFrame(() => {
        if (pulseRef.current) {
            pulseRef.current.material.dashOffset -= 0.01
        }
    })

    if (!curve || path.length < 2) return null

    return (
        <group>
            {/* Layer 1: The Inner Hot Core */}
            <mesh>
                <tubeGeometry args={[curve, 128, 0.015, 8, false]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>

            {/* Layer 2: The Outer Plasma Shell */}
            <mesh>
                <tubeGeometry args={[curve, 128, 0.06, 12, false]} />
                <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={2.1}
                    transparent
                    opacity={0.2}
                    blending={AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>

            {/* Layer 3: The Pulsing Energy Current */}
            <mesh ref={pulseRef}>
                <tubeGeometry args={[curve, 128, 0.02, 8, false]} />
                <meshBasicMaterial
                    color="#b0edff"
                    transparent
                    opacity={0.58}
                    blending={AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>

            {/* Word Nodes */}
            {path.map((p, i) => {
                const pos = [
                    (p.x - 0.5) * 4,
                    (0.5 - p.y) * 4,
                    (p.z - 0.5) * 8
                ]
                const isHovered = i === hoveredIndex
                const isStart = i === 0
                const isEnd = i === path.length - 1

                // Frequency symbolization
                const freq = wordFrequency[p.word] || 1
                const normalizedFreq = symbolizeByFrequency ? Math.min(freq / maxFreq, 1) : 0
                const nodeColor = symbolizeByFrequency
                    ? freqToColor(normalizedFreq)
                    : (isStart ? '#00ff00' : isEnd ? '#ff0000' : '#ffff00')
                // Scale: 1x at min freq, up to 2.5x at max freq
                const freqScale = symbolizeByFrequency ? (1 + normalizedFreq * 1.5) : 1
                const baseRadius = symbolizeByFrequency ? 0.08 * freqScale : 0.08

                return (
                    <group key={i} position={pos}>
                        <mesh
                            scale={isHovered ? 1.5 : 1}
                            onPointerOver={(e) => { e.stopPropagation(); onHover(i) }}
                            onPointerOut={(e) => { e.stopPropagation(); onHover(null) }}
                        >
                            <sphereGeometry args={[baseRadius, 16, 16]} />
                            <meshStandardMaterial
                                color={nodeColor}
                                emissive={nodeColor}
                                emissiveIntensity={isHovered ? 5 : (symbolizeByFrequency ? 1 + normalizedFreq * 3 : 2)}
                                toneMapped={false}
                            />

                            {/* Outer Node Halo */}
                            {(isHovered || isStart || isEnd || (symbolizeByFrequency && normalizedFreq > 0.5)) && (
                                <mesh>
                                    <sphereGeometry args={[baseRadius * 1.8, 16, 16]} />
                                    <meshBasicMaterial
                                        color={nodeColor}
                                        transparent
                                        opacity={0.15 + normalizedFreq * 0.1}
                                        blending={AdditiveBlending}
                                        depthWrite={false}
                                    />
                                </mesh>
                            )}
                        </mesh>

                        {(isHovered || isStart || isEnd) && (
                            <Text
                                position={[0, 0.4, 0]}
                                fontSize={0.3}
                                color="white"
                                anchorX="center"
                                anchorY="middle"
                                outlineWidth={0.03}
                                outlineColor="#001133"
                                font="/experiments/lexical/fonts/share-tech-mono.ttf"
                            >
                                {p.word.toUpperCase()}{symbolizeByFrequency && isHovered ? ` ×${freq}` : ''}
                            </Text>
                        )}
                    </group>
                )
            })}
        </group>
    )
}
