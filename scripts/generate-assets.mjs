// Génère les PNG de l'app et les exports de marque à partir de assets/brand/chevron-*.svg.
// Usage: npm run assets
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = join(root, 'assets/brand');
const imagesDir = join(root, 'assets/images');
const exportsDir = join(brandDir, 'exports');

const PINK = '#FF2D55';

/** @param {'pink'|'white'|'black'} color */
function loadChevron(color) {
  const svg = readFileSync(join(brandDir, `chevron-${color}.svg`), 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const [, , vw, vh] = viewBox.split(/\s+/).map(Number);
  return { viewBox, inner, ratio: vh / vw };
}

/**
 * Chevron centré sur un canvas carré.
 * @param {{size:number, color:'pink'|'white'|'black', width:number, background?:string}} o
 *   width = largeur du chevron en fraction du canvas (0-1)
 */
function render({ size, color, width, background }) {
  const chevron = loadChevron(color);
  const w = size * width;
  const h = w * chevron.ratio;
  const x = (size - w) / 2;
  const y = (size - h) / 2;
  const bg = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${bg}<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${chevron.viewBox}">${chevron.inner}</svg></svg>`;
  return new Resvg(svg).render().asPng();
}

function write(dir, name, png) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), png);
  console.log(`✔ ${join(dir, name).replace(root + '/', '')}`);
}

// Assets utilisés par app.config.ts
write(imagesDir, 'icon.png', render({ size: 1024, color: 'white', width: 0.75, background: PINK }));
write(
  imagesDir,
  'favicon.png',
  render({ size: 196, color: 'white', width: 0.75, background: PINK }),
);
write(imagesDir, 'splash-icon.png', render({ size: 400, color: 'white', width: 0.93 }));
// Android adaptive: le chevron doit rester dans la zone visible (cercle central ~66%)
write(
  imagesDir,
  'android-icon-foreground.png',
  render({ size: 1024, color: 'pink', width: 0.716 }),
);
write(
  imagesDir,
  'android-icon-monochrome.png',
  render({ size: 1024, color: 'black', width: 0.716 }),
);

// Exports de marque (fond transparent, marge 10%)
for (const color of ['pink', 'white', 'black']) {
  for (const size of [512, 1024]) {
    write(exportsDir, `chevron-${color}-${size}.png`, render({ size, color, width: 0.8 }));
  }
}
