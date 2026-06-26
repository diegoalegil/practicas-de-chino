// Banco de caracteres de un solo hanzi para la práctica de escritura.
// Caracteres frecuentes y útiles, con pinyin y significado en español.

export interface CaracterLeccion {
  hanzi: string;
  pinyin: string;
  es: string;
}

export const CARACTERES: readonly CaracterLeccion[] = [
  { hanzi: '经', pinyin: 'jīng', es: 'pasar por; clásico' },
  { hanzi: '济', pinyin: 'jì', es: 'ayudar; cruzar (un río)' },
  { hanzi: '效', pinyin: 'xiào', es: 'efecto; imitar' },
  { hanzi: '率', pinyin: 'lǜ', es: 'tasa; proporción' },
  { hanzi: '平', pinyin: 'píng', es: 'plano; tranquilo' },
  { hanzi: '衡', pinyin: 'héng', es: 'equilibrio; pesar' },
  { hanzi: '责', pinyin: 'zé', es: 'responsabilidad; exigir' },
  { hanzi: '任', pinyin: 'rèn', es: 'deber; nombrar' },
  { hanzi: '矛', pinyin: 'máo', es: 'lanza' },
  { hanzi: '盾', pinyin: 'dùn', es: 'escudo' },
  { hanzi: '观', pinyin: 'guān', es: 'observar; punto de vista' },
  { hanzi: '念', pinyin: 'niàn', es: 'idea; recordar; leer' },
];
