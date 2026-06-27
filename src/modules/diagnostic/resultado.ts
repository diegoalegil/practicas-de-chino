// Persistencia del resultado del diagnóstico en el store 'progress' (clave fija
// 'diagnostico'). Otros módulos (progreso, home) pueden leerlo para adaptar la UI.

import { get, put } from '../../core/storage';
import type { Habilidad, PerfilHabilidad, ResumenDiagnostico } from './diagnostic.logic';

const STORE = 'progress';
export const CLAVE_DIAGNOSTICO = 'diagnostico';

/** Registro persistido del diagnóstico. La clave del store es `id`. */
export interface ResultadoDiagnostico {
  id: string;
  fecha: number;
  /** Nivel global (media de las habilidades evaluadas). */
  nivelHsk: number;
  totalItems: number;
  aciertos: number;
  porcentaje: number;
  latenciaMediaMs: number;
  reactivadas: number;
  /** Perfil por habilidad (nivel + aciertos/total). */
  perfil: Record<Habilidad, PerfilHabilidad>;
}

export function construirResultado(
  resumen: ResumenDiagnostico,
  reactivadas: number,
  ahora: Date,
): ResultadoDiagnostico {
  return {
    id: CLAVE_DIAGNOSTICO,
    fecha: ahora.getTime(),
    nivelHsk: resumen.nivelHsk,
    totalItems: resumen.totalItems,
    aciertos: resumen.aciertos,
    porcentaje: resumen.porcentaje,
    latenciaMediaMs: resumen.latenciaMediaMs,
    reactivadas,
    perfil: resumen.perfil,
  };
}

export async function guardarResultado(resultado: ResultadoDiagnostico): Promise<void> {
  await put(STORE, resultado);
}

export async function leerResultado(): Promise<ResultadoDiagnostico | undefined> {
  return get<ResultadoDiagnostico>(STORE, CLAVE_DIAGNOSTICO);
}
