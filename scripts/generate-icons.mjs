// Genera el set de iconos PNG (PWA + apple-touch-icon) a partir de public/favicon.svg.
// Uso: npm run icons
import { mkdirSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

const PAPER = '#f3ead8';
const svg = readFileSync('public/favicon.svg');

mkdirSync('public/icons', { recursive: true });

// Iconos opacos (iOS rellena el alfa con negro: apple-touch-icon debe ser opaco).
const opaque = [
  { file: 'public/apple-touch-icon.png', size: 180 },
  { file: 'public/icons/icon-192.png', size: 192 },
  { file: 'public/icons/icon-512.png', size: 512 },
];

for (const { file, size } of opaque) {
  await sharp(svg).resize(size, size).flatten({ background: PAPER }).png().toFile(file);
}

// Icono maskable: contenido dentro de la zona segura (80%) sobre fondo papel.
const maskSize = 512;
const inner = Math.round(maskSize * 0.8);
const innerPng = await sharp(svg).resize(inner, inner).png().toBuffer();
await sharp({
  create: { width: maskSize, height: maskSize, channels: 4, background: PAPER },
})
  .composite([{ input: innerPng, gravity: 'center' }])
  .png()
  .toFile('public/icons/maskable-512.png');

console.log('Iconos generados en public/ y public/icons/.');
