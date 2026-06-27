// Copia de seguridad de los datos del usuario (exportar/importar/reset).
// Autocontenido: usa la capa de almacenamiento existente (get/getAll/putAll/clearStore).

import { clearStore, getAll, putAll, STORES } from '../../core/storage';

export interface CopiaSeguridad {
  /** Marca de formato para validar la entrada al importar. */
  app: 'practicas-de-chino';
  version: 1;
  exportadoEn: string;
  /** Mapa store -> filas. */
  datos: Record<string, unknown[]>;
}

const MARCA: CopiaSeguridad['app'] = 'practicas-de-chino';
const VERSION: CopiaSeguridad['version'] = 1;

/** Recoge todas las filas de todos los stores en un objeto serializable. */
export async function exportarDatos(): Promise<CopiaSeguridad> {
  const datos: Record<string, unknown[]> = {};
  for (const store of STORES) {
    datos[store.name] = await getAll<unknown>(store.name);
  }
  return {
    app: MARCA,
    version: VERSION,
    exportadoEn: new Date().toISOString(),
    datos,
  };
}

/** Valida que un objeto desconocido tenga la forma de una CopiaSeguridad. */
export function esCopiaValida(valor: unknown): valor is CopiaSeguridad {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const obj = valor as Record<string, unknown>;
  if (obj['app'] !== MARCA || obj['version'] !== VERSION) {
    return false;
  }
  const datos = obj['datos'];
  if (typeof datos !== 'object' || datos === null) {
    return false;
  }
  return Object.values(datos as Record<string, unknown>).every((filas) => Array.isArray(filas));
}

/** Parsea y valida el JSON de una copia; lanza si es inválido. */
export function parsearCopia(texto: string): CopiaSeguridad {
  let parseado: unknown;
  try {
    parseado = JSON.parse(texto);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  if (!esCopiaValida(parseado)) {
    throw new Error('El archivo no es una copia de seguridad de Prácticas de Chino.');
  }
  return parseado;
}

/**
 * Importa una copia: vacía cada store conocido y vuelve a poblarlo.
 * Sólo toca los stores presentes en STORES (ignora claves desconocidas).
 */
export async function importarDatos(copia: CopiaSeguridad): Promise<void> {
  for (const store of STORES) {
    const filas = copia.datos[store.name];
    await clearStore(store.name);
    if (filas && filas.length > 0) {
      await putAll(store.name, filas);
    }
  }
}

/** Borra todos los datos del usuario de todos los stores. */
export async function resetearDatos(): Promise<void> {
  for (const store of STORES) {
    await clearStore(store.name);
  }
}

/** Nombre de archivo sugerido para la exportación. */
export function nombreArchivoCopia(fecha: Date = new Date()): string {
  const iso = fecha.toISOString().slice(0, 10);
  return `practicas-de-chino-copia-${iso}.json`;
}
