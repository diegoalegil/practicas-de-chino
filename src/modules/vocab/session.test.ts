import { describe, expect, it } from 'vitest';
import { iniciarSesion, responder, revelar, tarjetaActual, terminada } from './session';
import type { TarjetaUsuario } from './types';
import { nuevaTarjeta } from '../../core/srs/fsrs';

const AHORA = new Date('2026-01-01T00:00:00Z');

function tarjeta(id: string): TarjetaUsuario {
  return { id, lexemaId: id, tipo: 'recognition', origen: 'nuevo', fsrs: nuevaTarjeta(AHORA) };
}

describe('sesión de repaso', () => {
  it('empieza en la primera tarjeta, sin revelar', () => {
    const s = iniciarSesion([tarjeta('a'), tarjeta('b')]);
    expect(tarjetaActual(s)?.id).toBe('a');
    expect(s.revelada).toBe(false);
    expect(terminada(s)).toBe(false);
  });

  it('revelar marca la tarjeta como revelada', () => {
    const s = revelar(iniciarSesion([tarjeta('a')]));
    expect(s.revelada).toBe(true);
  });

  it('un "Bien" avanza y cuenta acierto', () => {
    let s = iniciarSesion([tarjeta('a'), tarjeta('b')]);
    s = responder(s, 3);
    expect(tarjetaActual(s)?.id).toBe('b');
    expect(s.aciertos).toBe(1);
    expect(s.completadas).toBe(1);
  });

  it('un "Otra vez" re-encola la tarjeta al final', () => {
    let s = iniciarSesion([tarjeta('a'), tarjeta('b')]);
    s = responder(s, 1); // falla 'a'
    expect(s.cola).toHaveLength(3);
    expect(s.cola[2]?.id).toBe('a');
    expect(s.aciertos).toBe(0);
  });

  it('termina cuando se responden todas', () => {
    let s = iniciarSesion([tarjeta('a')]);
    s = responder(s, 3);
    expect(terminada(s)).toBe(true);
  });
});
