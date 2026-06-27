// Detección de voz china (zh) para la síntesis de voz (Web Speech API).
// Reutiliza la misma heurística de selección que core/audio pero expone un
// resultado estructurado y una guía para iOS cuando no hay voz instalada.
//
// En iOS/Safari, getVoices() suele devolver [] en la primera llamada y se
// rellena de forma asíncrona; por eso esperarVoces() espera al evento
// `voiceschanged` (con timeout) antes de resolver.

/** Resultado de la detección de voz china. */
export interface ResultadoVozChina {
  /** ¿Hay al menos una voz `zh-*` instalada en el dispositivo? */
  disponible: boolean;
  /** Nombre de la voz china elegida, si la hay. */
  voz?: string;
}

/**
 * Texto de guía para que el usuario instale una voz china en iOS.
 * Se muestra cuando `detectarVozChina().disponible === false`.
 */
export const GUIA_VOZ_IOS =
  'No se ha encontrado una voz china en este dispositivo. En iPhone o iPad: ' +
  'Ajustes › Accesibilidad › Contenido hablado › Voces › Chino, y descarga una ' +
  'voz (por ejemplo, Ting-Ting). Después reinicia la app.';

function obtenerSintesis(): SpeechSynthesis | undefined {
  return typeof globalThis.speechSynthesis !== 'undefined' ? globalThis.speechSynthesis : undefined;
}

function esVozChina(voz: SpeechSynthesisVoice): boolean {
  return voz.lang.toLowerCase().startsWith('zh');
}

/** Elige la mejor voz china disponible (preferencia: Ting-Ting › zh-CN › zh-*). */
function elegirVozChina(voces: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voces.find((v) => /ting-?ting/i.test(v.name)) ??
    voces.find((v) => v.lang.toLowerCase() === 'zh-cn') ??
    voces.find((v) => esVozChina(v))
  );
}

/**
 * Detección síncrona: inspecciona las voces ya cargadas.
 * Si las voces aún no se han poblado, devolverá `{ disponible: false }`;
 * usa `esperarVoces()` antes para un resultado fiable en iOS.
 */
export function detectarVozChina(): ResultadoVozChina {
  const synth = obtenerSintesis();
  if (!synth) {
    return { disponible: false };
  }
  const voz = elegirVozChina(synth.getVoices());
  return voz ? { disponible: true, voz: voz.name } : { disponible: false };
}

/**
 * Espera a que la lista de voces esté poblada y devuelve la detección.
 * Resuelve antes si ya hay voces, al dispararse `voiceschanged`, o tras
 * `timeoutMs` (por defecto 1500 ms) para no bloquear indefinidamente.
 */
export function esperarVozChina(timeoutMs = 1500): Promise<ResultadoVozChina> {
  const synth = obtenerSintesis();
  if (!synth) {
    return Promise.resolve({ disponible: false });
  }

  // Si ya hay voces cargadas, no hace falta esperar.
  if (synth.getVoices().length > 0) {
    return Promise.resolve(detectarVozChina());
  }

  return new Promise<ResultadoVozChina>((resolve) => {
    let resuelto = false;
    const finalizar = (): void => {
      if (resuelto) {
        return;
      }
      resuelto = true;
      synth.removeEventListener('voiceschanged', finalizar);
      clearTimeout(temporizador);
      resolve(detectarVozChina());
    };
    const temporizador = setTimeout(finalizar, timeoutMs);
    synth.addEventListener('voiceschanged', finalizar);
  });
}
