import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { sourceURL, outputURL, validatePublic, renderPublic, assertSafeText } from '../scripts/export-public.mjs';
import { checkBundle } from '../scripts/check-public-bundle.mjs';
const data = JSON.parse(readFileSync(sourceURL, 'utf8'));

test('deterministic export has no drift and preserves lookup coverage', () => {
  assert.equal(renderPublic(data), readFileSync(outputURL, 'utf8'));
  assert.equal(data.records.filter(r => r.images).length, 28);
  for (const n of [1,2,3,4,5,6,7,8,9,11,12,18,19]) assert.equal(data.records.filter(r => r.images && r.displayId === `MH-DISP-${String(n).padStart(3,'0')}`).length, 2);
  assert.equal(data.records.filter(r => r.images && r.displayId === 'MH-WORK-MINERAL-ISLAND').length, 2);
  for (const r of data.records.filter(r => r.images)) for (const image of r.images) assert.ok(existsSync(new URL(`../public${image.src}`, import.meta.url)));
});
test('all map geometry is unchanged', () => {
  const geometry = data.mapItems.map(({id,x,y,width,height}) => ({id,x,y,width,height}));
  assert.deepEqual(geometry, JSON.parse(readFileSync(new URL('./map-geometry.json', import.meta.url))));
});
test('tentative identities remain qualified and uncertain locality is not exported', () => {
  for (let n = 39; n <= 44; n++) assert.equal(data.records.find(r => r.id === `MH-SPEC-0${n}`), undefined);
  assert.equal(data.records.find(r => r.id === 'MH-SPEC-009').description, undefined);
  assert.ok(!JSON.stringify(data).includes('Quarry'));
});
test('schema fails closed on private, confidence, approval and unknown fields', () => {
  for (const key of ['evidence','confidence','provenance','labelDetail','publicUse','approved','source_photo','notes','contributor']) {
    const copy = structuredClone(data); copy.records[0][key] = 'test';
    assert.throws(() => validatePublic(copy));
  }
  const copy = structuredClone(data); copy.notice = 'Approved catalog';
  assert.throws(() => validatePublic(copy));
});
test('private text cannot hide in allowed fields; invalid references are rejected', () => {
  for (const value of ['Telegram', 'Brendan', 'IMG-043', '/home/user/private.jpg', 'knowledge-base/internal-building-reference.json', 'source-photo inspection']) {
    const copy = structuredClone(data); copy.records[0].description = value;
    assert.throws(() => renderPublic(copy));
  }
  const copy = structuredClone(data); copy.records[0].displayId = 'missing';
  assert.throws(() => validatePublic(copy));
});
test('browser source contains no internal imports or removed staff renderer', () => {
  for (const name of ['main.tsx', 'data.ts', 'Discovery.tsx', 'mineralHallKnowledge.ts']) assertSafeText(readFileSync(new URL(`../src/${name}`, import.meta.url), 'utf8'));
});
test('emitted artifact scanner rejects leaks and source maps, not just rendering', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dcis-public-'));
  try {
    const js = 'Pectolite & Prehnite; Identification is tentative; not an institutionally approved catalog';
    writeFileSync(join(dir, 'app.js'), js);
    assert.equal(checkBundle(dir), 1);
    writeFileSync(join(dir, 'app.js'), js + '; evidence:["private"]');
    assert.throws(() => checkBundle(dir));
    writeFileSync(join(dir, 'app.js'), js);
    writeFileSync(join(dir, 'app.js.map'), '{}');
    assert.throws(() => checkBundle(dir));
  } finally { rmSync(dir, {recursive:true, force:true}); }
});
test('local historical recovery is inert and canonical field statuses survive', t => {
  const recovery = new URL('../../../knowledge-base/recovery-2026-09-15/synchronize-records.py', import.meta.url);
  // Private KB is intentionally absent from a clean checkout/CI.
  if (!existsSync(recovery)) { t.skip('Local-only recovery/KB not present'); return; }
  const kb = new URL('../../../knowledge-base/', import.meta.url);
  const paths = ['mineral-hall-specimen-ledger.json','mineral-hall-exhibit-ledger.json','mineral-hall-app-layout.json'].map(p => new URL(p,kb));
  const before = paths.map(p => readFileSync(p));
  const appBefore = readFileSync(outputURL);
  const run = spawnSync('python3', [recovery.pathname], {encoding:'utf8'});
  assert.equal(run.status, 1); assert.match(run.stderr, /Retired recovery script/);
  paths.forEach((p,i) => assert.deepEqual(readFileSync(p),before[i]));
  assert.deepEqual(readFileSync(outputURL), appBefore);
  const canonical = JSON.parse(before[0]);
  assert.equal(canonical.records.find(r => r.id === 'MH-SPEC-009').locality_status, 'partial');
  assert.equal(canonical.records.find(r => r.id === 'MH-SPEC-039').label_audit_status, 'retained_90_percent_identification');
  assert.equal(canonical.records.find(r => r.id === 'MH-SPEC-002').locality_status, 'not_recorded');
});
