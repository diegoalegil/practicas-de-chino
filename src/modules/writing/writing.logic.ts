// Lógica pura del módulo de escritura: selección y avance entre caracteres de la lección.
// Sin dependencias del DOM ni de hanzi-writer para que sea fácil de testear.

import type { CaracterLeccion } from './lessons';

export interface EstadoEscritura {
  /** Caracteres disponibles en la lección. */
  caracteres: readonly CaracterLeccion[];
  /** Índice del caracter seleccionado, o null si no hay ninguno elegido. */
  seleccion: number | null;
  /** Conjunto de índices ya practicados (quiz completado). */
  practicados: ReadonlySet<number>;
}

export function iniciarEscritura(caracteres: readonly CaracterLeccion[]): EstadoEscritura {
  return { caracteres, seleccion: null, practicados: new Set() };
}

/** Caracter actualmente seleccionado, o undefined si no hay selección válida. */
export function caracterSeleccionado(estado: EstadoEscritura): CaracterLeccion | undefined {
  if (estado.seleccion === null) {
    return undefined;
  }
  return estado.caracteres[estado.seleccion];
}

/** Selecciona un caracter por índice; ignora índices fuera de rango. */
export function seleccionar(estado: EstadoEscritura, indice: number): EstadoEscritura {
  if (indice < 0 || indice >= estado.caracteres.length) {
    return estado;
  }
  return { ...estado, seleccion: indice };
}

/** Vuelve a la lista (sin selección). */
export function deseleccionar(estado: EstadoEscritura): EstadoEscritura {
  return { ...estado, seleccion: null };
}

/** Marca el caracter indicado como practicado. */
export function marcarPracticado(estado: EstadoEscritura, indice: number): EstadoEscritura {
  if (indice < 0 || indice >= estado.caracteres.length) {
    return estado;
  }
  const practicados = new Set(estado.practicados);
  practicados.add(indice);
  return { ...estado, practicados };
}

/** Índice del siguiente caracter (circular); null si la lista está vacía. */
export function indiceSiguiente(estado: EstadoEscritura): number | null {
  const total = estado.caracteres.length;
  if (total === 0) {
    return null;
  }
  if (estado.seleccion === null) {
    return 0;
  }
  return (estado.seleccion + 1) % total;
}

/** Selecciona el siguiente caracter de forma circular. */
export function avanzar(estado: EstadoEscritura): EstadoEscritura {
  const siguiente = indiceSiguiente(estado);
  if (siguiente === null) {
    return estado;
  }
  return { ...estado, seleccion: siguiente };
}

/** ¿Está practicado el caracter de ese índice? */
export function estaPracticado(estado: EstadoEscritura, indice: number): boolean {
  return estado.practicados.has(indice);
}

/** Número de caracteres practicados (acotado al total de la lección). */
export function totalPracticados(estado: EstadoEscritura): number {
  let cuenta = 0;
  for (const indice of estado.practicados) {
    if (indice >= 0 && indice < estado.caracteres.length) {
      cuenta += 1;
    }
  }
  return cuenta;
}
