/**
 * Asset manifest tests.
 * Verifies that every file under public/assets/ (excluding ATTRIBUTIONS.md itself)
 * is listed in ATTRIBUTIONS.md, and every filename referenced in ATTRIBUTIONS.md
 * exists on disk. Catches missing entries and orphaned files before they reach CI.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../../public/assets');
const ATTRIBUTIONS_PATH = join(ASSETS_DIR, 'ATTRIBUTIONS.md');

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkDir(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function getAttributionFilenames(md) {
  // Match backtick-quoted paths like `sprites/sheet.png` or `audio/sfx/sfx_shoot.ogg`
  const matches = [...md.matchAll(/`((?:sprites|audio|fonts)[^`]+)`/g)];
  return matches.map((m) => m[1]);
}

describe('Asset manifest', () => {
  const attributionsRaw = readFileSync(ATTRIBUTIONS_PATH, 'utf8');
  const referencedPaths = getAttributionFilenames(attributionsRaw);

  const allFiles = walkDir(ASSETS_DIR)
    .filter((f) => !f.endsWith('ATTRIBUTIONS.md'))
    .map((f) => relative(ASSETS_DIR, f));

  it('every file on disk is referenced in ATTRIBUTIONS.md', () => {
    const missing = allFiles.filter((f) => !referencedPaths.includes(f));
    expect(missing, `Files on disk not in ATTRIBUTIONS.md:\n${missing.join('\n')}`).toEqual([]);
  });

  it('every filename in ATTRIBUTIONS.md exists on disk', () => {
    const orphans = referencedPaths.filter((p) => !allFiles.includes(p));
    expect(orphans, `ATTRIBUTIONS.md references missing files:\n${orphans.join('\n')}`).toEqual([]);
  });
});
