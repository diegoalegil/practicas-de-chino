// Textos semilla para el módulo de lectura. Datos puros y tipados.

import type { TextoLectura } from './reader.logic';

export const TEXTOS: readonly TextoLectura[] = [
  {
    id: 'saiweng-shima',
    titulo: '塞翁失马',
    nivel: 'intermedio-alto',
    cuerpo:
      '从前，边境上住着一位老人。一天，他的马跑到了塞外，邻居们都来安慰他。' +
      '老人却说：“这未必不是一件好事。” 几个月后，那匹马竟然带回来一匹好马。' +
      '邻居们又来道贺，老人说：“这也许会带来麻烦。” 后来，他的儿子骑那匹马时摔断了腿。' +
      '大家都为他难过，老人依然平静地说：“谁知道这是福还是祸呢？” ' +
      '不久，战争爆发，年轻人都被征去打仗，很多人死了，而他的儿子因为腿伤留在家里，保住了性命。',
    glosaEs:
      'Hace tiempo, en la frontera vivía un anciano. Un día, su caballo se escapó más allá ' +
      'de la frontera, y todos los vecinos vinieron a consolarlo. Pero el anciano dijo: ' +
      '«Esto no es necesariamente algo malo». Unos meses después, aquel caballo regresó ' +
      'inesperadamente acompañado de un buen caballo. Los vecinos volvieron a felicitarlo, ' +
      'y el anciano dijo: «Quizá esto traiga problemas». Más tarde, su hijo se rompió la pierna ' +
      'al caerse montando aquel caballo. Todos se entristecieron por él, pero el anciano, ' +
      'tan tranquilo como siempre, dijo: «¿Quién sabe si esto es fortuna o desgracia?». ' +
      'Poco después estalló la guerra, y todos los jóvenes fueron reclutados para combatir; ' +
      'muchos murieron, pero su hijo, por la lesión de la pierna, se quedó en casa y salvó la vida.',
    glosas: [
      { hanzi: '边境', pinyin: 'biānjìng', es: 'frontera' },
      { hanzi: '安慰', pinyin: 'ānwèi', es: 'consolar' },
      { hanzi: '未必', pinyin: 'wèibì', es: 'no necesariamente' },
      { hanzi: '道贺', pinyin: 'dàohè', es: 'felicitar' },
      { hanzi: '摔断', pinyin: 'shuāiduàn', es: 'romperse al caer' },
      { hanzi: '征', pinyin: 'zhēng', es: 'reclutar' },
      { hanzi: '爆发', pinyin: 'bàofā', es: 'estallar' },
      { hanzi: '福', pinyin: 'fú', es: 'fortuna' },
      { hanzi: '祸', pinyin: 'huò', es: 'desgracia' },
    ],
    preguntas: [
      {
        enunciado: '¿Por qué vinieron los vecinos a ver al anciano la primera vez?',
        opciones: [
          'Para felicitarlo por un buen caballo',
          'Para consolarlo porque su caballo se había escapado',
          'Para avisarle de la guerra',
          'Para curar a su hijo',
        ],
        correcta: 1,
        explicacion:
          'El texto dice «他的马跑到了塞外，邻居们都来安慰他»: el caballo se escapó y los vecinos vinieron a consolarlo (安慰).',
      },
      {
        enunciado: '¿Cómo reacciona el anciano ante cada giro de los acontecimientos?',
        opciones: [
          'Con entusiasmo exagerado',
          'Con miedo constante',
          'Con calma, sin dar nada por bueno ni malo',
          'Con enfado hacia sus vecinos',
        ],
        correcta: 2,
        explicacion:
          'El anciano «依然平静地说：“谁知道这是福还是祸呢？”»: mantiene la calma y no juzga si algo es fortuna (福) o desgracia (祸).',
      },
      {
        enunciado: '¿Por qué se salvó finalmente el hijo del anciano?',
        opciones: [
          'Porque huyó de la frontera',
          'Porque su lesión en la pierna le impidió ir a la guerra',
          'Porque era el mejor soldado',
          'Porque el anciano lo escondió',
        ],
        correcta: 1,
        explicacion:
          'El final dice «他的儿子因为腿伤留在家里，保住了性命»: gracias a la lesión de la pierna (摔断了腿) se quedó en casa y conservó la vida.',
      },
    ],
  },
  {
    id: 'neijuan',
    titulo: '关于内卷',
    nivel: 'avanzado',
    cuerpo:
      '近年来，“内卷”成了中国年轻人常挂在嘴边的一个词。它原本是一个学术概念，' +
      '如今却被用来形容一种激烈而又无意义的竞争：大家都付出更多的努力，结果却没有人真正受益。' +
      '比如，公司里人人都加班到深夜，并不是因为工作需要，而是因为不想显得比别人差。' +
      '久而久之，加班成了常态，效率反而下降。' +
      '许多人开始反思：与其在内卷中精疲力尽，不如重新思考自己真正想要的生活。',
    glosaEs:
      'En los últimos años, «involución» (内卷) se ha convertido en una palabra que los jóvenes ' +
      'chinos tienen siempre en la boca. Originalmente era un concepto académico, pero hoy se usa ' +
      'para describir una competencia feroz y a la vez carente de sentido: todos se esfuerzan más, ' +
      'pero al final nadie sale realmente beneficiado. Por ejemplo, en las empresas todo el mundo ' +
      'hace horas extra hasta altas horas de la noche, no porque el trabajo lo exija, sino porque ' +
      'no quieren parecer peores que los demás. Con el tiempo, las horas extra se vuelven la norma ' +
      'y, por el contrario, la eficiencia cae. Muchos empiezan a reflexionar: en lugar de agotarse ' +
      'en la involución, es mejor replantearse qué vida quieren de verdad.',
    glosas: [
      { hanzi: '内卷', pinyin: 'nèijuǎn', es: 'involución / competencia estéril' },
      { hanzi: '挂在嘴边', pinyin: 'guà zài zuǐ biān', es: 'tener siempre en la boca' },
      { hanzi: '激烈', pinyin: 'jīliè', es: 'feroz' },
      { hanzi: '受益', pinyin: 'shòuyì', es: 'beneficiarse' },
      { hanzi: '加班', pinyin: 'jiābān', es: 'horas extra' },
      { hanzi: '常态', pinyin: 'chángtài', es: 'norma' },
      { hanzi: '反思', pinyin: 'fǎnsī', es: 'reflexionar' },
      { hanzi: '精疲力尽', pinyin: 'jīng pí lì jìn', es: 'agotado' },
      { hanzi: '与其', pinyin: 'yǔqí', es: 'más que… (mejor…)' },
    ],
    preguntas: [
      {
        enunciado: 'Según el texto, ¿qué era originalmente la palabra «内卷»?',
        opciones: [
          'Un insulto entre jóvenes',
          'Un concepto académico',
          'El nombre de una empresa',
          'Un eslogan publicitario',
        ],
        correcta: 1,
        explicacion:
          'El texto afirma «它原本是一个学术概念»: en su origen 内卷 era un concepto académico, aunque ahora se usa de otra forma.',
      },
      {
        enunciado: '¿Por qué la gente hace horas extra hasta tan tarde, según el texto?',
        opciones: [
          'Porque el trabajo realmente lo necesita',
          'Porque quieren ganar más dinero',
          'Porque no quieren parecer peores que los demás',
          'Porque les gusta su empleo',
        ],
        correcta: 2,
        explicacion:
          'El texto dice «并不是因为工作需要，而是因为不想显得比别人差»: no es por necesidad del trabajo, sino por no parecer peores que los demás.',
      },
      {
        enunciado: '¿Qué conclusión empiezan a sacar muchas personas al final del texto?',
        opciones: [
          'Que deben competir aún más',
          'Que es mejor replantearse qué vida quieren de verdad',
          'Que la eficiencia siempre aumenta con las horas extra',
          'Que el concepto no tiene importancia',
        ],
        correcta: 1,
        explicacion:
          'El cierre dice «与其在内卷中精疲力尽，不如重新思考自己真正想要的生活»: en lugar de agotarse (精疲力尽), conviene repensar la vida que uno quiere.',
      },
    ],
  },
];

export function textoPorId(id: string): TextoLectura | undefined {
  return TEXTOS.find((texto) => texto.id === id);
}
