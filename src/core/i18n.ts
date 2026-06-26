// Sistema i18n en español con interpolación simple {param}. Los módulos amplían el diccionario.

const messages = {
  'app.title': 'Prácticas de Chino',
  'home.lead': 'Bienvenida de nuevo. Vamos a despertar tu chino 中文.',
  'tab.inicio': 'Inicio',
  'tab.vocab': 'Vocab',
  'tab.lectura': 'Lectura',
  'tab.escucha': 'Escucha',
  'tab.escritura': 'Escritura',
  'common.empezar': 'Empezar',
  'common.continuar': 'Continuar',
  'common.siguiente': 'Siguiente',
  'common.cerrar': 'Cerrar',
  'common.volver': 'Volver',
  'common.escuchar': 'Escuchar',
  'common.acierto': '¡Bien! Lo tenías guardado.',
  'common.fallo': 'Casi. Vamos a repasarlo.',
  'common.en_construccion': '{modulo} · en construcción',
} as const;

export type MessageKey = keyof typeof messages;

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const template: string = messages[key];
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const value = params[name];
    return value === undefined ? `{${name}}` : String(value);
  });
}
