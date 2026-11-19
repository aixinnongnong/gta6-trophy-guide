// Leonida Trophy Guide — the program that hands the guide in (Node 22, standard
// library only). The guide is app/: plain static files a desktop browser opens
// offline (app/index.html, app.js, style.css, data/trophies.json with the 55
// official trophies and our own-words guides). This program copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads, with the vendored make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
const dossierPath = join(out, 'dossier.json');
const dossier = buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 });
writeFileSync(dossierPath, dossier);

// Validate what we just wrote: the dossier must parse back as JSON and carry the
// screenshots and app files the judge reads, or the entry is broken on arrival.
const check = JSON.parse(readFileSync(dossierPath, 'utf8'));
if (!check || typeof check !== 'object' || check.schema !== 'makefun/dossier/v1' || !Array.isArray(check.images) || check.images.length < 3) {
  throw new Error(`dossier.json at ${dossierPath} failed validation: expected a makefun/dossier/v1 dossier with at least 3 images`);
}
console.log(`wrote ${dossierPath} (${Buffer.byteLength(dossier)} bytes, ${check.images.length} screenshots)`);
