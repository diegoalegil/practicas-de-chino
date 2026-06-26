import type { Card } from '../../core/srs/fsrs';
import type { OrigenTarjeta, TipoTarjeta } from '../../types';

/** Tarjeta SRS del usuario (estado en IndexedDB). Clave `${lexemaId}:${tipo}`. */
export interface TarjetaUsuario {
  id: string;
  lexemaId: string;
  tipo: TipoTarjeta;
  origen: OrigenTarjeta;
  fsrs: Card;
}

/** Registro de un repaso (para estadísticas y futura re-optimización de FSRS). */
export interface LogReview {
  id: string;
  tarjetaId: string;
  fecha: number;
  grado: 1 | 2 | 3 | 4;
  latenciaMs: number;
}
