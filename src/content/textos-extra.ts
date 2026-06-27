// Textos de lectura adicionales (nivel intermedio-alto / avanzado).
// Misma forma que src/modules/reading/data.ts: TextoLectura de reader.logic.

import type { TextoLectura } from '../modules/reading/reader.logic';

export const TEXTOS_EXTRA: readonly TextoLectura[] = [
  {
    id: 'lvxing-de-yiyi',
    titulo: '旅行的意义',
    nivel: 'intermedio-alto',
    cuerpo:
      '很多人喜欢旅行，但每个人旅行的目的都不一样。有的人为了放松，想暂时离开忙碌的工作；' +
      '有的人为了开阔眼界，去体验不同的文化和风俗。其实，旅行最大的意义并不在于走了多少地方，' +
      '而在于它让我们换一个角度看世界。当你到了一个陌生的城市，连点菜、问路都需要勇气，' +
      '这种小小的挑战往往会让人成长。回到家以后，你也许会发现，自己看待生活的方式悄悄地改变了。',
    glosaEs:
      'A mucha gente le gusta viajar, pero cada persona tiene un objetivo distinto al hacerlo. ' +
      'Algunos viajan para relajarse, para alejarse un tiempo del ajetreado trabajo; otros, para ' +
      'ampliar horizontes y experimentar culturas y costumbres diferentes. En realidad, el mayor ' +
      'sentido de viajar no está en cuántos lugares se visitan, sino en que nos permite mirar el ' +
      'mundo desde otro ángulo. Cuando llegas a una ciudad desconocida, incluso pedir comida o ' +
      'preguntar el camino requiere valor, y ese pequeño reto a menudo nos hace crecer. Al volver ' +
      'a casa, quizá descubras que tu manera de ver la vida ha cambiado sin darte cuenta.',
    glosas: [
      { hanzi: '目的', pinyin: 'mùdì', es: 'objetivo, propósito' },
      { hanzi: '放松', pinyin: 'fàngsōng', es: 'relajarse' },
      { hanzi: '忙碌', pinyin: 'mánglù', es: 'ajetreado, ocupado' },
      { hanzi: '开阔眼界', pinyin: 'kāikuò yǎnjiè', es: 'ampliar horizontes' },
      { hanzi: '风俗', pinyin: 'fēngsú', es: 'costumbres' },
      { hanzi: '角度', pinyin: 'jiǎodù', es: 'ángulo, perspectiva' },
      { hanzi: '陌生', pinyin: 'mòshēng', es: 'desconocido, extraño' },
      { hanzi: '勇气', pinyin: 'yǒngqì', es: 'valor, coraje' },
      { hanzi: '挑战', pinyin: 'tiǎozhàn', es: 'reto, desafío' },
      { hanzi: '成长', pinyin: 'chéngzhǎng', es: 'crecer, madurar' },
      { hanzi: '悄悄', pinyin: 'qiāoqiāo', es: 'silenciosamente, sin darse cuenta' },
    ],
    preguntas: [
      {
        enunciado: 'Según el texto, ¿por qué viaja alguna gente?',
        opciones: [
          'Solo para gastar dinero',
          'Para relajarse o para ampliar horizontes',
          'Porque están obligados por el trabajo',
          'Para evitar a su familia',
        ],
        correcta: 1,
        explicacion:
          'El texto dice «有的人为了放松… 有的人为了开阔眼界»: unos viajan para relajarse (放松) y otros para ampliar horizontes (开阔眼界).',
      },
      {
        enunciado: '¿En qué consiste, según el autor, el mayor sentido de viajar?',
        opciones: [
          'En visitar el mayor número de lugares posible',
          'En gastar lo menos posible',
          'En poder mirar el mundo desde otro ángulo',
          'En comprar recuerdos',
        ],
        correcta: 2,
        explicacion:
          'El texto afirma «并不在于走了多少地方，而在于它让我们换一个角度看世界»: no importa cuántos lugares, sino mirar el mundo desde otro ángulo (角度).',
      },
      {
        enunciado: '¿Qué efecto tienen los pequeños retos de un lugar desconocido?',
        opciones: [
          'Hacen que la gente quiera volver a casa enseguida',
          'No tienen ningún efecto',
          'A menudo hacen que la persona crezca',
          'Solo causan estrés inútil',
        ],
        correcta: 2,
        explicacion:
          'El texto dice «这种小小的挑战往往会让人成长»: ese pequeño reto (挑战) suele hacer crecer (成长) a la persona.',
      },
    ],
  },
  {
    id: 'shuzi-shidai-de-yuedu',
    titulo: '数字时代的阅读',
    nivel: 'avanzado',
    cuerpo:
      '随着智能手机的普及，人们的阅读方式发生了巨大的变化。过去，读书往往意味着安静地坐下来，' +
      '一页一页地翻。如今，许多人习惯在地铁上、排队时用手机阅读碎片化的信息。这种方式虽然方便，' +
      '却也带来了新的问题：注意力越来越难集中，很多人读完一篇文章后，几乎记不住其中的内容。' +
      '专家指出，深度阅读需要持续的专注，而频繁地切换屏幕会削弱这种能力。因此，' +
      '与其抱怨自己记性变差，不如试着每天留出一段不被打扰的时间，重新培养专心阅读的习惯。',
    glosaEs:
      'Con la difusión de los teléfonos inteligentes, la forma de leer de la gente ha cambiado ' +
      'enormemente. Antes, leer solía significar sentarse en silencio y pasar las páginas una a ' +
      'una. Hoy, mucha gente está acostumbrada a leer información fragmentada en el metro o ' +
      'haciendo cola, con el móvil. Aunque ese método es cómodo, también trae nuevos problemas: ' +
      'cada vez cuesta más concentrarse, y muchos, tras leer un artículo, apenas recuerdan su ' +
      'contenido. Los expertos señalan que la lectura profunda requiere una atención sostenida, y ' +
      'que cambiar de pantalla con frecuencia debilita esa capacidad. Por eso, en lugar de quejarse ' +
      'de tener peor memoria, conviene intentar reservar cada día un rato sin interrupciones y ' +
      'recuperar el hábito de leer con concentración.',
    glosas: [
      { hanzi: '普及', pinyin: 'pǔjí', es: 'difundirse, generalizarse' },
      { hanzi: '巨大', pinyin: 'jùdà', es: 'enorme' },
      { hanzi: '碎片化', pinyin: 'suìpiànhuà', es: 'fragmentado' },
      { hanzi: '方便', pinyin: 'fāngbiàn', es: 'cómodo, conveniente' },
      { hanzi: '注意力', pinyin: 'zhùyìlì', es: 'atención' },
      { hanzi: '集中', pinyin: 'jízhōng', es: 'concentrar(se)' },
      { hanzi: '深度阅读', pinyin: 'shēndù yuèdú', es: 'lectura profunda' },
      { hanzi: '专注', pinyin: 'zhuānzhù', es: 'concentración, atención' },
      { hanzi: '切换', pinyin: 'qiēhuàn', es: 'cambiar, alternar' },
      { hanzi: '削弱', pinyin: 'xuēruò', es: 'debilitar' },
      { hanzi: '抱怨', pinyin: 'bàoyuàn', es: 'quejarse' },
      { hanzi: '打扰', pinyin: 'dǎrǎo', es: 'molestar, interrumpir' },
    ],
    preguntas: [
      {
        enunciado: '¿Qué provocó el gran cambio en la forma de leer, según el texto?',
        opciones: [
          'El cierre de las bibliotecas',
          'La difusión de los teléfonos inteligentes',
          'El aumento del precio de los libros',
          'La falta de tiempo libre',
        ],
        correcta: 1,
        explicacion:
          'El texto empieza con «随着智能手机的普及»: a raíz de la difusión (普及) de los smartphones la forma de leer cambió mucho.',
      },
      {
        enunciado: '¿Qué nuevo problema señala el texto sobre la lectura en el móvil?',
        opciones: [
          'Que es demasiado cara',
          'Que daña la vista de inmediato',
          'Que cuesta concentrarse y apenas se recuerda lo leído',
          'Que no hay nada interesante que leer',
        ],
        correcta: 2,
        explicacion:
          'El texto dice «注意力越来越难集中… 几乎记不住其中的内容»: cuesta concentrar la atención (集中) y casi no se recuerda el contenido.',
      },
      {
        enunciado: 'Según los expertos, ¿qué debilita la capacidad de lectura profunda?',
        opciones: [
          'Leer libros en papel',
          'Cambiar de pantalla con frecuencia',
          'Leer en silencio',
          'Reservar tiempo sin interrupciones',
        ],
        correcta: 1,
        explicacion:
          'El texto afirma «频繁地切换屏幕会削弱这种能力»: cambiar de pantalla (切换) con frecuencia debilita (削弱) esa capacidad.',
      },
      {
        enunciado: '¿Qué propone el texto en lugar de quejarse de tener peor memoria?',
        opciones: [
          'Dejar de leer por completo',
          'Comprar un teléfono mejor',
          'Reservar cada día un rato sin interrupciones para leer concentrado',
          'Leer solo titulares',
        ],
        correcta: 2,
        explicacion:
          'El cierre dice «不如试着每天留出一段不被打扰的时间，重新培养专心阅读的习惯»: mejor reservar a diario un rato sin interrupciones (打扰) y recuperar el hábito de leer concentrado.',
      },
    ],
  },
];
