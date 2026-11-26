import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  TONES, PROSE_TONES, RANGES, VOICES, parseText, rodFor, placeVoice, placeChordVoices, parseValue, resolvePattern, setPhrase, compose,
} from '../experiments/arca/engine.mjs';

const dir = new URL('../experiments/arca/', import.meta.url);
const tables = JSON.parse(readFileSync(new URL('tables.json', dir), 'utf8'));
const html = readFileSync(new URL('index.html', dir), 'utf8');

// ---------- the transcribed tables ----------
for (const pinax of ['I', 'II']) {
  test(`Pinax ${pinax} has rods for 2 to 6 syllables`, () => {
    assert.deepEqual(tables[pinax].columns.map((c) => c.syllables), [2, 3, 4, 5, 6]);
  });
  test(`Pinax ${pinax}: every block has four voices of the right length, values 1–8`, () => {
    for (const col of tables[pinax].columns) {
      assert.ok(col.vperms.length >= 1, `${col.syllables}: no blocks`);
      for (const [b, block] of col.vperms.entries()) {
        assert.equal(block.length, 4, `${col.syllables} block ${b + 1}`);
        for (const row of block) {
          assert.equal(row.length, col.syllables, `${col.syllables} block ${b + 1}`);
          for (const n of row) assert.ok(Number.isInteger(n) && n >= 1 && n <= 8, `${col.syllables} block ${b + 1}: ${n}`);
        }
      }
    }
  });
  test(`Pinax ${pinax}: every rhythm has one note per syllable`, () => {
    for (const col of tables[pinax].columns) {
      assert.ok(col.rhythms.duple.length >= 1, `${col.syllables}: no duple rhythm`);
      for (const meter of ['duple', 'tripleMajor', 'tripleMinor']) {
        for (const pattern of col.rhythms[meter] ?? []) {
          const notes = resolvePattern(pattern, meter).filter((v) => !v.rest).length;
          assert.equal(notes, col.syllables, `${col.syllables} ${meter} ${pattern.join(' ')}`);
        }
      }
    }
  });
}

// ---------- the engine ----------
test('commas and lines end phrases; backticks mark long syllables', () => {
  const p = parseText('`A-ve Ma-`ri-a, `gra-ti-a `ple-na\nLau-`da-te `Do-mi-num');
  assert.deepEqual(p.map((x) => x.syllables.length), [5, 5, 6]);
  assert.deepEqual(p.map((x) => x.penultLong), [true, true, false]);
});

test('phrases longer than six syllables split at word breaks', () => {
  const p = parseText('in-ter-ces-si-o-ne `sanc-to-rum');
  assert.ok(p.every((x) => x.syllables.length <= 6));
});

test('a long penultimate takes Pinax I, a short one Pinax II', () => {
  assert.deepEqual(rodFor({ syllables: ['a', 'b', 'c'], penultLong: true }), { pinax: 'I', column: 1 });
  assert.deepEqual(rodFor({ syllables: ['a', 'b', 'c', 'd'], penultLong: false }), { pinax: 'II', column: 2 });
});

