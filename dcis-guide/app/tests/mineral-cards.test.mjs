import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceURL,validatePublic} from '../scripts/export-public.mjs';
const data=JSON.parse(readFileSync(sourceURL,'utf8'));
test('selected IDs retain exact curated display associations',()=>{
 const pairs=[[1,677,678],[2,60,61],[3,82,83],[4,37,38],[5,145,146],[6,174,175],[7,201,202],[8,241,242],[9,307,309],[11,389,397],[12,429,430],[18,432,433],[19,448,449]];
 for(const [display,...ids] of pairs) for(const id of ids) assert.equal(data.records.find(r=>r.id===`DCIS-WR-${String(id).padStart(6,'0')}`).displayId,`MH-DISP-${String(display).padStart(3,'0')}`);
 for(const id of [493,494]) assert.equal(data.records.find(r=>r.id===`DCIS-WR-${String(id).padStart(6,'0')}`).displayId,'MH-WORK-MINERAL-ISLAND');
});
test('images and browse registry reject private fields and unsafe paths',()=>{
 for(const field of ['source_path','approved','question','notes','confidence']) {
  const d=structuredClone(data);d.records.find(r=>r.images).images[0][field]='private';assert.throws(()=>validatePublic(d));
 }
 for(const src of ['https://example.com/image.webp','/assets/mineral-hall/../private.webp','/home/private.jpg','/assets/mineral-hall/DCIS-WR-999999-normal.webp']) {
  const d=structuredClone(data);d.records.find(r=>r.images).images[0].src=src;assert.throws(()=>validatePublic(d));
 }
 const d=structuredClone(data);d.browseDisplays[0].x=100;assert.throws(()=>validatePublic(d));
});
