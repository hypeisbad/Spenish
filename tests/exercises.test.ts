import { describe, expect, it } from 'vitest';
import { UNITS, lessonsFor } from '../src/data/units';
import { buildLesson, checkBuild, tilesOf } from '../src/lib/exercises';
import { seeded, normalize } from '../src/lib/text';

describe('lesson generator', () => {
  for (const u of UNITS) {
    const ls = lessonsFor(u);
    ls.forEach((l, i) => {
      const which = l.review ? ('final' as const) : i;
      it(`${u.id} · ${String(which)}`, () => {
        for (let seed = 1; seed <= 25; seed++) {
          const exs = buildLesson(u, which, seeded(seed * 97 + i), true);
          expect(exs.length).toBeGreaterThan(5);
          for (const ex of exs) {
            if (ex.kind === 'mc' || ex.kind === 'listen') {
              expect(ex.options.length).toBe(4);
              expect(new Set(ex.options.map((o) => normalize(o))).size).toBe(4);
              expect(ex.answer).toBeGreaterThanOrEqual(0);
              const correct = ex.kind === 'listen' || ex.dir === 'en-es' ? ex.item.es : ex.item.en.split(' / ')[0];
              expect(ex.options[ex.answer]).toBe(correct);
            }
            if (ex.kind === 'match') {
              expect(ex.pairs.length).toBeGreaterThanOrEqual(3);
              expect(new Set(ex.pairs.map((p) => normalize(p.en))).size).toBe(ex.pairs.length);
              expect(new Set(ex.pairs.map((p) => normalize(p.es))).size).toBe(ex.pairs.length);
            }
            if (ex.kind === 'build') {
              expect(checkBuild(ex.answer, tilesOf(ex.es))).toBe(true);
              for (const w of ex.answer) expect(ex.tiles).toContain(w);
            }
            if (ex.kind === 'type') expect(ex.accepted).toContain(ex.item.es);
          }
        }
      });
    });
  }
  it('every unit has enough sentences and items', () => {
    for (const u of UNITS) {
      expect(u.items.length).toBeGreaterThanOrEqual(12);
      expect(u.sentences.length).toBeGreaterThanOrEqual(5);
      expect(new Set(u.items.map((x) => x.es)).size).toBe(u.items.length);
    }
  });
});
