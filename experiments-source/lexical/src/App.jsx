import React, { Component, useState, useCallback, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { Vector2 } from 'three'
import { SAMPLE_PATH } from './sampleData.js'
import { TheVoid } from './components/TheVoid.jsx'
import { LexicalParticles } from './components/LexicalParticles.jsx'
import { GlowingThread } from './components/GlowingThread.jsx'
import { BookMatrix, WORDS_PER_LINE, LINES_PER_PAGE, WORDS_PER_PAGE } from './components/BookMatrix.jsx'
import { FuturisticHUD } from './components/FuturisticHUD.jsx'
import { SummaryPanel } from './components/SummaryPanel.jsx'
import { HeartbeatMonitor } from './components/HeartbeatMonitor.jsx'
import { InterpretationRail } from './components/InterpretationRail.jsx'
import { countWords } from './word-maps.js'
import { validateText } from './intake.js'
import { DEFAULT_ARTICLE_TEXT } from './articleCorpus.js'

// ─── Constants ────────────────────────────────────────────────────────────────
const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'about', 'as', 'in', 'of', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'that', 'this', 'these', 'those'])
const TOP_WORD_COUNT = 8

function extractTextFromHtml(text) {
    if (!text) return ''
    const trimmed = text.trim()
    const isHtml = trimmed.startsWith('<') || 
                   /^\s*<!doctype/i.test(trimmed) ||
                   /<(html|head|body|div|p|script|style|span|a|h[1-6]|section|article|header|footer|nav|ul|ol|li|table|tr|td|form|input|button|meta|link|title|iframe)\b[^>]*>/i.test(trimmed) ||
                   /<\/(html|head|body|div|p|script|style|span|a|h[1-6]|section|article|header|footer|nav|ul|ol|li|table|tr|td|form|input|button|meta|link|title|iframe)>/i.test(trimmed)
    if (!isHtml) return text

    try {
        const template = document.createElement('template')
        template.innerHTML = text
        const doc = template.content
        const removeSelectors = 'script, style, noscript, svg, header, footer, nav, iframe, head, meta, link'
        doc.querySelectorAll(removeSelectors).forEach(el => el.remove())
        doc.querySelectorAll('p, div, br, li, section').forEach(el => el.append(document.createTextNode(' ')))
        const bodyText = doc.textContent
        return bodyText || ''
    } catch (e) {
        console.error('Failed to parse HTML via DOMParser, falling back to regex', e)
        return text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
    }
}

function browserSupportsWebGL() {
    try {
        const canvas = document.createElement('canvas')
        return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
        return false
    }
}

class GraphicsBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { failed: false }
    }

    static getDerivedStateFromError() {
        return { failed: true }
    }

    componentDidCatch(error) {
        this.props.onError?.(error)
    }

    render() {
        if (this.state.failed) return this.props.fallback
        return this.props.children
    }
}

// ─── Sequence mode parsing ────────────────────────────────────────────────────
function wordToCoord(word, index) {
    const w = word.toLowerCase()
    const z = w.charCodeAt(0) >= 97 && w.charCodeAt(0) <= 122 ? (w.charCodeAt(0) - 97) / 25 : 0.5
    const x = w.length > 1 && w.charCodeAt(1) >= 97 ? (w.charCodeAt(1) - 97) / 25 : 0.5
    const y = Math.min(w.length / 15, 1)
    return { word, x, y, z, sequence: index, found: true }
}

function parseText(text) {
    const tokens = text.toLowerCase().match(/\b[a-z]+\b/g) || []
    return tokens.filter(w => w.length > 2 && !STOP_WORDS.has(w)).map((w, i) => wordToCoord(w, i))
}

// ─── Matrix mode parsing ──────────────────────────────────────────────────────
// Standard page = 250 words (10 words/line × 25 lines)
function parseTextToMatrix(text) {
    const tokens = text.toLowerCase().match(/\b[a-z]+\b/g) || []
    const words = tokens.filter(w => w.length > 2 && !STOP_WORDS.has(w))
    return words.map((word, index) => ({
        word,
        index,
        page: Math.floor(index / WORDS_PER_PAGE),
        line: Math.floor((index % WORDS_PER_PAGE) / 10),
        col: index % 10,
    }))
}

// ─── Frequency helpers ────────────────────────────────────────────────────────
function buildFrequencyMap(pathArr) { return countWords(pathArr) }

