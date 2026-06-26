# 练中文 · Prácticas de Chino

PWA para **reactivar y practicar chino mandarín** (nivel HSK 5–6, chengyu y lectura real) desde el iPhone. Pensada para alguien con buen nivel que **lleva tiempo sin practicar**: el foco es la **reactivación** (despertar lo dormido), no aprender desde cero.

> Contenido genérico y de dominio público (vocabulario, chengyu y textos). **Sin datos personales.**

## ✨ Características

- **Vocabulario SRS** con repetición espaciada (FSRS) — HSK 5–6 y chengyu, distinguiendo reconocer de producir.
- **Lectura** con glosas emergentes al tocar la palabra, comprensión y caza de chengyu.
- **Escucha y dictado** con voz china (Web Speech API) y práctica de tonos.
- **Escritura de hanzi** con orden de trazos animado (hanzi-writer).
- **Diagnóstico** inicial y **plan de reactivación** que prioriza lo más oxidado.
- **Funciona offline** e **instalable** en el iPhone (sin App Store).

## 🛠️ Stack

- **Vite + TypeScript** (vanilla, sin framework).
- **PWA** con `vite-plugin-pwa` (Workbox), offline-first.
- **IndexedDB** (progreso) + **localStorage** (ajustes); contenido semilla en JSON.
- **GitHub Pages** para el hosting + **GitHub Actions** para CI/CD.

## 🚀 Desarrollo

```bash
npm install
npm run dev          # servidor de desarrollo
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write
npm run test         # vitest
npm run build        # tsc + vite build
npm run preview      # sirve el build de producción
```

## 📁 Estructura

```
src/
  core/        # lógica transversal: storage, audio (Web Speech), srs/, i18n, events
  modules/     # vocab, reading, listening, writing, diagnostic, progress
  router/      # router hash-based (compatible con GitHub Pages)
  ui/          # componentes y animaciones (estética 水墨)
  styles/      # tokens, base, ink
  types/       # tipos de dominio compartidos
public/data/   # contenido semilla estático (JSON)
```

Cada módulo separa `*.logic.ts` (puro, testeable) de la vista (DOM).

## 📲 Instalar en el iPhone

1. Abre la URL de la app en **Safari**.
2. Toca **Compartir** (el cuadro con la flecha).
3. Elige **Añadir a pantalla de inicio**.

La app queda como un icono más y funciona sin conexión.

## 🤝 Convenciones de contribución

- **Conventional Commits** en español (`feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`).
- **Commits granulares**: un cambio coherente por commit.
- **No se mergea nada con CI en rojo.**
- **Prohibida la co-autoría/atribución de herramientas de IA** en los commits (sin `Co-Authored-By` ni "Generated with…"). Hay un hook `commit-msg` y un check de CI que lo verifican.
