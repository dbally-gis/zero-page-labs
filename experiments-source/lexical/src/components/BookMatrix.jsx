import { indexWords } from '../word-maps.js'
import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, DoubleSide, BufferGeometry, Float32BufferAttribute } from 'three'
import { Environment, Text, Line } from '@react-three/drei'

// ─── Book layout constants ────────────────────────────────────────────────────
const WORDS_PER_LINE = 10
const LINES_PER_PAGE = 25
const WORDS_PER_PAGE = WORDS_PER_LINE * LINES_PER_PAGE   // 250

// ─── Static page dimensions ───────────────────────────────────────────────────
const PAGE_W = 3.5   // X — page width
const PAGE_H = 5.0   // Y — page height (portrait)
const PAGE_MARGIN_X = 0.28
const PAGE_MARGIN_Y = 0.32
const TEXT_W = PAGE_W - PAGE_MARGIN_X * 2
const TEXT_H = PAGE_H - PAGE_MARGIN_Y * 2

// ─── Library colour palette ───────────────────────────────────────────────────
const WORD_COLORS = [
    '#c0392b',   // crimson
    '#2980b9',   // deep ink blue
    '#27ae60',   // forest green
    '#d4ac0d',   // amber gold
    '#8e44ad',   // plum / violet
    '#1abc9c',   // teal ink
    '#e67e22',   // burnt sienna
    '#2c3e50',   // dark slate navy
]

// ─── Coordinate mapper (pageDepth is live) ───────────────────────────────────
function wordPosition(index, pageDepth) {
    const indexOnPage = index % WORDS_PER_PAGE
    const col = indexOnPage % WORDS_PER_LINE
    const lineOnPage = Math.floor(indexOnPage / WORDS_PER_LINE)
    const page = Math.floor(index / WORDS_PER_PAGE)
    const x = -PAGE_W / 2 + PAGE_MARGIN_X + (col / (WORDS_PER_LINE - 1)) * TEXT_W
    const y = PAGE_H / 2 - PAGE_MARGIN_Y - (lineOnPage / (LINES_PER_PAGE - 1)) * TEXT_H
    const z = -page * pageDepth
    return [x, y, z]
}

// ─── Shared ruled-line geometry (built once, reused by every page slab) ──────
const RULED_LINES_GEO = (() => {
    const pts = []
    const xL = -PAGE_W / 2 + PAGE_MARGIN_X
    const xR = PAGE_W / 2 - PAGE_MARGIN_X
    for (let li = 0; li < LINES_PER_PAGE; li++) {
        const ly = PAGE_H / 2 - PAGE_MARGIN_Y - (li / (LINES_PER_PAGE - 1)) * TEXT_H
        pts.push(xL, ly, 0.002, xR, ly, 0.002)
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(pts, 3))
    return geo
})()

// ─── Outlines for white-bordered transparent panels ──────────────────────────
const PAGE_BORDER_POINTS = [
    [-PAGE_W / 2, -PAGE_H / 2, 0],
    [ PAGE_W / 2, -PAGE_H / 2, 0],
    [ PAGE_W / 2,  PAGE_H / 2, 0],
    [-PAGE_W / 2,  PAGE_H / 2, 0],
    [-PAGE_W / 2, -PAGE_H / 2, 0]
]