test('the prose pinakes allow every tone except IV and V', () => {
  assert.deepEqual(PROSE_TONES, ['I', 'II', 'III', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']);
});

test('numbers map to the tone’s scale: 1 and 8 are the final', () => {
  for (const [name, t] of Object.entries(TONES)) {
    assert.equal(t.degrees.length, 8, name);
    assert.equal(t.degrees[0].step, t.degrees[7].step, name);
  }
  const [p1] = placeVoice([1], 'I', 'Cantus');
  assert.equal(p1.step, 'D');
  const [p7] = placeVoice([7], 'I', 'Cantus');
  assert.deepEqual([p7.step, p7.alter], ['C', 1]); // Tone I raises its seventh
});

test('octave placement keeps each voice in range for every block', () => {
  for (const pinax of ['I', 'II']) for (const col of tables[pinax].columns) for (const block of col.vperms) {
    for (const tone of PROSE_TONES) {
      VOICES.forEach((v, i) => {
        const [lo, hi] = RANGES[v];
        for (const p of placeVoice(block[i], tone, v)) assert.ok(p.midi >= lo - 2 && p.midi <= hi + 2, `${pinax} ${col.syllables} ${tone} ${v} ${p.midi}`);
      });
    }
  }
});

test('a setting has one sounding slot per syllable, four pitches each', () => {
  const [phrase] = parseText('Lau-`da-te `Do-mi-num');
  const s = setPhrase(tables, phrase, { tone: 'II', meter: 'duple', vperm: 3, rperm: 1 });
  const sounding = s.events.filter((e) => !e.rest);
  assert.equal(sounding.length, 6);
  assert.deepEqual(sounding.map((e) => e.syllable), phrase.syllables);
  for (const e of sounding) assert.equal(e.pitches.length, 4);
});

test('the chosen block’s numbers are the ones sounded', () => {
  const [phrase] = parseText('`A-ve Ma-`ri-a');
  const s = setPhrase(tables, phrase, { tone: 'XI', meter: 'duple', vperm: 2, rperm: 0 });
  const block = tables.I.columns[3].vperms[2];
  s.events.filter((e) => !e.rest).forEach((e, i) => assert.deepEqual(e.degrees, block.map((r) => r[i])));
});

test('metre changes the note values', () => {
  const [phrase] = parseText('`A-ve Ma-`ri-a');
  const d = setPhrase(tables, phrase, { tone: 'XI', meter: 'duple', vperm: 0, rperm: 0 });
  const t = setPhrase(tables, phrase, { tone: 'XI', meter: 'tripleMajor', vperm: 0, rperm: 0 });
  assert.notDeepEqual(d.pattern.map((v) => v.base + v.dotted), t.pattern.map((v) => v.base + v.dotted));
});

test('compose runs phrases back to back', () => {
  const ph = parseText('`A-ve Ma-`ri-a, `gra-ti-a `ple-na');
  const s = compose(tables, ph, { tone: 'I', meter: 'duple', choices: [] });
  assert.equal(s[1].start, s[0].length);
});

test('the page credits Kircher and says what it decided', () => {
  assert.match(html, /Musurgia Universalis/);
  assert.match(html, /What this version decides/);
  assert.match(html, /transcribed for this page/);
});

test('every triple pattern fills whole groups of three once perfection is resolved', () => {
  for (const pinax of ['I', 'II']) for (const col of tables[pinax].columns) for (const meter of ['tripleMajor', 'tripleMinor']) {
    for (const pattern of col.rhythms[meter]) {
      const units = resolvePattern(pattern, meter).reduce((a, v) => a + v.minims, 0) / (meter === 'tripleMajor' ? 2 : 1);
      assert.equal(units % 3, 0, `${pinax} ${col.syllables} ${meter} ${pattern.join(' ')}`);
    }
  }
});

test('every emendation records what was printed, what is used and why', () => {
  assert.ok(tables.emendations.length > 0);
  for (const e of tables.emendations) assert.ok(e.printed !== undefined && e.used !== undefined && e.why.length > 10);
});

test('phrasing never drops a syllable and keeps every phrase at 2–6', () => {
  for (const t of ['O, Lau-da-te Do-mi-num', 'et Lau-da-te Do-mi-num', 'Lau-da-te Do-mi-num et', 'Lau-da-te Do-mi-num-que',
    'in-ter-ces-si-o-ne `sanc-to-rum', 'Be-ne-dic-tus qui ve-nit in no-mi-ne Do-mi-ni']) {
    const ph = parseText(t);
    const count = t.split(/[\s,-]+/).filter(Boolean).length;
    assert.equal(ph.reduce((n, p) => n + p.syllables.length, 0), count, t);
    for (const p of ph) assert.ok(p.syllables.length >= 2 && p.syllables.length <= 6, `${t}: ${p.syllables.join('-')}`);
  }
});

test('phrases split at word breaks when they can', () => {
  assert.deepEqual(parseText('et Lau-da-te Do-mi-num').map((p) => p.syllables.join('')), ['etLaudate', 'Dominum']);
});

test('in every block and tone the bass is the lowest voice and no voice crosses the one above', () => {
  let crossed = 0, total = 0;
  for (const pinax of ['I', 'II']) for (const col of tables[pinax].columns) for (const block of col.vperms) for (const tone of PROSE_TONES) {
    const v = placeChordVoices(block, tone);
    for (let n = 0; n < col.syllables; n++) {
      total++;
      const [c, a, t, b] = v.map((voice) => voice[n].midi);
      assert.ok(b < Math.min(c, a, t), `${pinax} ${col.syllables} ${tone}: bass ${b} not lowest of ${c} ${a} ${t}`);
      if (a > c || t > a) crossed++;
    }
  }
  assert.equal(crossed, 0, `${crossed} of ${total} chords cross`);
});

test('an unclear rest in duple fills out a whole semibreve', () => {
  const r = resolvePattern(['R?', 'Sm', 'SmD', 'Fs', 'Sb'], 'duple');
  assert.equal(r.reduce((a, v) => a + v.minims, 0) % 2, 0);
});

test('chord placement keeps voices near their ranges (bass may dip to stay lowest)', () => {
  let out = 0, n = 0;
  for (const pinax of ['I', 'II']) for (const col of tables[pinax].columns) for (const block of col.vperms) for (const tone of PROSE_TONES) {
    placeChordVoices(block, tone).forEach((voice, i) => voice.forEach((p) => {
      const [lo, hi] = RANGES[VOICES[i]]; n++;
      if (p.midi < lo || p.midi > hi) out++;
      assert.ok(p.midi >= lo - 8 && p.midi <= hi + 4, `${VOICES[i]} ${p.midi}`);
    }));
  }
  assert.ok(out / n < 0.06, `${out} of ${n} notes outside range`);
});
