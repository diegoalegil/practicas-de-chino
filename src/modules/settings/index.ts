import type { View } from '../../types';
import { el } from '../../ui/dom';
import { hablar, vozDisponible } from '../../core/audio';
import { aplicaTema, temaGuardado, type Tema } from '../../core/theme';
import {
  aplicarEscalaFuente,
  aplicarReduceMotion,
  guardarEscalaFuente,
  guardarReduceMotion,
  guardarVelocidad,
  guardarVozPreferida,
  leerEscalaFuente,
  leerReduceMotion,
  leerVelocidad,
  leerVozPreferida,
  ESCALA_MAX,
  ESCALA_MIN,
  VELOCIDAD_MAX,
  VELOCIDAD_MIN,
} from './prefs';
import {
  exportarDatos,
  nombreArchivoCopia,
  parsearCopia,
  importarDatos,
  resetearDatos,
} from './backup';
import { registroUltimoBackup } from '../../core/backup-reminder';
import './settings.css';

const FRASE_PRUEBA = '你好，这是中文语音测试。';

/** Voces de síntesis filtradas a chino (zh*). */
function vocesChinas(): SpeechSynthesisVoice[] {
  if (!vozDisponible()) {
    return [];
  }
  return speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('zh'));
}

function encabezado(titulo: string): HTMLElement {
  return el(
    'div',
    { class: 'pcset-sec-h' },
    el('p', { class: 'pcset-sec-t', text: titulo }),
    el('span', { class: 'pcset-brush', attrs: { 'aria-hidden': 'true' } }),
  );
}

