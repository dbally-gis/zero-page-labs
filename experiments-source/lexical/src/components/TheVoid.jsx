import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Cloud } from '@react-three/drei'
import * as THREE from 'three'

export function TheVoid() {
    const groupRef = useRef()

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.02
        }
    })

    return (
        <group ref={groupRef}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <fog attach="fog" args={['#050505', 5, 50]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />

            {/* Subtle atmospheric clouds */}
            <Cloud opacity={0.1} speed={0.4} width={10} depth={1.5} segments={20} position={[0, -5, -10]} color="#111122" />
        </group>
    )
}
