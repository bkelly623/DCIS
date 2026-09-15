import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeText } from './export-public.mjs';
export function checkBundle(directory) {
  let count = 0, javascript = '';
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      assertSafeText(entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symlink in public bundle');
      if (entry.isDirectory()) { walk(path); continue; }
      if (entry.name.endsWith('.map')) throw new Error('Source maps must not ship');
      const text = readFileSync(path).toString('utf8');
      assertSafeText(text);
      // Internal metadata keys must be absent even in minified object literals.
      if (/(?:["']?\b(?:evidence|provenance|confidence|source_photo|contributor|labelDetail|publicUse)["']?\s*:)/i.test(text)) throw new Error(`Internal metadata in ${path}`);
      if (entry.name.endsWith('.js')) javascript += text;
      count++;
    }
  }
  walk(directory);
  if (!javascript.includes('Pectolite & Prehnite') || !javascript.includes('Identification is tentative') || !javascript.includes('not an institutionally approved catalog')) throw new Error('Expected public content/disclaimer missing from bundle');
  return count;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(`Public bundle exclusion passed: ${checkBundle(fileURLToPath(new URL('../dist', import.meta.url)))} emitted files scanned`);
