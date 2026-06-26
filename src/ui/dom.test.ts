import { describe, expect, it } from 'vitest';
import { el } from './dom';

describe('el', () => {
  it('crea un elemento con clase y texto', () => {
    const node = el('div', { class: 'x', text: 'hola' });
    expect(node.tagName).toBe('DIV');
    expect(node.className).toBe('x');
    expect(node.textContent).toBe('hola');
  });

  it('añade atributos e hijos', () => {
    const node = el('a', { attrs: { href: '#/x' } }, el('span', { text: 'a' }));
    expect(node.getAttribute('href')).toBe('#/x');
    expect(node.querySelector('span')?.textContent).toBe('a');
  });

  it('registra listeners', () => {
    let clicks = 0;
    const btn = el('button', {
      on: {
        click: () => {
          clicks += 1;
        },
      },
    });
    btn.click();
    expect(clicks).toBe(1);
  });
});
