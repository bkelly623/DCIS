import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = name => readFileSync(new URL(`../src/${name}`, import.meta.url), 'utf8');
test('legacy public routes withhold unsafe stop and unverified room imagery', () => {
  const data = source('data.ts');
  assert.doesNotMatch(data, /special-edge|Restricted Edge|flagship|polished first visit|mystery\/history/);
  assert.doesNotMatch(source('main.tsx'), /<img src=\{stop.asset\}/);
  assert.match(source('FirstFloorMap.tsx'), /out-and-back routes/);
});
test('navigation preserves display and prediction and uses truthful return labels', () => {
  const app = source('main.tsx');
  assert.match(app, /selectedId=\{mapSelection\} onSelect=\{setMapSelection\}/);
  assert.match(app, /onBack=\{\(\) => setPhase\("paths"\)\}/);
  assert.match(app, /onChoosePath=\{\(\) => setPhase\("paths"\)\}/);
  assert.match(source('Discovery.tsx'), /onMap\("4"\)/);
  assert.match(source('Discovery.tsx'), /dcis-glow-prediction/);
  assert.doesNotMatch(source('Discovery.tsx'), /Save it for later|What’s nearby/);
});
test('public record presentation omits raw schema type fallbacks and duplicate identities', () => {
  assert.match(source('main.tsx'), /record.type !== 'exhibit identity'/);
  assert.doesNotMatch(source('MineralSpecimenCard.tsx'), /record.description \?\? record.type/);
  assert.match(source('main.tsx'), /Number.isInteger\(value.stopIndex\)/);
  assert.match(source('main.tsx'), /Array.isArray\(value.completed\)/);
});
