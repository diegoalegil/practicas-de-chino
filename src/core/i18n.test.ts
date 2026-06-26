import { describe, expect, it } from 'vitest';
import { t } from './i18n';

describe('i18n t()', () => {
  it('devuelve el texto en español', () => {
    expect(t('app.title')).toBe('Prácticas de Chino');
  });

  it('interpola parámetros', () => {
    expect(t('common.en_construccion', { modulo: 'Lectura' })).toBe('Lectura · en construcción');
  });

  it('deja el marcador si falta el parámetro', () => {
    expect(t('common.en_construccion')).toContain('{modulo}');
  });
});
