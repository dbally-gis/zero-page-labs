import React from 'react'

const COPY = {
    sequence: {
        title: 'Interpretation',
        kicker: 'Line of Thought',
        lead: 'The bright path follows the text in reading order. Tight knots show similar spelling coordinates; long throws mark changes in those coordinates. Switch to Lexical Atlas when you want to see repeated terms across page-like strata.',
        bullets: [
            'Node position is deterministic, so the same word returns to the same region.',
            'The waveform below traces first-letter depth across the draft.',
            'Weighted terms make repeated language read as landmarks instead of noise.',
        ],
    },
    matrix: {
        title: 'Interpretation',
        kicker: 'Lexical Atlas',
        lead: 'The book view lays the text into page-like strata and draws threads through selected recurring terms.',
        bullets: [
            'Word chips choose which terms become visible routes through the book.',
            'Page spacing changes the distance between strata without changing the text.',
            'Trace where a selected word returns across a longer passage.',
        ],
    },
}

export function InterpretationRail({ visualMode, pathLength, uniqueCount, articleMode, isVisible, onDismiss, activeExample }) {
    const content = COPY[visualMode] || COPY.sequence

    if (!isVisible) return null

    return (
        <aside className={`interpretation-rail ${articleMode ? 'article' : ''}`}>
            <button className="rail-dismiss" onClick={onDismiss} aria-label="Dismiss interpretation panel">
                &times;
            </button>

            {activeExample && <section className="rail-section sample-guide" aria-live="polite"><div className="rail-eyebrow">Built-in example</div><h2>{activeExample.title}</h2><p>{activeExample.description}</p><p className="sample-attribution">Original text written for Zero Page Labs.</p></section>}
            <section className="rail-section">
                <div className="rail-eyebrow">{content.kicker}</div>
                <h2>{content.title}</h2>
                <p>{content.lead}</p>
                <ul>
                    {content.bullets.map(item => <li key={item}>{item}</li>)}
                </ul>
            </section>

            <section className="rail-section">
                <div className="rail-eyebrow">Coordinate Key</div>
                <dl className="coordinate-key">
                    <div><dt>X</dt><dd>{visualMode === 'matrix' ? 'word column on page' : 'second-letter position'}</dd></div>
                    <div><dt>Y</dt><dd>{visualMode === 'matrix' ? 'line on page' : 'word length'}</dd></div>
                    <div><dt>Z</dt><dd>{visualMode === 'matrix' ? 'page order' : 'first-letter depth'}</dd></div>
                </dl>
            </section>

            <section className="rail-section compact">
                <div className="rail-eyebrow">Current Corpus</div>
                <div className="mini-stat"><span>Mapped nodes</span><strong>{pathLength}</strong></div>
                <div className="mini-stat"><span>Unique lexemes</span><strong>{uniqueCount}</strong></div>
            </section>
        </aside>
    )
}
