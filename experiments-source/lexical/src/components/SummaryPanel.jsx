import { countWords } from '../word-maps.js'
import React, { useMemo } from 'react'

export function SummaryPanel({ path }) {
    const stats = useMemo(() => {
        if (!path.length) return null

        // First and last word
        const firstWord = path[0].word
        const lastWord = path[path.length - 1].word

        // Average dictionary position (Z value)
        const avgZ = path.reduce((sum, p) => sum + p.z, 0) / path.length
        // Convert back to approximate letter
        const avgLetter = String.fromCharCode(97 + Math.round(avgZ * 25))

        // Word frequency
        const freq = countWords(path)
        const topWords = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10) // Top 10 for space

        return { firstWord, lastWord, avgZ, avgLetter, topWords, totalWords: path.length, uniqueWords: Object.keys(freq).length }
    }, [path])

    if (!stats) return null

    return (
        <div className="summary-panel" style={{
            position: 'absolute',
            top: 100,
            right: 20,
            width: 280,
            maxHeight: 'calc(100vh - 250px)',
            background: 'rgba(0, 10, 20, 0.85)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: 4,
            padding: 15,
            zIndex: 20,
            overflow: 'auto',
            fontFamily: "'Share Tech Mono', monospace",
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{ color: '#00ffff', fontSize: 14, marginBottom: 10, borderBottom: '1px solid #33aa33', paddingBottom: 5, letterSpacing: 1 }}>
                ANALYTICS // DATA STREAM
            </div>

            {/* Summary Stats */}
            <div style={{ marginBottom: 15, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#888' }}>TOTAL NODES:</span>
                    <span style={{ color: '#fff' }}>{stats.totalWords}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#888' }}>UNIQUE LEXEMES:</span>
                    <span style={{ color: '#fff' }}>{stats.uniqueWords}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#00ff00' }}>▶ ALPHA:</span>
                    <span style={{ color: '#00ff00' }}>{stats.firstWord.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#ff0000' }}>◼ OMEGA:</span>
                    <span style={{ color: '#ff0000' }}>{stats.lastWord.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#888' }}>AVG DEPTH:</span>
                    <span style={{ color: '#ffff00' }}>{stats.avgLetter.toUpperCase()} ({(stats.avgZ * 100).toFixed(1)}%)</span>
                </div>
            </div>

            {/* Frequency Table */}
            <div style={{ color: '#00ffff', fontSize: 12, marginBottom: 6, borderBottom: '1px solid #33aa33', paddingBottom: 5, letterSpacing: 1 }}>
                HIGH FREQUENCY TOKENS
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <tbody>
                    {stats.topWords.map(([word, count], i) => (
                        <tr key={word} style={{ color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '4px 0', color: '#666' }}>{i + 1}</td>
                            <td style={{ padding: '4px 0', paddingLeft: 10 }}>{word.toUpperCase()}</td>
                            <td style={{ textAlign: 'right', padding: '4px 0', color: '#ff00ff' }}>{count}</td>
                            <td style={{ textAlign: 'right', padding: '4px 0', color: '#888', width: 40 }}>
                                <div style={{
                                    width: `${(count / stats.totalWords) * 100 * 2}px`,
                                    height: 4,
                                    background: '#00ffff',
                                    opacity: 0.5
                                }} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