function topNWords(freqMap, n) {
    return Object.entries(freqMap).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w)
}

function frequencyEntries(freqMap) {
    return Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([word, count]) => ({ word, count }))
}

const FALLBACK_PAGE = {
    x: 380,
    y: 165,
    width: 250,
    height: 350,
    marginX: 30,
    marginY: 40,
}
const FALLBACK_TEXT_W = FALLBACK_PAGE.width - FALLBACK_PAGE.marginX * 2
const FALLBACK_TEXT_H = FALLBACK_PAGE.height - FALLBACK_PAGE.marginY * 2

function StaticLexicalFallback({ visualMode, path, matrixWords, topWords, selectedWords, pageDepth, pageOpacity, showFocusPoints, reason }) {
    const isMatrix = visualMode === 'matrix'
    const selected = selectedWords?.size ? [...selectedWords] : topWords.slice(0, 3)

    const sequencePoints = useMemo(() => {
        const sample = path.slice(0, 90)
        return sample.map((node, index) => ({
            x: 120 + node.x * 720,
            y: 120 + node.y * 360,
            z: node.z,
            word: node.word,
            index,
        }))
    }, [path])

    const matrixThreads = useMemo(() => {
        const wordsByTerm = new Map()
        matrixWords.forEach((node) => {
            if (!wordsByTerm.has(node.word)) wordsByTerm.set(node.word, [])
            wordsByTerm.get(node.word).push(node)
        })
        return selected.slice(0, 4).map((word, wordIndex) => ({
            word,
            color: ['#c98830', '#3da370', '#69a7ff', '#c4607a'][wordIndex % 4],
            points: (wordsByTerm.get(word) || []).slice(0, 32).map((node) => ({
                x: FALLBACK_PAGE.x + FALLBACK_PAGE.marginX + (node.col / (WORDS_PER_LINE - 1)) * FALLBACK_TEXT_W + node.page * pageDepth * 20,
                y: FALLBACK_PAGE.y + FALLBACK_PAGE.marginY + (node.line / (LINES_PER_PAGE - 1)) * FALLBACK_TEXT_H,
            })),
        }))
    }, [matrixWords, pageDepth, selected])

    return (
        <div className="static-graphics-fallback" aria-label="Static lexical graphics fallback">
            <svg viewBox="0 0 1000 620" role="img">
                <defs>
                    <radialGradient id="fallbackGlow" cx="50%" cy="46%" r="60%">
                        <stop offset="0%" stopColor="#302a1c" />
                        <stop offset="55%" stopColor="#151610" />
                        <stop offset="100%" stopColor="#050604" />
                    </radialGradient>
                    <filter id="softGlow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <rect width="1000" height="620" fill="url(#fallbackGlow)" />
                {isMatrix ? (
                    <>
                        <g transform="translate(0 0) rotate(-1 520 320)">
                            {[2, 1, 0].map((page) => (
                                <g key={page} transform={`translate(${page * 18} ${page * -5})`}>
                                    <rect x={FALLBACK_PAGE.x} y={FALLBACK_PAGE.y} width={FALLBACK_PAGE.width} height={FALLBACK_PAGE.height} rx="4" fill="#ffffff" fillOpacity={pageOpacity} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
                                    {Array.from({ length: LINES_PER_PAGE }).map((_, i) => (
                                        <line
                                            key={i}
                                            x1={FALLBACK_PAGE.x + FALLBACK_PAGE.marginX}
                                            x2={FALLBACK_PAGE.x + FALLBACK_PAGE.width - FALLBACK_PAGE.marginX}
                                            y1={FALLBACK_PAGE.y + FALLBACK_PAGE.marginY + (i / (LINES_PER_PAGE - 1)) * FALLBACK_TEXT_H}
                                            y2={FALLBACK_PAGE.y + FALLBACK_PAGE.marginY + (i / (LINES_PER_PAGE - 1)) * FALLBACK_TEXT_H}
                                            stroke="#ffffff"
                                            strokeOpacity="0.10"
                                        />
                                    ))}
                                </g>
                            ))}
                            {matrixThreads.map((thread) => (
                                <g key={thread.word} filter="url(#softGlow)">
                                    <polyline
                                        points={thread.points.map((point) => `${point.x},${point.y}`).join(' ')}
                                        fill="none"
                                        stroke={thread.color}
                                        strokeWidth="3"
                                        strokeOpacity="0.78"
                                    />
                                    {thread.points.slice(0, 10).map((point, index) => (
                                        <circle key={index} cx={point.x} cy={point.y} r="4" fill={thread.color} />
                                    ))}
                                    {showFocusPoints && thread.points.length > 0 && (
                                        <g transform={`translate(${thread.points[Math.floor(thread.points.length / 2)].x} ${thread.points[Math.floor(thread.points.length / 2)].y})`}>
                                            <circle r="12" fill="none" stroke={thread.color} strokeWidth="2" strokeOpacity="0.92" />
                                            <circle r="4" fill="#ffffff" fillOpacity="0.9" />
                                        </g>
                                    )}
                                </g>
                            ))}
                        </g>
                    </>
                ) : (
                    <g filter="url(#softGlow)">
                        {sequencePoints.slice(1).map((point, index) => {
                            const prev = sequencePoints[index]
                            return <line key={index} x1={prev.x} y1={prev.y} x2={point.x} y2={point.y} stroke="#c98830" strokeOpacity="0.28" />
                        })}
                        {sequencePoints.map((point) => (
                            <circle
                                key={point.index}
                                cx={point.x}
                                cy={point.y}
                                r={2.5 + point.z * 4}
                                fill={`hsl(${Math.round(point.z * 260)}, 82%, 62%)`}
                                opacity="0.85"
                            />
                        ))}
                    </g>
                )}
            </svg>
            <div className="fallback-note">
                <strong>Static graphics mode</strong>
                <span>{reason || 'WebGL rendering did not initialize in this browser.'}</span>
            </div>
        </div>
    )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
    const [rawPath, setRawPath] = useState(() => parseText(DEFAULT_ARTICLE_TEXT))
    const [rawText, setRawText] = useState(DEFAULT_ARTICLE_TEXT.trim())
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const [isPaused, setIsPaused] = useState(false)
    const [visualMode, setVisualMode] = useState('matrix') // 'sequence' | 'matrix'
    const [symbolizeByFrequency, setSymbolizeByFrequency] = useState(false)
    const [selectedMatrixWords, setSelectedMatrixWords] = useState(new Set())
    const [customWords, setCustomWords] = useState(new Set())
    const [pageDepth, setPageDepth] = useState(0.6) // Book page spacing slider
    const [pageOpacity, setPageOpacity] = useState(0.06)
    const [letterFilter, setLetterFilter] = useState('')
    const [positionRange, setPositionRange] = useState([0, 100])
    const [articleMode, setArticleMode] = useState(false)
    const [railVisible, setRailVisible] = useState(true)
    const [showFocusPoints, setShowFocusPoints] = useState(true)
    const [hoverLabelsEnabled, setHoverLabelsEnabled] = useState(true)
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
    const [webglSupported, setWebglSupported] = useState(true)
    const [flatView, setFlatView] = useState(false)
    const [graphicsError, setGraphicsError] = useState(null)

    const handleTextSubmit = useCallback((text) => {
        if (validateText(text)) return
        const cleanText = extractTextFromHtml(text)
        const newPath = parseText(cleanText)
        if (!newPath.length) return 'Try a passage with more English words; common linking words are filtered out.'
        if (newPath.length) {
            setLetterFilter('')
            setPositionRange([0, 100])
            setRawPath(newPath)
            setRawText(cleanText)
            setHoveredIndex(null)
            setCustomWords(new Set())
            
            const newFreq = buildFrequencyMap(newPath)
            const newTop = topNWords(newFreq, TOP_WORD_COUNT)
            if (newTop.length > 0) {
                setSelectedMatrixWords(new Set([newTop[0]]))
            } else {
                setSelectedMatrixWords(new Set())
            }
        }
    }, [])

    const path = useMemo(() => rawPath.filter((p, i) => {
        const perc = (i / rawPath.length) * 100
        if (perc < positionRange[0] || perc > positionRange[1]) return false
        if (letterFilter && !p.word.toLowerCase().startsWith(letterFilter.toLowerCase())) return false
        return true
    }), [rawPath, letterFilter, positionRange])

    const wordFrequency = useMemo(() => buildFrequencyMap(rawPath), [rawPath])
    const topWords = useMemo(() => topNWords(wordFrequency, TOP_WORD_COUNT), [wordFrequency])
    const searchableWords = useMemo(() => frequencyEntries(wordFrequency), [wordFrequency])
    const matrixThreadWords = useMemo(() => {
        return [...new Set([...topWords, ...customWords])]
    }, [customWords, topWords])
    const uniqueCount = useMemo(() => Object.keys(wordFrequency).length, [wordFrequency])

    const matrixWords = useMemo(() => {
        if (!rawText) return parseTextToMatrix(SAMPLE_PATH.map(p => p.word).join(' '))
        return parseTextToMatrix(rawText)
    }, [rawText])

    const handleModeToggle = useCallback(() => {
        setVisualMode(m => {
            const next = m === 'sequence' ? 'matrix' : 'sequence'
            if (next === 'matrix' && selectedMatrixWords.size === 0 && topWords.length > 0) {
                setSelectedMatrixWords(new Set(topWords.slice(0, 3)))
            }
            return next
        })
    }, [selectedMatrixWords, topWords])

    const isMatrix = visualMode === 'matrix'

    useEffect(() => {
        const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
        if (!query) return
        const updatePreference = () => setPrefersReducedMotion(query.matches)
        updatePreference()
        query.addEventListener?.('change', updatePreference)
        return () => query.removeEventListener?.('change', updatePreference)
    }, [])

    useEffect(() => {
        setWebglSupported(browserSupportsWebGL())
    }, [])

    useEffect(() => {
        if (topWords.length > 0 && selectedMatrixWords.size === 0) {
            setSelectedMatrixWords(new Set(topWords.slice(0, 3)))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleRemoveMatrixWord = useCallback((word) => {
        setSelectedMatrixWords(prev => {
            const next = new Set(prev)
            next.delete(word)
            return next
        })
        setCustomWords(prev => {
            const next = new Set(prev)
            next.delete(word)
            return next
        })
    }, [])

    const handleCapturePreset = useCallback((preset) => {
        setCustomWords(new Set())
        // Remove any custom words orphaned from selectedMatrixWords when clearing customWords
        setSelectedMatrixWords(prev => new Set([...prev].filter(w => topWords.includes(w))))
        if (preset === 'hero') {
            setVisualMode('sequence')
            setArticleMode(true)
            setSymbolizeByFrequency(false)
            setIsPaused(false)
            return
        }
        if (preset === 'analyst') {
            setVisualMode('sequence')
            setArticleMode(false)
            setSymbolizeByFrequency(true)
            setIsPaused(false)
            return
        }
        if (preset === 'atlas') {
            setVisualMode('matrix')
            setArticleMode(true)
            setIsPaused(false)
            if (topWords.length > 0) {
                setSelectedMatrixWords(new Set(topWords.slice(0, 3)))
            }
        }
    }, [selectedMatrixWords.size, topWords])

    const handleSelectMatrixWord = useCallback((word) => {
        setSelectedMatrixWords(prev => {
            const newSet = new Set(prev)
            if (newSet.has(word)) {
                newSet.delete(word)
            } else {
                newSet.add(word)
            }
            return newSet
        })

        if (!selectedMatrixWords.has(word) && !topWords.includes(word)) {
            setCustomWords(prev => {
                const next = new Set(prev)
                next.add(word)
                return next
            })
        }
    }, [selectedMatrixWords, topWords])

    const handleClearExtra = useCallback(() => {
        setSelectedMatrixWords(new Set(topWords.length > 0 ? [topWords[0]] : []))
        setCustomWords(new Set())
    }, [topWords])

    const fallbackGraphic = (
        <StaticLexicalFallback
            visualMode={visualMode}
            path={path}
            matrixWords={matrixWords}
            topWords={topWords}
            selectedWords={selectedMatrixWords}
            pageDepth={pageDepth}
            pageOpacity={pageOpacity}
            showFocusPoints={showFocusPoints}
            reason={
                flatView ? '2D view selected. Text and controls remain interactive.' : !webglSupported
                    ? 'WebGL is unavailable, so Lexical is showing a static graphics preview.'
                    : graphicsError
                        ? 'The live Three.js renderer failed, so Lexical is showing a static graphics preview.'
                        : ''
            }
        />
    )

    return (
        <main className="lexical-app"><div className="graphics-stage">
            {webglSupported && !flatView ? (
                <GraphicsBoundary fallback={fallbackGraphic} onError={setGraphicsError}>
                    <Canvas
                        frameloop={isPaused || prefersReducedMotion ? "demand" : "always"}
                        dpr={[1, 1.5]}
                        camera={{ position: isMatrix ? [0, 0, 12] : [2, 2, 6], fov: 60 }}
                        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9, preserveDrawingBuffer: true }}
                    >
                        <color attach="background" args={[isMatrix ? '#0e0e0b' : '#12100d']} />
                        <fog attach="fog" args={isMatrix ? ['#0e0e0b', 8, 40] : ['#12100d', 2, 15]} />

                        {!isMatrix && (
                            <>
                                
                                <LexicalParticles />
                                <GlowingThread
                                    path={path}
                                    hoveredIndex={hoveredIndex}
                                    onHover={setHoveredIndex}
                                    wordFrequency={wordFrequency}
                                    symbolizeByFrequency={symbolizeByFrequency}
                                />
                            </>
                        )}

                        {isMatrix && (
                        <BookMatrix
                            matrixWords={matrixWords}
                            topWords={matrixThreadWords}
                            selectedWords={selectedMatrixWords}
                            pageDepth={pageDepth}
                            pageOpacity={pageOpacity}
                            showFocusPoints={showFocusPoints}
                            hoverLabelsEnabled={hoverLabelsEnabled}
                        />
                        )}

                        <OrbitControls
                            enableDamping
                            autoRotate={!isPaused && !prefersReducedMotion}
                            autoRotateSpeed={isMatrix ? 0.2 : 0.5}
                            maxDistance={isMatrix ? 50 : 20}
                            minDistance={2}
                        />

                        <EffectComposer disableNormalPass multisampling={4}>
                            <Bloom
                                luminanceThreshold={0.55}
                                luminanceSmoothing={0.7}
                                intensity={0.4}
                                mipmapBlur
                            />
                            <ChromaticAberration
                                blendFunction={BlendFunction.NORMAL}
                                offset={new Vector2(0.0007, 0.0007)}
                            />
                            <Vignette eskil={false} offset={0.15} darkness={0.82} />
                        </EffectComposer>
                    </Canvas>
                </GraphicsBoundary>
            ) : fallbackGraphic}

            </div><div className="view-access"><button onClick={() => setFlatView(v => !v)} aria-pressed={flatView}>{flatView ? 'Switch to 3D' : 'Use 2D view'}</button><span>Drag to orbit · Scroll or pinch to zoom</span></div>
            <FuturisticHUD
                path={path}
                onTextSubmit={handleTextSubmit}
                isPaused={isPaused}
                onTogglePause={() => setIsPaused(!isPaused)}
                letterFilter={letterFilter}
                setLetterFilter={setLetterFilter}
                positionRange={positionRange}
                setPositionRange={setPositionRange}
                symbolizeByFrequency={symbolizeByFrequency}
                onToggleFrequency={() => setSymbolizeByFrequency(v => !v)}
                visualMode={visualMode}
                onToggleMode={handleModeToggle}
                topWords={matrixThreadWords}
                wordFrequency={wordFrequency}
                searchableWords={searchableWords}
                matrixWords={matrixWords}
                selectedMatrixWords={selectedMatrixWords}
                onSelectMatrixWord={handleSelectMatrixWord}
                onRemoveMatrixWord={handleRemoveMatrixWord}
                focusPointsEnabled={showFocusPoints}
                onToggleFocusPoints={() => setShowFocusPoints(v => !v)}
                hoverLabelsEnabled={hoverLabelsEnabled}
                onToggleHoverLabels={() => setHoverLabelsEnabled(v => !v)}
                pageDepth={pageDepth}
                onPageDepthChange={setPageDepth}
                pageOpacity={pageOpacity}
                onPageOpacityChange={setPageOpacity}
                articleMode={articleMode}
                onToggleArticleMode={() => setArticleMode(v => !v)}
                onCapturePreset={handleCapturePreset}
                onClearExtra={handleClearExtra}
                currentText={rawText}
                railVisible={railVisible}
                onToggleRail={() => setRailVisible(v => !v)}
            />

            <InterpretationRail
                visualMode={visualMode}
                pathLength={path.length}
                uniqueCount={uniqueCount}
                articleMode={articleMode}
                isVisible={railVisible}
                onDismiss={() => setRailVisible(false)}
            />

            {!isMatrix && !articleMode && (
                <>
                    <SummaryPanel path={path} />
                    <HeartbeatMonitor path={path} hoveredIndex={hoveredIndex} onHover={setHoveredIndex} />
                </>
            )}
        </main>
    )
}

export default App
