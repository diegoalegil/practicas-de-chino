import { beforeEach, describe, expect, it } from 'vitest';
import { debeRecordarBackup, leerUltimoBackup, registroUltimoBackup } from './backup-reminder';

const MS_DIA = 24 * 60 * 60 * 1000;

describe('debeRecordarBackup', () => {
  it('recuerda si nunca se hizo backup', () => {
    expect(debeRecordarBackup(null, 1_000_000)).toBe(true);
  });

  it('no recuerda si el backup es reciente', () => {
    const ahora = 100 * MS_DIA;
    expect(debeRecordarBackup(ahora - 1 * MS_DIA, ahora)).toBe(false);
  });

  it('recuerda al cumplirse exactamente el umbral de días', () => {
    const ahora = 100 * MS_DIA;
    expect(debeRecordarBackup(ahora - 7 * MS_DIA, ahora)).toBe(true);
  });

  it('respeta un umbral de días personalizado', () => {
    const ahora = 100 * MS_DIA;
    expect(debeRecordarBackup(ahora - 2 * MS_DIA, ahora, 3)).toBe(false);
    expect(debeRecordarBackup(ahora - 3 * MS_DIA, ahora, 3)).toBe(true);
  });

  it('no recuerda si el último backup está en el futuro (reloj cambiado)', () => {
    const ahora = 100 * MS_DIA;
    expect(debeRecordarBackup(ahora + 5 * MS_DIA, ahora)).toBe(false);
  });
});

describe('persistencia en localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('null cuando no hay registro', () => {
    expect(leerUltimoBackup()).toBeNull();
  });

  it('round-trip de la marca de tiempo', () => {
    registroUltimoBackup(123456);
    expect(leerUltimoBackup()).toBe(123456);
  });

  it('null ante un valor corrupto', () => {
    localStorage.setItem('pdc:ultimoBackupMs', 'no-es-numero');
    expect(leerUltimoBackup()).toBeNull();
  });
});
