// Guardia anti-PII: ningún archivo de código o contenido debe incluir correos
// electrónicos o números de teléfono. Es una PWA estática y offline; no hay
// motivo para almacenar datos personales en el repositorio.
//
// Uso: `node scripts/check-no-pii.mjs` (sale con código 1 si encuentra PII).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aquí = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(aquí, '..');

// Carpetas a inspeccionar (código fuente y contenido del repo).
const OBJETIVOS = ['src', 'public'];

// Extensiones de archivos de código/contenido a inspeccionar.
const EXTENSIONES = new Set(['.ts', '.js', '.mjs', '.json', '.css', '.html', '.md']);

// Los archivos *.test.* contienen mocks deliberados; no representan PII real.
function esArchivoDePrueba(ruta) {
  return /\.test\.[cm]?[jt]s$/.test(ruta);
}

function listarArchivos(dir) {
  const salida = [];
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) {
      salida.push(...listarArchivos(ruta));
    } else if (EXTENSIONES.has(extname(ruta)) && !esArchivoDePrueba(ruta)) {
      salida.push(ruta);
    }
  }
  return salida;
}

// Correo electrónico básico (exige TLD, evita rutas tipo a@b).
const RE_EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
// Teléfono: número con prefijo internacional explícito (+34 600 123 456, etc.).
// Restringir a la forma con `+` evita falsos positivos con literales enteros
// largos y tuplas numéricas de código/CSS, que no son PII.
const RE_TELEFONO = /\+\d{1,3}[\s.-]?(?:\d[\s.-]?){8,}\d/;

const culpables = [];
for (const objetivo of OBJETIVOS) {
  const dir = join(RAIZ, objetivo);
  let existe;
  try {
    existe = statSync(dir).isDirectory();
  } catch {
    existe = false;
  }
  if (!existe) {
    continue;
  }
  for (const archivo of listarArchivos(dir)) {
    const texto = readFileSync(archivo, 'utf8');
    const tipos = [];
    if (RE_EMAIL.test(texto)) {
      tipos.push('email');
    }
    if (RE_TELEFONO.test(texto)) {
      tipos.push('teléfono');
    }
    if (tipos.length > 0) {
      culpables.push(`${archivo} (${tipos.join(', ')})`);
    }
  }
}

if (culpables.length > 0) {
  console.error('Posible PII detectada en:');
  for (const c of culpables) {
    console.error(`  - ${c}`);
  }
  process.exit(1);
}

console.log('OK: no se detectó PII (emails ni teléfonos) en el repositorio.');
