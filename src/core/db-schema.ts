// Esquema de la base de datos y migraciones idempotentes.
//
// Centraliza la VERSIÓN del esquema y la función de migración para que tanto
// `storage.ts` (al abrir IndexedDB) como `backup.ts` (al importar datos)
// compartan la misma fuente de verdad.
//
// IMPORTANTE: las migraciones de IndexedDB sólo pueden manipular estructura
// (object stores e índices) dentro de `onupgradeneeded`. La transformación de
// datos por fila se hace de forma perezosa al leer/importar (ver `backup.ts`).

/** Versión actual del esquema de datos de la app. Súbela al cambiar stores. */
export const SCHEMA_VERSION = 2;

/** Nombres de los object stores. Fuente única para backup y migración. */
export const STORE_NAMES = ['cards', 'reviews', 'progress'] as const;

export type StoreName = (typeof STORE_NAMES)[number];

/** Histórico de versiones de DB de IndexedDB (entero monotónico creciente). */
export const DB_VERSIONS = {
  /** v1: stores iniciales cards/reviews/progress con sus índices. */
  INICIAL: 1,
  /** v2: añade índice `origen` a `cards` para filtrar por origen sin escanear. */
  INDICE_ORIGEN: 2,
} as const;

/**
 * Aplica las migraciones de ESTRUCTURA necesarias entre `oldVersion` y la
 * versión actual. Diseñada para llamarse desde `onupgradeneeded`, es
 * idempotente: cada bloque comprueba el estado antes de actuar, de modo que
 * relanzarla (p. ej. tras un fallo) no rompe nada.
 *
 * Nota: v0 -> v1 replica EXACTAMENTE los stores e índices que `storage.ts`
 * creaba con su array `STORES` (cards.due, reviews.fecha), de modo que una DB
 * recién creada queda idéntica a la anterior.
 *
 * @param db base de datos en curso de upgrade
 * @param tx transacción de versionchange activa (para acceder a stores existentes)
 * @param oldVersion versión previa (0 si la DB no existía)
 */
export function migrarEsquema(db: IDBDatabase, tx: IDBTransaction, oldVersion: number): void {
  // v0 -> v1: creación de stores base (idéntico al esquema original de storage.ts).
  if (oldVersion < DB_VERSIONS.INICIAL) {
    if (!db.objectStoreNames.contains('cards')) {
      const cards = db.createObjectStore('cards', { keyPath: 'id' });
      cards.createIndex('due', 'fsrs.due', { unique: false });
    }
    if (!db.objectStoreNames.contains('reviews')) {
      const reviews = db.createObjectStore('reviews', { keyPath: 'id' });
      reviews.createIndex('fecha', 'fecha', { unique: false });
    }
    if (!db.objectStoreNames.contains('progress')) {
      db.createObjectStore('progress', { keyPath: 'id' });
    }
  }

  // v1 -> v2: índice `origen` en `cards` (idempotente, no borra datos).
  if (oldVersion < DB_VERSIONS.INDICE_ORIGEN) {
    if (db.objectStoreNames.contains('cards')) {
      const cards = tx.objectStore('cards');
      if (!cards.indexNames.contains('origen')) {
        cards.createIndex('origen', 'origen', { unique: false });
      }
    }
  }
}
