import React, { useLayoutEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'

const PARTICLE_COUNT = 15000
const TEMP_OBJECT = new THREE.Object3D()
const TEMP_COLOR = new THREE.Color()

export function LexicalParticles() {
    const meshRef = useRef()
    const hoverRef = useRef(null) // Index of hovered particle
    const { raycaster, camera, mouse } = useThree()

    useLayoutEffect(() => {
        if (!meshRef.current) return

        // Initialize particles in a 3D grid representing the dictionary volume
        let i = 0
        for (let x = 0; x < 25; x++) {
            for (let y = 0; y < 20; y++) {
                for (let z = 0; z < 30; z++) {
                    if (i >= PARTICLE_COUNT) break

                    // Normalized coordinates (-2 to 2 range)
                    const px = (x / 25) * 4 - 2 + (Math.random() * 0.1)
                    const py = (y / 20) * 4 - 2 + (Math.random() * 0.1)
                    const pz = (z / 30) * 8 - 4 + (Math.random() * 0.1)

                    TEMP_OBJECT.position.set(px, py, pz)
                    TEMP_OBJECT.scale.setScalar(Math.random() * 0.5 + 0.5)
                    TEMP_OBJECT.updateMatrix()

                    meshRef.current.setMatrixAt(i, TEMP_OBJECT.matrix)

                    // Color gradient based on Z (depth)
                    const color = new THREE.Color().setHSL(z / 30, 0.8, 0.5)
                    meshRef.current.setColorAt(i, color)

                    i++
                }
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true
        meshRef.current.instanceColor.needsUpdate = true
    }, [])

    useFrame((state) => {
        if (!meshRef.current) return

        // Simple "breathing" animation for the entire cloud
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
        meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.05) * 0.02

        // Optional: Interactive raycasting could be added here for "hovering" over potential words
        // But for performance with 15k instances in JS, we might skip per-frame raycasting unless necessary.
    })

    const [hovered, setHovered] = useState(null)

    // Raycast handling for 15,000 instances
    const handlePointerMove = (e) => {
        e.stopPropagation()
        if (e.instanceId !== undefined) {
            setHovered({
                id: e.instanceId,
                position: new THREE.Vector3().setFromMatrixPosition(
                    new THREE.Matrix4().fromArray(meshRef.current.instanceMatrix.array, e.instanceId * 16)
                )
            })
            document.body.style.cursor = 'crosshair'
        }
    }

    const handlePointerOut = () => {
        setHovered(null)
        document.body.style.cursor = 'auto'
    }

    return (
        <group>
            <instancedMesh
                ref={meshRef}
                args={[null, null, PARTICLE_COUNT]}
                onPointerMove={handlePointerMove}
                onPointerOut={handlePointerOut}
            >
                <dodecahedronGeometry args={[0.02, 0]} />
                <meshBasicMaterial transparent opacity={0.4} blending={THREE.AdditiveBlending} />
            </instancedMesh>

            {/* Render HTML Tooltip if a particle is hovered */}
            {hovered && (
                <mesh position={hovered.position}>
                    <Html center>
                        <div style={{
                            background: 'rgba(0, 5, 16, 0.9)',
                            border: '1px solid #00f0ff',
                            padding: '4px 8px',
                            color: '#fff',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                            textTransform: 'uppercase'
                        }}>
                            NODE_{hovered.id}
                        </div>
                    </Html>
                </mesh>
            )}
        </group>
    )
}
