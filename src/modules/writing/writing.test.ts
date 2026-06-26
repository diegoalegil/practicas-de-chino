import { describe, expect, it } from 'vitest';
import type { CaracterLeccion } from './lessons';
import {
  avanzar,
  caracterSeleccionado,
  deseleccionar,
  estaPracticado,
  indiceSiguiente,
  iniciarEscritura,
  marcarPracticado,
  seleccionar,
  totalPracticados,
} from './writing.logic';

const LECCION: readonly CaracterLeccion[] = [
  { hanzi: '经', pinyin: 'jīng', es: 'pasar por' },
  { hanzi: '济', pinyin: 'jì', es: 'ayudar' },
  { hanzi: '效', pinyin: 'xiào', es: 'efecto' },
];

describe('lógica de escritura', () => {
  it('empieza sin selección y sin practicados', () => {
    const e = iniciarEscritura(LECCION);
    expect(e.seleccion).toBeNull();
    expect(caracterSeleccionado(e)).toBeUndefined();
    expect(totalPracticados(e)).toBe(0);
  });

  it('seleccionar fija el caracter actual', () => {
    const e = seleccionar(iniciarEscritura(LECCION), 1);
    expect(e.seleccion).toBe(1);
    expect(caracterSeleccionado(e)?.hanzi).toBe('济');
  });

  it('ignora índices fuera de rango al seleccionar', () => {
    const base = iniciarEscritura(LECCION);
    expect(seleccionar(base, -1).seleccion).toBeNull();
    expect(seleccionar(base, 99).seleccion).toBeNull();
  });

  it('deseleccionar vuelve a null', () => {
    const e = deseleccionar(seleccionar(iniciarEscritura(LECCION), 2));
    expect(e.seleccion).toBeNull();
    expect(caracterSeleccionado(e)).toBeUndefined();
  });

  it('avanzar es circular', () => {
    let e = seleccionar(iniciarEscritura(LECCION), 2);
    e = avanzar(e);
    expect(e.seleccion).toBe(0);
  });

  it('avanzar sin selección elige el primero', () => {
    const e = avanzar(iniciarEscritura(LECCION));
    expect(e.seleccion).toBe(0);
  });

  it('indiceSiguiente devuelve null si no hay caracteres', () => {
    expect(indiceSiguiente(iniciarEscritura([]))).toBeNull();
  });

  it('avanzar sobre una lección vacía no cambia el estado', () => {
    const vacio = iniciarEscritura([]);
    expect(avanzar(vacio)).toBe(vacio);
  });

  it('marcarPracticado registra el caracter y es idempotente', () => {
    let e = iniciarEscritura(LECCION);
    e = marcarPracticado(e, 0);
    e = marcarPracticado(e, 0);
    e = marcarPracticado(e, 2);
    expect(estaPracticado(e, 0)).toBe(true);
    expect(estaPracticado(e, 1)).toBe(false);
    expect(estaPracticado(e, 2)).toBe(true);
    expect(totalPracticados(e)).toBe(2);
  });

  it('no cuenta índices inválidos en totalPracticados', () => {
    const e = marcarPracticado(iniciarEscritura(LECCION), 99);
    expect(totalPracticados(e)).toBe(0);
  });

  it('caracterSeleccionado refleja el caracter exacto tras avanzar', () => {
    let e = seleccionar(iniciarEscritura(LECCION), 0);
    e = avanzar(e);
    expect(caracterSeleccionado(e)?.hanzi).toBe('济');
  });

  it('no muta el estado de origen (inmutabilidad)', () => {
    const base = iniciarEscritura(LECCION);
    seleccionar(base, 1);
    marcarPracticado(base, 0);
    expect(base.seleccion).toBeNull();
    expect(base.practicados.size).toBe(0);
  });
});