export function createSettingsView(): View {
  let root: HTMLElement;
  const raiz = document.documentElement;

  // Estado local (espejo de las preferencias persistidas).
  let tema: Tema = temaGuardado();
  let escala = leerEscalaFuente();
  let velocidad = leerVelocidad();
  let reduceMotion = leerReduceMotion();
  let vozPreferida = leerVozPreferida();

  // Mensajes de la sección de copia de seguridad.
  let mensajeCopia: { texto: string; tipo: 'ok' | 'error' } | null = null;
  // Doble confirmación del reset.
  let resetArmado = false;

  function segmentoTema(): HTMLElement {
    const opciones: ReadonlyArray<{ clave: Tema; etiqueta: string }> = [
      { clave: 'auto', etiqueta: 'Auto' },
      { clave: 'claro', etiqueta: 'Claro' },
      { clave: 'oscuro', etiqueta: 'Oscuro' },
    ];
    return el(
      'div',
      { class: 'pcset-seg', attrs: { role: 'group', 'aria-label': 'Tema' } },
      ...opciones.map((op) =>
        el('button', {
          class: tema === op.clave ? 'is-on' : '',
          text: op.etiqueta,
          attrs: {
            type: 'button',
            'aria-pressed': tema === op.clave ? 'true' : 'false',
          },
          on: {
            click: () => {
              tema = op.clave;
              aplicaTema(tema);
              render();
            },
          },
        }),
      ),
    );
  }

  function filaTema(): HTMLElement {
    return el(
      'div',
      { class: 'pcset-row pcset-row--col' },
      el(
        'div',
        { class: 'pcset-row__text' },
        el('div', { class: 'pcset-lbl', text: 'Tema' }),
        el('div', { class: 'pcset-sub', text: 'Auto sigue la apariencia del sistema.' }),
      ),
      segmentoTema(),
    );
  }

  function filaEscala(): HTMLElement {
    const valor = el('span', {
      class: 'pcset-slider-val',
      text: `${String(Math.round(escala * 100))}%`,
    });
    const slider = el('input', {
      class: 'pcset-slider',
      attrs: {
        type: 'range',
        min: String(ESCALA_MIN),
        max: String(ESCALA_MAX),
        step: '0.05',
        value: String(escala),
        'aria-label': 'Tamaño de fuente',
      },
      on: {
        input: (event) => {
          const objetivo = event.target;
          if (!(objetivo instanceof HTMLInputElement)) {
            return;
          }
          escala = Number.parseFloat(objetivo.value);
          aplicarEscalaFuente(escala, raiz);
          valor.textContent = `${String(Math.round(escala * 100))}%`;
        },
        change: () => {
          escala = guardarEscalaFuente(escala);
        },
      },
    });
    return el(
      'div',
      { class: 'pcset-row pcset-row--col' },
      el(
        'div',
        { class: 'pcset-row__text' },
        el('div', { class: 'pcset-lbl', text: 'Tamaño de fuente' }),
        el('div', { class: 'pcset-sub', text: 'Escala todo el texto de la app.' }),
      ),
      el(
        'div',
        { class: 'pcset-slider-row' },
        el('span', { class: 'pcset-sub', text: 'A', attrs: { 'aria-hidden': 'true' } }),
        slider,
        el('span', { class: 'pcset-sub fs19', text: 'A', attrs: { 'aria-hidden': 'true' } }),
        valor,
      ),
    );
  }

  function filaVoz(): HTMLElement {
    const voces = vocesChinas();
    const select = el('select', {
      class: 'pcset-select',
      attrs: { 'aria-label': 'Voz de síntesis en chino' },
      on: {
        change: (event) => {
          const objetivo = event.target;
          if (!(objetivo instanceof HTMLSelectElement)) {
            return;
          }
          vozPreferida = objetivo.value;
          guardarVozPreferida(vozPreferida);
        },
      },
    });
    if (voces.length === 0) {
      select.append(el('option', { text: 'No se detectan voces en chino', attrs: { value: '' } }));
      select.disabled = true;
    } else {
      for (const voz of voces) {
        const opcion = el('option', {
          text: `${voz.name} (${voz.lang})`,
          attrs: { value: voz.name },
        });
        if (voz.name === vozPreferida) {
          opcion.selected = true;
        }
        select.append(opcion);
      }
    }
    return el(
      'div',
      { class: 'pcset-row pcset-row--col' },
      el(
        'div',
        { class: 'pcset-row__text' },
        el('div', { class: 'pcset-lbl', text: 'Voz' }),
        el('div', { class: 'pcset-sub', text: 'Voz usada para leer el chino en voz alta.' }),
      ),
      select,
    );
  }

  function filaVelocidad(): HTMLElement {
    const valor = el('span', {
      class: 'pcset-slider-val',
      text: `${velocidad.toFixed(1)}×`,
    });
    const slider = el('input', {
      class: 'pcset-slider',
      attrs: {
        type: 'range',
        min: String(VELOCIDAD_MIN),
        max: String(VELOCIDAD_MAX),
        step: '0.1',
        value: String(velocidad),
        'aria-label': 'Velocidad de la voz',
      },
      on: {
        input: (event) => {
          const objetivo = event.target;
          if (!(objetivo instanceof HTMLInputElement)) {
            return;
          }
          velocidad = Number.parseFloat(objetivo.value);
          valor.textContent = `${velocidad.toFixed(1)}×`;
        },
        change: () => {
          velocidad = guardarVelocidad(velocidad);
        },
      },
    });
    const probar = el('button', {
      class: 'pcset-btn pcset-btn--ghost pcset-btn--sm',
      text: 'Probar',
      attrs: { type: 'button' },
      on: {
        click: () => {
          hablar(FRASE_PRUEBA, { rate: velocidad });
        },
      },
    });
    return el(
      'div',
      { class: 'pcset-row pcset-row--col' },
      el(
        'div',
        { class: 'pcset-row__text' },
        el('div', { class: 'pcset-lbl', text: 'Velocidad de la voz' }),
        el('div', { class: 'pcset-sub', text: 'Más lento ayuda a distinguir los tonos.' }),
      ),
      el('div', { class: 'pcset-slider-row' }, slider, valor),
      el('div', { class: 'pcset-btn-row' }, probar),
    );
  }

  function toggle(
    etiqueta: string,
    sub: string,
    activo: boolean,
    onToggle: (siguiente: boolean) => void,
  ): HTMLElement {
    const boton = el(
      'button',
      {
        class: activo ? 'pcset-toggle is-on' : 'pcset-toggle',
        attrs: {
          type: 'button',
          role: 'switch',
          'aria-checked': activo ? 'true' : 'false',
          'aria-label': etiqueta,
        },
        on: {
          click: () => {
            onToggle(!activo);
          },
        },
      },
      el('i', { attrs: { 'aria-hidden': 'true' } }),
    );
    return el(
      'div',
      { class: 'pcset-row' },
      el(
        'div',
        { class: 'pcset-row__text' },
        el('div', { class: 'pcset-lbl', text: etiqueta }),
        el('div', { class: 'pcset-sub', text: sub }),
      ),
      boton,
    );
  }

  function filaReduceMotion(): HTMLElement {
    return toggle(
      'Reducir movimiento',
      'Desactiva animaciones y transiciones.',
      reduceMotion,
      (siguiente) => {
        reduceMotion = siguiente;
        guardarReduceMotion(reduceMotion);
        aplicarReduceMotion(reduceMotion, raiz);
        render();
      },
    );
  }

  function disparaDescarga(copiaJson: string): void {
    const blob = new Blob([copiaJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const enlace = el('a', {
      attrs: { href: url, download: nombreArchivoCopia() },
    });
    enlace.click();
    URL.revokeObjectURL(url);
  }

  function bloqueCopia(): HTMLElement {
    const inputArchivo = el('input', {
      class: 'pcset-hidden-file',
      attrs: { type: 'file', accept: 'application/json,.json' },
      on: {
        change: (event) => {
          const objetivo = event.target;
          if (!(objetivo instanceof HTMLInputElement)) {
            return;
          }
          const archivo = objetivo.files?.[0];
          if (!archivo) {
            return;
          }
          void archivo
            .text()
            .then(async (texto) => {
              const copia = parsearCopia(texto);
              await importarDatos(copia);
              mensajeCopia = { texto: 'Datos importados correctamente.', tipo: 'ok' };
              render();
            })
            .catch((error: unknown) => {
              mensajeCopia = {
                texto: error instanceof Error ? error.message : 'No se pudo importar el archivo.',
                tipo: 'error',
              };
              render();
            })
            .finally(() => {
              objetivo.value = '';
            });
        },
      },
    });

    const exportar = el('button', {
      class: 'pcset-btn pcset-btn--ghost',
      text: 'Exportar',
      attrs: { type: 'button' },
      on: {
        click: () => {
          void exportarDatos()
            .then((copia) => {
              disparaDescarga(JSON.stringify(copia, null, 2));
              registroUltimoBackup();
              mensajeCopia = { texto: 'Copia exportada.', tipo: 'ok' };
              render();
            })
            .catch(() => {
              mensajeCopia = { texto: 'No se pudo exportar la copia.', tipo: 'error' };
              render();
            });
        },
      },
    });

    const importar = el('button', {
      class: 'pcset-btn pcset-btn--ghost',
      text: 'Importar',
      attrs: { type: 'button' },
      on: {
        click: () => {
          inputArchivo.click();
        },
      },
    });

    const hijos: HTMLElement[] = [
      el(
        'div',
        { class: 'pcset-row pcset-row--col' },
        el(
          'div',
          { class: 'pcset-row__text' },
          el('div', { class: 'pcset-lbl', text: 'Copia de seguridad' }),
          el('div', {
            class: 'pcset-sub',
            text: 'Exporta tus tarjetas y progreso a un archivo, o restaura desde uno.',
          }),
        ),
        el('div', { class: 'pcset-btn-row' }, exportar, importar),
        inputArchivo,
      ),
    ];

    if (mensajeCopia) {
      hijos.push(
        el('p', {
          class: `pcset-note ${mensajeCopia.tipo === 'error' ? 'is-error' : 'is-ok'}`,
          text: mensajeCopia.texto,
          attrs: { role: 'status' },
        }),
      );
    }

    return el('div', {}, ...hijos);
  }

  function bloqueReset(): HTMLElement {
    const boton = el('button', {
      class: 'pcset-btn pcset-btn--danger pcset-btn--block',
      text: resetArmado ? 'Pulsa de nuevo para confirmar el borrado' : 'Borrar todos los datos',
      attrs: { type: 'button' },
      on: {
        click: () => {
          if (!resetArmado) {
            resetArmado = true;
            render();
            return;
          }
          void resetearDatos()
            .then(() => {
              resetArmado = false;
              mensajeCopia = { texto: 'Todos los datos han sido borrados.', tipo: 'ok' };
              render();
            })
            .catch(() => {
              resetArmado = false;
              mensajeCopia = { texto: 'No se pudieron borrar los datos.', tipo: 'error' };
              render();
            });
        },
      },
    });
    const hijos: HTMLElement[] = [
      el(
        'div',
        { class: 'pcset-row pcset-row--col' },
        el(
          'div',
          { class: 'pcset-row__text' },
          el('div', { class: 'pcset-lbl', text: 'Restablecer' }),
          el('div', {
            class: 'pcset-sub',
            text: 'Borra tarjetas, repasos y progreso. No se puede deshacer.',
          }),
        ),
        boton,
      ),
    ];
    if (resetArmado) {
      hijos.push(
        el('button', {
          class: 'pcset-btn pcset-btn--ghost pcset-btn--sm',
          text: 'Cancelar',
          attrs: { type: 'button' },
          on: {
            click: () => {
              resetArmado = false;
              render();
            },
          },
        }),
      );
    }
    return el('div', {}, ...hijos);
  }

  function render(): void {
    root.replaceChildren(
      el(
        'section',
        { class: 'pcset' },
        encabezado('Apariencia'),
        el('div', { class: 'pcset-card' }, filaTema(), filaEscala(), filaReduceMotion()),
        encabezado('Audio'),
        el('div', { class: 'pcset-card' }, filaVoz(), filaVelocidad()),
        encabezado('Datos'),
        el('div', { class: 'pcset-card' }, bloqueCopia()),
        encabezado('Zona de riesgo'),
        el('div', { class: 'pcset-card' }, bloqueReset()),
      ),
    );
  }

  function alCambiarVoces(): void {
    render();
  }

  return {
    mount(target) {
      root = target;
      // Las voces pueden cargarse de forma asíncrona: re-renderizar al llegar.
      if (vozDisponible() && typeof speechSynthesis.addEventListener === 'function') {
        speechSynthesis.addEventListener('voiceschanged', alCambiarVoces);
      }
      render();
    },
    unmount() {
      if (vozDisponible() && typeof speechSynthesis.removeEventListener === 'function') {
        speechSynthesis.removeEventListener('voiceschanged', alCambiarVoces);
      }
    },
  };
}
