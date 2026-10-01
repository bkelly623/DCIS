import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertSafeText } from '../scripts/export-public.mjs';
const map = readFileSync(new URL('../src/FirstFloorMap.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
test('first-floor source is curated public geometry, with no private model imports or labels', () => {
  assertSafeText(map);
  assert.doesNotMatch(map, /knowledge-base|render-private|staff|office|supply|rear bathroom|seating/i);
  const shapes = [...map.matchAll(/^  (\w+): '(M[^']+)'/gm)].map(m => [m[1],m[2]]);
  assert.deepEqual(shapes, [
    ['hall','M195 217.5 H640 V545 H375 V325 H195 Z'],
    ['inner','M195 450 H375 V545 H195 Z'],
    ['entrance','M195 545 H375 V700 H195 Z'],
    ['amenities','M45 545 H195 V700 H45 Z'],
    ['special','M375 545 H640 V700 H375 Z'],
  ]);
});
test('map is an accessible visual default with a direct detail and whole-floor return', () => {
  assert.match(map, /role="group" aria-labelledby="floor-title floor-desc"/);
  assert.match(map, /aria-live="polite"/);
  assert.match(map, /e.preventDefault\(\)/);
  assert.match(map, /bathroom symbols indicate an area, not an exact door/);
  assert.match(app, /phase === "orientation" && <FirstFloorMap/);
  assert.match(app, /Whole first floor/);
  assert.match(app, /map-number-controls/);
  assert.doesNotMatch(app, /BuildingOrientation|M650 230 H755/);
});
