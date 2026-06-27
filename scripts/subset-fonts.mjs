// Self-host de fuentes para offline real (clave: fuentes).
//
// Qué hace:
//  1) Recopila el conjunto de caracteres realmente usados: todos los hanzi de
//     TODO el contenido semilla (cualquier .ts de src/content/, salvo index.ts y
//     *.test.ts: incluye hsk.ts, hsk-extra.ts, chengyu.ts, chengyu-extra.ts,
//     textos-extra.ts...), más una base Latin + signos + pinyin con diacríticos
//     y los hanzi de la UI.
//  2) Descarga los TTF fuente desde el repo google/fonts (raw) — o usa los TTF
//     locales si ya existen en .cache/fonts — para Ma Shan Zheng y Noto Serif SC
//     (weights 400/500/700, instanciando el eje wght de la fuente variable).
//  3) Subsetea con el paquete npm "subset-font" a woff2 y escribe en public/fonts/.
//
// Errores de red: mensaje claro y salida con código 1. Si la descarga falla,
// mantén el <link> de Google Fonts como fallback (ver integration_notes).
//
// Uso: npm run fonts

import { mkdir, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import process from 'node:process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content');
const OUT_DIR = join(ROOT, 'public', 'fonts');
const CACHE_DIR = join(ROOT, '.cache', 'fonts');

// --- 1) Conjunto de caracteres ------------------------------------------------

