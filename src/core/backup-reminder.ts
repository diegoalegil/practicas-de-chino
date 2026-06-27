// Recordatorio de backup: lógica pura + persistencia ligera en localStorage.
//
// La decisión de recordar es una función pura testeable; el almacenamiento del
// último backup usa localStorage (síncrono, sencillo) y tolera entornos sin él.

const CLAVE_ULTIMO_BACKUP = 'pdc:ultimoBackupMs';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Decide si hay que recordar al usuario que haga un backup.
 *
 * @param ultimoBackupMs marca de tiempo del último backup, o null si nunca.
 * @param ahoraMs marca de tiempo actual.
 * @param dias días que deben pasar para volver a recordar (por defecto 7).
 * @returns true si conviene mostrar el recordatorio.
 */
export function debeRecordarBackup(
  ultimoBackupMs: number | null,
  ahoraMs: number,
  dias = 7,
): boolean {
  if (ultimoBackupMs === null) {
    return true;
  }
  // Un último backup en el futuro (reloj cambiado) no debe disparar el aviso.
  if (ultimoBackupMs > ahoraMs) {
    return false;
  }
  return ahoraMs - ultimoBackupMs >= dias * MS_POR_DIA;
}

/** Lee la marca del último backup desde localStorage, o null si no hay/falla. */
export function leerUltimoBackup(): number | null {
  try {
    const raw = localStorage.getItem(CLAVE_ULTIMO_BACKUP);
    if (raw === null) {
      return null;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Registra que se acaba de hacer un backup (por defecto, ahora). */
export function registroUltimoBackup(ahoraMs: number = Date.now()): void {
  try {
    localStorage.setItem(CLAVE_ULTIMO_BACKUP, String(ahoraMs));
  } catch {
    // En modo privado o sin permisos, simplemente no persistimos.
  }
}
