import React, {useLayoutEffect, useState} from 'react';
import {CanvasTexture, SRGBColorSpace} from 'three';
import {atlasPosition, wordColor, WORDS_PER_SHEET} from '../model.js';
import {PAGE_WIDTH, PAGE_HEIGHT, WORD_SIZE, pageWordAt} from '../book-reading.js';

export function BookPageWords({model, page, back, step, onOccurrence}) {
  const [texture, setTexture] = useState(null);
  useLayoutEffect(() => {
    const canvas = document.createElement('canvas');
    const scale = 480;
    canvas.width = PAGE_WIDTH * scale;
    canvas.height = PAGE_HEIGHT * scale;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#192017';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `500 ${WORD_SIZE * scale}px system-ui, sans-serif`;
    context.fillStyle = '#b8bdab';
    context.fillText(`Sheet ${page + 1}`, 0.42 * scale, 0.17 * scale);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const start = page * WORDS_PER_SHEET;
    for (const token of model.tokens.slice(start, start + WORDS_PER_SHEET)) {
      const [x, y] = atlasPosition(token.index);
      context.fillStyle = wordColor(token.word);
      context.fillText(model.text.slice(token.start, token.end),
        (PAGE_WIDTH / 2 + (back ? -x : x)) * scale,
        (PAGE_HEIGHT / 2 - y) * scale,
        0.305 * scale);
    }
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    setTexture(map);
    return () => {
      map.dispose();
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [model, page, back]);
  if (!texture) return null;
  return (
    <mesh position={[0, 0, -page * step]} rotation={[0, back ? Math.PI : 0, 0]} renderOrder={5}
      onClick={event => {
        event.stopPropagation();
        if (!event.uv || event.delta > 4) return;
        const index = pageWordAt(page, back, event.uv.x, event.uv.y, model.tokens.length);
        if (index !== null) onOccurrence(index);
      }}>
      <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} depthTest={false} depthWrite={false} />
    </mesh>
  );
}