// Base Latin imprimible + signos comunes + comillas/guiones tipográficos.
export const LATIN_BASE =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`' +
  'abcdefghijklmnopqrstuvwxyz{|}~' +
  '¿¡«»“”‘’–—…·';

// Pinyin: vocales con tonos (1-4) en min/may + ü y sus combinaciones tonales.
export const PINYIN_DIACRITICS = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹ' + 'ĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛÜ';

// Hanzi usados en la UI (navegación, sellos, etc.).
export const UI_HANZI = '练中文家词读听写诊进设净';

/** ¿Es un punto de código un ideograma CJK o signo CJK que queremos subsetear? */
export function esHanzi(cp) {
  return (
    (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified Ideographs
    (cp >= 0x3400 && cp <= 0x4dbf) || // Extensión A
    (cp >= 0x3000 && cp <= 0x303f) || // signos CJK (，。？！…「」)
    (cp >= 0xff00 && cp <= 0xffef) // formas anchas (，！？fullwidth)
  );
}

/** Extrae los hanzi (deduplicados) presentes en un texto cualquiera. */
export function recolectarHanzi(texto) {
  const set = new Set();
  for (const ch of texto) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;
    if (esHanzi(cp)) set.add(ch);
  }
  return set;
}

/**
 * Construye la cadena final de glifos a incluir: base Latin + pinyin + hanzi de
 * UI + todos los hanzi del texto de contenido pasado. Sin duplicados.
 */
export function construirSet(textoContenido) {
  const set = new Set();
  for (const ch of LATIN_BASE) set.add(ch);
  for (const ch of PINYIN_DIACRITICS) set.add(ch);
  for (const ch of UI_HANZI) set.add(ch);
  for (const ch of recolectarHanzi(textoContenido)) set.add(ch);
  return [...set].join('');
}

/**
 * Lee y concatena el texto de todos los .ts de src/content/ (salvo index.ts y
 * *.test.ts). No compilamos TS: solo necesitamos los glifos, así que basta con
 * el texto crudo de los literales (luego filtramos por carácter).
 */
async function leerTextoContenido() {
  let entradas;
  try {
    entradas = await readdir(CONTENT_DIR);
  } catch (err) {
    console.error(`No se pudo leer src/content/: ${String(err)}`);
    process.exit(1);
  }
  const archivos = entradas.filter(
    (n) => n.endsWith('.ts') && n !== 'index.ts' && !n.endsWith('.test.ts'),
  );
  if (archivos.length === 0) {
    console.error('No se encontraron archivos de contenido en src/content/.');
    process.exit(1);
  }
  let texto = '';
  for (const nombre of archivos) {
    texto += await readFile(join(CONTENT_DIR, nombre), 'utf8');
  }
  return texto;
}

// --- 2) Fuentes fuente (TTF) --------------------------------------------------

const RAW = 'https://raw.githubusercontent.com/google/fonts/main';

/** Cada destino woff2 con su TTF fuente y, si aplica, la instancia de peso. */
const FUENTES = [
  {
    out: 'MaShanZheng-Regular.woff2',
    url: `${RAW}/ofl/mashanzheng/MaShanZheng-Regular.ttf`,
    cache: 'MaShanZheng-Regular.ttf',
    // Estática: un único peso.
  },
  {
    out: 'NotoSerifSC-400.woff2',
    url: `${RAW}/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf`,
    cache: 'NotoSerifSC[wght].ttf',
    weight: 400,
  },
  {
    out: 'NotoSerifSC-500.woff2',
    url: `${RAW}/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf`,
    cache: 'NotoSerifSC[wght].ttf',
    weight: 500,
  },
  {
    out: 'NotoSerifSC-700.woff2',
    url: `${RAW}/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf`,
    cache: 'NotoSerifSC[wght].ttf',
    weight: 700,
  },
];

async function existe(ruta) {
  try {
    await stat(ruta);
    return true;
  } catch {
    return false;
  }
}

/** Devuelve el TTF como Buffer: desde caché si existe, si no lo descarga. */
async function obtenerTtf(url, cacheNombre) {
  const cacheRuta = join(CACHE_DIR, cacheNombre);
  if (await existe(cacheRuta)) {
    return readFile(cacheRuta);
  }
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(
      `Error de red al descargar ${url}\n` +
        'Comprueba tu conexión. Si no hay red, conserva el <link> de Google Fonts en index.html como fallback.',
      { cause: err },
    );
  }
  if (!res.ok) {
    throw new Error(
      `Descarga fallida (${res.status} ${res.statusText}) de ${url}\n` +
        'La ruta del repo google/fonts pudo cambiar. Revisa la URL o coloca el TTF manualmente en .cache/fonts/.',
    );
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(cacheRuta, buf);
  return buf;
}

// --- 3) Subset a woff2 --------------------------------------------------------

/** Carga perezosa de subset-font con mensaje claro si falta la dependencia. */
async function cargarSubsetFont() {
  try {
    // Especificador en variable: evita que el analizador de imports de Vite
    // intente resolver "subset-font" al transformar este archivo en los tests.
    const especificador = 'subset-font';
    const mod = await import(especificador);
    return mod.default ?? mod;
  } catch {
    console.error('\nFalta la dependencia "subset-font". Instálala con:\n  npm i -D subset-font\n');
    process.exit(1);
  }
}

async function main() {
  const subsetFont = await cargarSubsetFont();
  const texto = await leerTextoContenido();
  const chars = construirSet(texto);
  console.log(`Glifos a incluir: ${[...chars].length} caracteres únicos.`);

  await mkdir(OUT_DIR, { recursive: true });

  let fallos = 0;
  for (const f of FUENTES) {
    try {
      const ttf = await obtenerTtf(f.url, f.cache);
      const opciones = { targetFormat: 'woff2' };
      if (typeof f.weight === 'number') {
        // Instancia el eje wght de la fuente variable al peso deseado.
        opciones.variationAxes = { wght: f.weight };
      }
      const woff2 = await subsetFont(ttf, chars, opciones);
      await writeFile(join(OUT_DIR, f.out), woff2);
      console.log(`  ✓ ${f.out}  (${(woff2.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      fallos += 1;
      console.error(`  ✗ ${f.out}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (fallos > 0) {
    console.error(
      `\n${fallos} fuente(s) no se generaron. Mantén el <link> de Google Fonts en index.html como fallback hasta resolverlo.`,
    );
    process.exit(1);
  }
  console.log('\nListo. Fuentes self-host en public/fonts/.');
}

// Solo ejecuta main() cuando se invoca como script (no al importarlo en tests).
// realpathSync resuelve symlinks (p. ej. /tmp -> /private/tmp en macOS).
const invocadoDirectamente =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;

if (invocadoDirectamente) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
