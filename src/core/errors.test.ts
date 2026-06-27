import { beforeEach, describe, expect, it } from 'vitest';
import { exportarLog, limpiarLog, obtenerLog, registrarLog } from './errors';

beforeEach(() => {
  limpiarLog();
});

describe('errors: buffer de log', () => {
  it('arranca vacío', () => {
    expect(obtenerLog()).toEqual([]);
  });

  it('registra entradas con nivel y mensaje', () => {
    registrarLog('error', 'boom', 'stack aquí');
    const log = obtenerLog();
    expect(log).toHaveLength(1);
    expect(log[0]?.nivel).toBe('error');
    expect(log[0]?.mensaje).toBe('boom');
    expect(log[0]?.stack).toBe('stack aquí');
    expect(typeof log[0]?.t).toBe('number');
  });

  it('omite stack cuando no se provee (exactOptionalPropertyTypes)', () => {
    registrarLog('info', 'sin stack');
    expect('stack' in (obtenerLog()[0] ?? {})).toBe(false);
  });

  it('mantiene como máximo 50 entradas (anillo)', () => {
    for (let i = 0; i < 60; i++) {
      registrarLog('info', `m${String(i)}`);
    }
    const log = obtenerLog();
    expect(log).toHaveLength(50);
    // Conserva las más recientes.
    expect(log[0]?.mensaje).toBe('m10');
    expect(log[49]?.mensaje).toBe('m59');
  });

  it('obtenerLog devuelve una copia (no muta el buffer interno)', () => {
    registrarLog('info', 'x');
    const copia = obtenerLog() as unknown[];
    copia.push({ t: 0, nivel: 'info', mensaje: 'inyectado' });
    expect(obtenerLog()).toHaveLength(1);
  });

  it('limpiarLog vacía el buffer', () => {
    registrarLog('error', 'a');
    limpiarLog();
    expect(obtenerLog()).toEqual([]);
  });
});

describe('errors: exportarLog', () => {
  it('texto amable cuando no hay eventos', () => {
    expect(exportarLog()).toBe('Sin eventos registrados.');
  });

  it('incluye nivel, mensaje y stack', () => {
    registrarLog('error', 'fallo', 'at foo()');
    const txt = exportarLog();
    expect(txt).toContain('ERROR: fallo');
    expect(txt).toContain('at foo()');
  });
});
