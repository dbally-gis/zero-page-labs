import React, { useMemo, useState, useRef } from 'react'
import '../index.css'
import { validateText, MAX_TEXT_LENGTH } from '../intake.js'
import { DEFAULT_ARTICLE_TEXT } from '../articleCorpus.js'

const BARCODE_COLORS = ['#c98830', '#3da370', '#69a7ff', '#c4607a', '#b989d6', '#5fb9aa']

export function FuturisticHUD({
    path, onTextSubmit, isPaused, onTogglePause,
    letterFilter, setLetterFilter, positionRange, setPositionRange,
    symbolizeByFrequency, onToggleFrequency,
    visualMode, onToggleMode,
    topWords = [], wordFrequency = {}, searchableWords = [],
    matrixWords = [],
    selectedMatrixWords = new Set(), onSelectMatrixWord, onRemoveMatrixWord,
    focusPointsEnabled = true, onToggleFocusPoints,
    hoverLabelsEnabled = true, onToggleHoverLabels,
    pageDepth = 0.6, onPageDepthChange,
    pageOpacity = 0.06, onPageOpacityChange,
    articleMode = false, onToggleArticleMode,
    onCapturePreset, onClearExtra,
    railVisible = true, onToggleRail,
}) {
    const localFileRef = useRef(null)
    const [pasteText, setPasteText] = useState('')
    const [urlInput, setUrlInput] = useState('')
    const [urlStatus, setUrlStatus] = useState(null)
    const [isLoadingUrl, setIsLoadingUrl] = useState(false)
    const [inputTab, setInputTab] = useState('paste')
    const [panelOpen, setPanelOpen] = useState(false)
    const [inputError, setInputError] = useState('')
    const [fileLoading, setFileLoading] = useState(false)
    const [termSearch, setTermSearch] = useState('')

    const isMatrix = visualMode === 'matrix'
    const isInputPanelVisible = !articleMode && panelOpen
    const adjustPageOpacity = (delta) => {
        const next = Math.min(0.22, Math.max(0.01, Number((pageOpacity + delta).toFixed(2))))
        onPageOpacityChange(next)
    }
    const searchResults = useMemo(() => {
        const query = termSearch.trim().toLowerCase()
        if (!query) return []
        return searchableWords
            .filter(({ word }) => word.includes(query))
            .slice(0, 8)
    }, [searchableWords, termSearch])
    const recurrenceRows = useMemo(() => {
        if (!isMatrix || !matrixWords.length) return []
        const validWords = new Set(topWords)
        const selected = [...selectedMatrixWords].filter(w => validWords.has(w)).slice(0, 6)
        const total = Math.max(1, matrixWords.length - 1)
        return selected.map((word, wordIndex) => {
            const positions = matrixWords
                .filter(node => node.word === word)
                .map(node => Math.round((node.index / total) * 1000) / 10)
            const step = positions.length > 80 ? Math.ceil(positions.length / 80) : 1
            return {
                word,
                color: BARCODE_COLORS[wordIndex % BARCODE_COLORS.length],
                positions: positions.filter((_, index) => index % step === 0),
            }
        }).filter(row => row.positions.length > 0)
    }, [isMatrix, matrixWords, selectedMatrixWords])

    const handleLoadTextToggle = () => {
        if (articleMode) {
            setPanelOpen(true)
            onToggleArticleMode?.()
            return
        }
        setPanelOpen(v => !v)
    }

    const handlePasteSubmit = (e) => {
        e.preventDefault()
        if (pasteText.trim()) loadLocalText(pasteText)
    }

    const loadLocalText = (text) => {
        const error = validateText(text)
        setInputError(error || '')
        if (!error) { const rejection = onTextSubmit(text); if (rejection) { setInputError(rejection); return } setPasteText(''); setPanelOpen(false) }
    }
    const handleFileUpload = async () => {
        const file = localFileRef.current?.files[0]
        if (!file) { setInputError('Choose a text file first.'); return }
        if (file.size > 100000) { setInputError('Choose a text file smaller than 100 KB.'); return }
        setFileLoading(true)
        setInputError('')
        const reader = new FileReader()
        reader.onload = () => { setFileLoading(false); loadLocalText(String(reader.result || '')) }
        reader.onerror = () => { setFileLoading(false); setInputError('That file could not be read. Try a plain-text file.') }
        reader.readAsText(file)

    }

    return (
        <div className="hud-layer">

            {/* ── Top bar ── */}
            <div className="hud-topbar">
                <div className="topbar-brand">
                    <h1 className="topbar-brand-name">Lexical</h1>
                    <a className="topbar-brand-sub" href="/experiments/">← Zero Page Labs</a>
                </div>

                <div className="topbar-divider" />

                <div className="mode-seg">
                    <button
                        aria-pressed={!isMatrix}
                        className={`mode-seg-btn ${!isMatrix ? 'active' : ''}`}
                        onClick={() => !isMatrix || onToggleMode()}
                    >
                        Throughline
                    </button>
                    <button
                        aria-pressed={isMatrix}
                        className={`mode-seg-btn ${isMatrix ? 'active' : ''}`}
                        onClick={() => isMatrix || onToggleMode()}
                    >
                        Lexical Atlas
                    </button>
                </div>

                <div className="topbar-spacer" />

                <div className="topbar-actions">
                    <button className="topbar-btn" onClick={onTogglePause}>
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                        className={`topbar-btn ${railVisible ? '' : 'active'}`}
                        onClick={onToggleRail}
                    >
                        {railVisible ? 'Hide info' : 'Show info'}
                    </button>
                    <button
                        className={`topbar-btn ${articleMode ? 'active' : ''}`}
                        onClick={onToggleArticleMode}
                    >
                        {articleMode ? 'Show controls' : 'Capture mode'}
                    </button>
                    <button
                        className={`topbar-btn ${isInputPanelVisible ? 'active' : ''}`}
                        onClick={handleLoadTextToggle}
                    >
                        Load text
                    </button>
                </div>
            </div>

            {/* ── Presets + chips strip ── */}
            {!articleMode && (
                <div className="presets-strip">
                    <button className="preset-btn" onClick={() => { onTextSubmit(DEFAULT_ARTICLE_TEXT); setInputError('') }}>Reset sample</button><span className="preset-label">View</span>
                    <button className="preset-btn" onClick={() => onCapturePreset('hero')}>Hero</button>
                    <button className="preset-btn" onClick={() => onCapturePreset('analyst')}>Analyst</button>
                    <button className="preset-btn" onClick={() => onCapturePreset('atlas')}>Atlas</button>

                    {isMatrix && topWords.length > 0 && (
                        <>
                            <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 8px', flexShrink: 0 }} />
                            <div className="chips-strip">
                                {topWords.map((w) => {
                                    const sel = selectedMatrixWords.has(w)
                                    return (
                                        <button
                                            key={w}
                                            aria-pressed={sel}
                                            className={`word-chip ${sel ? 'selected' : ''}`}
                                            onClick={() => onSelectMatrixWord(w)}
                                        >
                                            {w} <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{wordFrequency[w] || 0}</span>
                                        </button>
                                    )
                                })}
                                {(selectedMatrixWords.size > 1 || topWords.length > 8) && (
                                    <button
                                        className="chip-clear"
                                        onClick={onClearExtra}
                                    >
                                        Clear extra
                                    </button>
                                )}
                            </div>

                            <div className="term-search">
                                <label className="sr-only" htmlFor="term-search">Search words in text</label>
                                <input
                                    id="term-search"
                                    className="term-search-input"
                                    type="search"
                                    value={termSearch}
                                    onChange={e => setTermSearch(e.target.value)}
                                    placeholder="Find term"
                                    autoComplete="off"
                                />
                                {termSearch.trim() && (
                                    <div className="term-search-popover" role="listbox" aria-label="Word search results">
                                        {searchResults.length > 0 ? (
                                            searchResults.map(({ word, count }) => {
                                                const selected = selectedMatrixWords.has(word)
                                                return (
                                                    <button
                                                        type="button"
                                                        key={word}
                                                        className={`term-search-result ${selected ? 'selected' : ''}`}
                                                        onClick={() => onSelectMatrixWord(word)}
                                                        role="option"
                                                        aria-selected={selected}
                                                    >
                                                        <span>{word}</span>
                                                        <strong>{count}</strong>
                                                    </button>
                                                )
                                            })
                                        ) : (
                                            <div className="term-search-empty">No matching terms</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="atlas-controls">
                                <button
                                    type="button"
                                    className={`focus-toggle ${focusPointsEnabled ? 'active' : ''}`}
                                    onClick={onToggleFocusPoints}
                                    aria-pressed={focusPointsEnabled}
                                >
                                    Focus
                                </button>
                                <button
                                    type="button"
                                    className={`focus-toggle ${hoverLabelsEnabled ? 'active' : ''}`}
                                    onClick={onToggleHoverLabels}
                                    aria-pressed={hoverLabelsEnabled}
                                >
                                    Labels
                                </button>
                                <label className="atlas-slider">
                                    <span className="depth-label">Page depth</span>
                                    <input
                                        aria-label="Page depth" type="range" min="0.05" max="1.5" step="0.01"
                                        value={pageDepth}
                                        onInput={e => onPageDepthChange(parseFloat(e.target.value))}
                                        onChange={e => onPageDepthChange(parseFloat(e.target.value))}
                                    />
                                    <span className="depth-value">{pageDepth.toFixed(2)}</span>
                                </label>
                                <label className="atlas-slider page-opacity-slider">
                                    <span className="depth-label">Page opacity</span>
                                    <button
                                        type="button"
                                        className="opacity-step"
                                        onClick={() => adjustPageOpacity(-0.01)}
                                        aria-label="Decrease page opacity"
                                    >
                                        -
                                    </button>
                                    <input
                                        aria-label="Page opacity" type="range" min="0.01" max="0.22" step="0.01"
                                        value={pageOpacity}
                                        onInput={e => onPageOpacityChange(parseFloat(e.target.value))}
                                        onChange={e => onPageOpacityChange(parseFloat(e.target.value))}
                                    />
                                    <button
                                        type="button"
                                        className="opacity-step"
                                        onClick={() => adjustPageOpacity(0.01)}
                                        aria-label="Increase page opacity"
                                    >
                                        +
                                    </button>
                                    <span className="depth-value">{Math.round(pageOpacity * 100)}%</span>
                                </label>
                            </div>
                        </>
                    )}
                </div>
            )}

            {isMatrix && recurrenceRows.length > 0 && (
                <section className={`recurrence-barcode ${articleMode ? 'article' : ''}`} aria-label="Selected term recurrence barcode">
                    <div className="barcode-head">
                        <span>Recurrence</span>
                        <strong>{recurrenceRows.length} terms</strong>
                    </div>
                    <div className="barcode-rows">
                        {recurrenceRows.map((row) => (
                            <div className="barcode-row" key={row.word}>
                                <div className="barcode-word-wrap">
                                    <span className="barcode-word" style={{ color: row.color }}>{row.word}</span>
                                    {!articleMode && (
                                        <button
                                            type="button"
                                            className="barcode-remove-btn"
                                            onClick={() => onRemoveMatrixWord(row.word)}
                                            aria-label={`Remove ${row.word}`}
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                                <div className="barcode-track" aria-hidden="true">
                                    {row.positions.map((position, index) => (
                                        <span
                                            key={`${row.word}-${position}-${index}`}
                                            className="barcode-mark" aria-hidden="true"
                                            style={{ left: `${position}%`, backgroundColor: row.color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Input panel ── */}
            {isInputPanelVisible && (
                <div className="input-panel">
                    <div className="panel-header">
                        <span className="panel-title">Load text</span><button className="topbar-btn" onClick={() => setPanelOpen(false)} aria-label="Close text input">×</button>
                    </div>

                    <div className="tab-bar">
                        <button className={`tab-btn ${inputTab === 'paste' ? 'active' : ''}`} onClick={() => setInputTab('paste')}>Paste</button>
                        <button className={`tab-btn ${inputTab === 'file' ? 'active' : ''}`} onClick={() => setInputTab('file')}>File</button>
                    </div>

                    <div className="tab-content"><p className="local-notice">Your text stays in this browser. Up to 20,000 characters. English letters are mapped by spelling, not meaning.</p>{inputError && <p role="alert" className="input-error">{inputError}</p>}
                        {inputTab === 'paste' && (
                            <form onSubmit={handlePasteSubmit}>
                                <label className="field-label" htmlFor="text-corpus">Text</label>
                                <textarea
                                    id="text-corpus"
                                    className="ga-input ga-textarea"
                                    maxLength={MAX_TEXT_LENGTH}
                                    value={pasteText}
                                    onChange={e => setPasteText(e.target.value)}
                                    placeholder="Paste any text — article, book chapter, speech…"
                                />
                                <button
                                    type="submit"
                                    className="ga-btn ga-btn-primary ga-btn-full"
                                    style={{ marginTop: 10 }}
                                    disabled={!pasteText.trim()}
                                >
                                    Analyze
                                </button>
                            </form>
                        )}

                        {inputTab === 'file' && (
                            <div>
                                <label className="field-label" style={{ marginBottom: 8 }}>File</label>
                                <label className="file-drop">
                                    <span style={{ fontSize: 20 }}>&#128193;</span>
                                    <span>Click to choose a file</span>
                                    <span className="file-drop-ext">.txt &middot; .md &middot; .csv &middot; .json</span>
                                    <input type="file" ref={localFileRef}  aria-label="Choose a local text file" accept=".txt,.md,.csv,.json" />
                                </label><button className="ga-btn ga-btn-primary ga-btn-full" onClick={handleFileUpload} disabled={fileLoading}>{fileLoading ? 'Reading…' : 'Load file'}</button>
                            </div>
                        )}
                    </div>

                    {/* Filters — sequence mode only */}
                    {!isMatrix && (
                        <div className="filter-row">
                            <span className="filter-row-label">Filter</span>
                            <label className="sr-only" htmlFor="letter-filter">Starting letter</label>
                            <input
                                id="letter-filter"
                                type="text"
                                className="ga-input letter-input"
                                placeholder="A–Z"
                                maxLength={3}
                                value={letterFilter}
                                onChange={e => setLetterFilter(e.target.value)}
                            />
                            <div style={{ flex: 1 }}>
                                <label htmlFor="seq-range" className="sr-only">Sequence range</label>
                                <input
                                    id="seq-range"
                                    type="range" min="1" max="100"
                                    value={positionRange[1]}
                                    onChange={e => setPositionRange([0, parseInt(e.target.value)])}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', flexShrink: 0 }}>
                                {positionRange[1]}%
                            </span>
                            <button
                                type="button"
                                className={`ga-btn ga-btn-secondary freq-btn ${symbolizeByFrequency ? 'active' : ''}`}
                                onClick={onToggleFrequency}
                                title="Weight by frequency"
                                style={symbolizeByFrequency ? { color: 'var(--amber)', borderColor: 'var(--amber)', background: 'var(--amber-dim)' } : {}}
                            >
                                Freq
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Node counter ── */}
            <div className="node-counter">
                <div className="node-count">{path.length}</div>
                <div className="node-label">nodes mapped</div>
            </div>
        </div>
    )
}
