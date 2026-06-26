// Síntesis de voz zh-CN con Web Speech API (gratis y offline en iOS).
// El Grupo F amplía: selección de voz Ting-Ting, desbloqueo por gesto y fallbacks.

export interface OpcionesHabla {
  rate?: number;
  lang?: string;
}

export function vozDisponible(): boolean {
  return typeof globalThis.speechSynthesis !== 'undefined';
}

/** ¿Hay alguna voz china (zh) instalada en el dispositivo? */
export function hayVozChina(): boolean {
  if (!vozDisponible()) {
    return false;
  }
  return speechSynthesis.getVoices().some((voz) => voz.lang.toLowerCase().startsWith('zh'));
}

function elegirVozChina(): SpeechSynthesisVoice | undefined {
  const voces = speechSynthesis.getVoices();
  return (
    voces.find((v) => /ting-?ting/i.test(v.name)) ??
    voces.find((v) => v.lang.toLowerCase() === 'zh-cn') ??
    voces.find((v) => v.lang.toLowerCase().startsWith('zh'))
  );
}

/** Reproduce un texto en chino. No falla si no hay soporte de voz. */
export function hablar(texto: string, opciones: OpcionesHabla = {}): void {
  if (!vozDisponible()) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = opciones.lang ?? 'zh-CN';
  utterance.rate = opciones.rate ?? 0.9;
  const voz = elegirVozChina();
  if (voz) {
    utterance.voice = voz;
  }
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
