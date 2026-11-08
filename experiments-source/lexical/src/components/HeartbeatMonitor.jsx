import React from 'react'

export function HeartbeatMonitor({ path, hoveredIndex, onHover }) {
    if (!path.length) return null

    // Downsample to a fixed maximum so SVG width stays bounded
    const MAX_PTS = 400
    const stride = Math.max(1, Math.ceil(path.length / MAX_PTS))
    // Keep original indices so hover mapping stays accurate
    const displayEntries = path.reduce((acc, p, i) => {
        if (i % stride === 0) acc.push({ p, origIdx: i })
        return acc
    }, [])

    const width = Math.max(displayEntries.length * 10, 300)
    const points = displayEntries.map(({ p }, di) => `${di * 10},${130 - (p.z ?? 0.5) * 110}`).join(' ')

    // Map original hovered index to display index
    const displayHoveredIdx = hoveredIndex !== null
        ? displayEntries.findIndex(({ origIdx }, di) => {
            const nextOrig = displayEntries[di + 1]?.origIdx ?? path.length
            return origIdx <= hoveredIndex && hoveredIndex < nextOrig
        })
        : null

    return (
        <div className="heartbeat-monitor" style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            height: 160,
            background: 'linear-gradient(to top, rgba(0, 20, 40, 0.9), rgba(0, 10, 20, 0.0))',
            borderBottom: '1px solid #00ffff',
            pointerEvents: 'none', // Allow clicks to pass through except for graph interaction? 
            // Actually SVG elements need pointer events
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
        }}>
            <div style={{
                width: '100%',
                height: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                pointerEvents: 'auto',
                paddingBottom: 20
            }}>
                <div style={{
                    color: '#00ffff',
                    fontSize: 10,
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    letterSpacing: 2
                }}>
                    DICTIONARY DEPTH // WAVEFORM
                </div>

                <svg
                    width={width}
                    height="140"
                    style={{ minWidth: '100%', display: 'block' }}
                >
                    {/* Baseline */}
                    <line x1="0" y1="130" x2={width} y2="130" stroke="#333" strokeWidth="1" />

                    {/* The Waveform Area */}
                    <polygon
                        points={`0,140 ${points} ${width},140`}
                        fill="rgba(0, 255, 255, 0.1)"
                        stroke="none"
                    />

                    {/* The Waveform Line */}
                    <polyline
                        fill="none"
                        stroke="#00ffff"
                        strokeWidth="1.5"
                        points={points}
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Nodes (only start, end, hovered) */}
                    {displayEntries.map(({ p, origIdx }, di) => {
                        const cx = di * 10
                        const cy = 130 - (p.z ?? 0.5) * 110
                        const isStart = di === 0
                        const isEnd = di === displayEntries.length - 1
                        const isHovered = di === displayHoveredIdx
                        if (!isStart && !isEnd && !isHovered) return null
                        return (
                            <g key={origIdx}>
                                <circle
                                    cx={cx} cy={cy}
                                    r={isHovered ? 6 : 4}
                                    fill={isStart ? '#00ff00' : isEnd ? '#ff0000' : '#ffff00'}
                                    stroke={isHovered ? '#fff' : 'none'}
                                    strokeWidth="2"
                                />
                                {isHovered && (
                                    <text x={cx} y={cy - 10} fill="#fff" fontSize="10" textAnchor="middle" fontFamily="'Share Tech Mono', monospace">
                                        {p.word.toUpperCase()}
                                    </text>
                                )}
                            </g>
                        )
                    })}

                    {/* Invisible hover targets */}
                    {displayEntries.map(({ p, origIdx }, di) => (
                        <circle
                            key={`hit-${origIdx}`}
                            cx={di * 10}
                            cy={130 - (p.z ?? 0.5) * 110}
                            r={8}
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => onHover(origIdx)}
                            onMouseLeave={() => onHover(null)}
                        />
                    ))}

                </svg>
            </div>
        </div>
    )
}