// ─── Single page slab ─────────────────────────────────────────────────────────
function PageSlab({ pageIndex, pageDepth, pageOpacity }) {
    const z = -pageIndex * pageDepth
    return (
        <group position={[0, 0, z]}>
            {/* Transparent page face */}
            <mesh>
                <planeGeometry args={[PAGE_W, PAGE_H]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={pageOpacity}
                    side={DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* White border */}
            <Line
                points={PAGE_BORDER_POINTS}
                color="#ffffff"
                lineWidth={1}
                transparent
                opacity={0.35}
                depthWrite={false}
            />

            {/* Ruled lines */}
            <lineSegments geometry={RULED_LINES_GEO}>
                <lineBasicMaterial color="#ffffff" transparent opacity={0.08} depthWrite={false} />
            </lineSegments>
        </group>
    )
}

// ─── Page labels ─────────────────────────────────────────────────────────────
function PageLabels({ totalPages, step, pageDepth }) {
    const labels = []
    for (let p = 0; p <= totalPages; p += step) labels.push(p)
    return (
        <group>
            {labels.map(p => (
                <Text
                    key={p}
                    position={[PAGE_W / 2 + 0.35, -PAGE_H / 2 - 0.25, -p * pageDepth]}
                    fontSize={0.15} color="#8a7a5a" anchorX="left" anchorY="top"
                    font="/experiments/lexical/fonts/share-tech-mono.ttf"
                >
                    {`pg.${p + 1}`}
                </Text>
            ))}
        </group>
    )
}

// ─── Single word-thread ───────────────────────────────────────────────────────
function WordThread({ word, indices, color, isSelected, pageDepth, hoverLabelsEnabled, onHoverWord }) {
    const glowRef = useRef()
    useFrame(({ clock }) => {
        if (glowRef.current && isSelected)
            glowRef.current.material.opacity = 0.45 + Math.sin(clock.elapsedTime * 2.5) * 0.2
    })
    const positions = useMemo(() => indices.map(i => wordPosition(i, pageDepth)), [indices, pageDepth])
    const linePoints = useMemo(() => positions.map(p => new Vector3(...p)), [positions])
    if (positions.length < 1) return null
    return (
        <group>
            {positions.length > 1 && (
                <>
                    <Line points={linePoints} color={color} lineWidth={isSelected ? 2 : 1} opacity={isSelected ? 0.85 : 0.35} transparent />
                    {isSelected && (
                        <Line ref={glowRef} points={linePoints} color={color} lineWidth={6} opacity={0.15} transparent />
                    )}
                </>
            )}
            {positions.map((pos, i) => (
                <group key={i} position={pos}>
                    <mesh
                        onPointerOver={(event) => {
                            if (!hoverLabelsEnabled) return
                            event.stopPropagation()
                            onHoverWord({
                                word,
                                color,
                                index: indices[i],
                                position: pos,
                            })
                        }}
                        onPointerOut={(event) => {
                            if (!hoverLabelsEnabled) return
                            event.stopPropagation()
                            onHoverWord(null)
                        }}
                    >
                        <sphereGeometry args={[isSelected ? 0.05 : 0.025, 8, 8]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 1.5 : 0.5} roughness={0.4} toneMapped={false} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

// ─── Hovered word label ──────────────────────────────────────────────────────
function HoverWordLabel({ hoverWord }) {
    if (!hoverWord) return null
    const pageNumber = Math.floor(hoverWord.index / WORDS_PER_PAGE) + 1
    const [x, y, z] = hoverWord.position
    return (
        <group position={[x + 0.12, y + 0.16, z + 0.04]}>
            <mesh position={[0.26, 0, -0.006]}>
                <planeGeometry args={[0.66, 0.18]} />
                <meshBasicMaterial color="#0b0d08" transparent opacity={0.78} depthWrite={false} />
            </mesh>
            <Text
                position={[0, 0, 0]}
                fontSize={0.105}
                color={hoverWord.color}
                anchorX="left"
                anchorY="middle"
                font="/experiments/lexical/fonts/share-tech-mono.ttf"
            >
                {`${hoverWord.word} pg.${pageNumber}`}
            </Text>
        </group>
    )
}

// ─── Editorial focus anchors ─────────────────────────────────────────────────
function FocusPoints({ wordIndices, selectedWords, topWords, pageDepth }) {
    const pulseRef = useRef()
    useFrame(({ clock }) => {
        if (pulseRef.current) {
            pulseRef.current.children.forEach((child, index) => {
                if (child.material) {
                    child.material.opacity = 0.34 + Math.sin(clock.elapsedTime * 2.4 + index * 0.8) * 0.14
                }
            })
        }
    })

    const focusItems = useMemo(() => {
        return [...(selectedWords || new Set())].map((word) => {
            const indices = wordIndices[word] || []
            if (!indices.length) return null
            const focusIndex = indices[Math.floor(indices.length / 2)]
            const position = wordPosition(focusIndex, pageDepth)
            const color = WORD_COLORS[Math.max(0, topWords.indexOf(word)) % WORD_COLORS.length]
            return { word, count: indices.length, position, color }
        }).filter(Boolean)
    }, [pageDepth, selectedWords, topWords, wordIndices])

    if (!focusItems.length) return null

    return (
        <group ref={pulseRef}>
            {focusItems.map(({ word, count, position, color }) => {
                const labelPosition = [position[0] + 0.12, position[1] + 0.18, position[2] + 0.02]
                return (
                    <group key={word} position={position}>
                        <mesh position={[0, 0, 0.018]}>
                            <torusGeometry args={[0.105, 0.006, 8, 36]} />
                            <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} toneMapped={false} />
                        </mesh>
                        <mesh position={[0, 0, 0.022]}>
                            <sphereGeometry args={[0.04, 12, 12]} />
                            <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={1.4} roughness={0.25} toneMapped={false} />
                        </mesh>
                        <Line
                            points={[[0, -0.18, 0.012], [0, 0.18, 0.012]]}
                            color={color}
                            lineWidth={1}
                            transparent
                            opacity={0.65}
                            depthWrite={false}
                        />
                        <Text
                            position={[labelPosition[0] - position[0], labelPosition[1] - position[1], labelPosition[2] - position[2]]}
                            fontSize={0.105}
                            color={color}
                            anchorX="left"
                            anchorY="middle"
                            font="/experiments/lexical/fonts/share-tech-mono.ttf"
                        >
                            {`${word} ${count}`}
                        </Text>
                    </group>
                )
            })}
        </group>
    )
}

// ─── Main BookMatrix component ────────────────────────────────────────────────
export function BookMatrix({ matrixWords, selectedWords, topWords, pageDepth = 0.6, pageOpacity = 0.06, showFocusPoints = true, hoverLabelsEnabled = true }) {
    const [hoverWord, setHoverWord] = useState(null)
    const totalPages = useMemo(() => {
        if (!matrixWords.length) return 1
        return Math.ceil(matrixWords.length / WORDS_PER_PAGE)
    }, [matrixWords])

    const wordIndices = useMemo(() => indexWords(matrixWords), [matrixWords])

    // Sample page slabs — max 80 visible for performance
    const MAX_VISIBLE_PAGES = 80
    const pageStep = Math.max(1, Math.ceil(totalPages / MAX_VISIBLE_PAGES))
    const visiblePageIndices = useMemo(() => {
        const indices = []
        for (let i = 0; i < totalPages; i += pageStep) indices.push(i)
        if (indices[indices.length - 1] !== totalPages - 1) indices.push(totalPages - 1)
        return indices
    }, [totalPages, pageStep])

    const MAX_BG_DOTS = 150
    const MAX_SELECTED_DOTS = 2000
    const labelStep = totalPages <= 20 ? 1 : totalPages <= 100 ? 5 : totalPages <= 300 ? 20 : 50

    return (
        <group>
            
            <ambientLight intensity={0.55} color="#fdf0d8" />
            {/* Main warm overhead */}
            <pointLight position={[0, 10, 8]} intensity={1.8} color="#f8e8c0" distance={35} decay={2} />
            {/* Front fill — makes page faces visible as paper surfaces */}
            <pointLight position={[0, 0, 14]} intensity={1.2} color="#fff8ec" distance={28} decay={2} />
            {/* Cool accent from below-left for depth */}
            <pointLight position={[-6, -5, 6]} intensity={0.5} color="#b0c8e8" distance={22} decay={2} />
            <spotLight position={[2, 12, 4]} angle={0.55} penumbra={0.8} intensity={1.4} color="#ffe8b0" />

            {visiblePageIndices.map(i => (
                <PageSlab key={i} pageIndex={i} pageDepth={pageDepth} pageOpacity={pageOpacity} />
            ))}

            <PageLabels totalPages={totalPages} step={labelStep} pageDepth={pageDepth} />

            {topWords.map((word, i) => {
                const allIndices = wordIndices[word] || []
                if (!allIndices.length) return null
                const isSelected = selectedWords?.has(word)
                const maxDots = isSelected ? MAX_SELECTED_DOTS : MAX_BG_DOTS
                let sampledIndices = allIndices
                if (allIndices.length > maxDots) {
                    const s = Math.ceil(allIndices.length / maxDots)
                    sampledIndices = allIndices.filter((_, idx) => idx % s === 0)
                }
                return (
                    <WordThread
                        key={word}
                        word={word}
                        indices={sampledIndices}
                        color={WORD_COLORS[i % WORD_COLORS.length]}
                        isSelected={isSelected}
                        pageDepth={pageDepth}
                        hoverLabelsEnabled={hoverLabelsEnabled}
                        onHoverWord={setHoverWord}
                    />
                )
            })}

            {hoverLabelsEnabled && <HoverWordLabel hoverWord={hoverWord} />}

            {showFocusPoints && (
                <FocusPoints
                    wordIndices={wordIndices}
                    selectedWords={selectedWords}
                    topWords={topWords}
                    pageDepth={pageDepth}
                />
            )}
        </group>
    )
}

export { WORDS_PER_PAGE, WORDS_PER_LINE, LINES_PER_PAGE, WORD_COLORS, wordPosition }
