# Prompts para Claude Code — Prácticas de Chino

Programa completo: 151 prompts generados + 8 de refuerzo del QA.

Reglas para CADA prompt: **commit granular**, **esperar CI verde** antes de seguir, **JAMÁS Claude/Anthropic como co-author**.

---

## Grupo A

### A1. Scaffold Vite + TS vanilla

**commit:** `chore: scaffold inicial Vite + TypeScript vanilla`

Inicializa el proyecto en la raiz del repo (carpeta actual). Crea un proyecto Vite + TypeScript VANILLA (sin React, sin frameworks). Pasos concretos:
1. Crea `package.json` con: `"name": "practicas-de-chino"`, `"private": true`, `"type": "module"`, y devDependencies `vite` y `typescript` (ultimas versiones estables). Scripts iniciales: `"dev": "vite"`, `"build": "tsc --noEmit && vite build"`, `"preview": "vite preview"`, `"typecheck": "tsc --noEmit"`.
2. Crea `index.html` en la raiz (SPA, un solo HTML) con `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, lang="es", un `<div id="app"></div>` y `<script type="module" src="/src/main.ts"></script>`.
3. Crea `src/main.ts` minimo que monte un texto de bienvenida ("练中文") en `#app` para verificar que arranca.
4. Crea `src/vite-env.d.ts` con `/// <reference types="vite/client" />`.
5. Crea `vite.config.ts` minimo con `defineConfig({})` por ahora (el base de GitHub Pages se anade en un prompt posterior).
NO configures aun eslint/prettier/vitest/PWA (vienen despues). Instala dependencias con `npm install`.
Verifica: `npm run dev` arranca sin errores y `npm run build` compila a `dist/` sin errores de TypeScript.
DISCIPLINA INVIOLABLE: este es UN commit granular. NO continues hasta que CI/local este verde. JAMAS pongas a Claude/Anthropic como co-author ni anadas trailers Co-Authored-By.

### A2. tsconfig estricto + .gitignore + .editorconfig

**commit:** `chore: tsconfig estricto, gitignore y editorconfig`

Configura el toolchain base de TypeScript y los archivos de proyecto. Crea:
1. `tsconfig.json` ESTRICTO con compilerOptions: `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, `lib: ["ES2022","DOM","DOM.Iterable","WebWorker"]`, `types: ["vite/client"]`, `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitOverride: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`, `forceConsistentCasingInFileNames: true`, `isolatedModules: true`, `verbatimModuleSyntax: true`, `skipLibCheck: true`, `noEmit: true`. `include: ["src","vite.config.ts"]`.
2. `.gitignore` con: `node_modules`, `dist`, `dev-dist`, `*.local`, `.DS_Store`, `coverage`, `.vite`, `*.log`.
3. `.editorconfig` con `root = true`, charset utf-8, indent_style space, indent_size 2, end_of_line lf, insert_final_newline true, trim_trailing_whitespace true.
Ajusta `src/main.ts` si el modo estricto rompe algo (tipa todo, sin `any`).
Verifica: `npm run typecheck` pasa SIN errores y `npm run build` compila.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde antes de seguir, JAMAS Claude/Anthropic como co-author.

### A3. ESLint flat config type-aware

**commit:** `chore: configura ESLint flat config type-aware`

Anade ESLint con flat config type-aware. Pasos:
1. Instala devDependencies: `eslint`, `typescript-eslint`, `eslint-config-prettier` (este ultimo apaga reglas de formato que pelean con Prettier, que se anade luego).
2. Crea `eslint.config.js` (flat config, ESM) que aplique a `**/*.ts`: `eslint.configs.recommended`, `tseslint.configs.recommendedTypeChecked` con `parserOptions.projectService: true` y `tsconfigRootDir`, y al final `eslintConfigPrettier`. Activa reglas clave: `@typescript-eslint/no-floating-promises: error` (critico por audio/IndexedDB async futuros) y `@typescript-eslint/consistent-type-imports: error`. Ignora `dist`, `dev-dist`, `coverage`, `node_modules`.
3. Anade script `"lint": "eslint . --max-warnings 0"` a package.json.
Corrige cualquier violacion en `src/` para dejar el lint limpio.
Verifica: `npm run lint` pasa con 0 errores y 0 warnings, y `npm run typecheck` sigue verde.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A4. Prettier + integracion lint

**commit:** `chore: configura Prettier y scripts de formato`

Anade Prettier como unica fuente de verdad de formato. Pasos:
1. Instala devDependency `prettier`.
2. Crea `.prettierrc.json` con `{ "semi": true, "singleQuote": true, "printWidth": 100, "trailingComma": "all" }`.
3. Crea `.prettierignore` con: `dist`, `dev-dist`, `coverage`, `node_modules`, `package-lock.json`.
4. Anade scripts: `"format": "prettier --write ."` y `"format:check": "prettier --check ."`.
5. Ejecuta `npm run format` para normalizar todos los archivos existentes.
Verifica: `npm run format:check` pasa sin diferencias, `npm run lint` sigue verde (eslint-config-prettier ya esta activo, no debe haber conflictos) y `npm run typecheck` verde.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A5. Vitest con jsdom y mocks

**commit:** `test: configura Vitest con jsdom y mocks de speech/indexeddb`

Configura Vitest para tests de logica pura. Pasos:
1. Instala devDependencies: `vitest`, `jsdom`, `@vitest/coverage-v8`, `fake-indexeddb`.
2. En `vite.config.ts` anade la seccion `test` (Vitest comparte config con Vite): `environment: 'jsdom'`, `globals: true`, `setupFiles: ['tests/setup.ts']`, `coverage: { provider: 'v8', reporter: ['text','lcov'] }`. Anade `/// <reference types="vitest/config" />` o importa `defineConfig` desde `vitest/config`.
3. Crea `tests/setup.ts` con mocks de `window.speechSynthesis` y `SpeechSynthesisUtterance` (no existen en jsdom) e importa `fake-indexeddb/auto` para tener IndexedDB en tests.
4. En `tsconfig.json` anade `"vitest/globals"` a `types` e incluye `tests` en `include`.
5. Crea un test smoke `src/sanity.test.ts` que verifique `expect(1+1).toBe(2)`.
6. Anade scripts: `"test": "vitest run"` y `"test:watch": "vitest"`. Para CI con cobertura usa `vitest run --coverage` desde el script de CI mas adelante.
Verifica: `npm test` pasa, `npm run typecheck` y `npm run lint` verdes.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A6. Estructura de carpetas del proyecto

**commit:** `chore: estructura de carpetas modular del proyecto`

Crea el esqueleto de carpetas y archivos placeholder para la arquitectura modular descrita, de forma que TODO compile y los tests sigan pasando. Crea (con contenido minimo valido en TS, exports vacios o stubs tipados, sin `any`):
- `src/app.ts` (shell de la app, funcion `mountApp(root: HTMLElement)` stub).
- `src/router/router.ts` (router hash, tipo `Route = { path: string; load: () => Promise<{ mount: (el: HTMLElement) => void }> }`, stub que escucha `hashchange`) y `src/router/routes.ts` (mapa de rutas vacio por ahora).
- `src/core/storage.ts`, `src/core/audio.ts`, `src/core/events.ts`, `src/core/i18n.ts` (stubs tipados).
- `src/core/srs/fsrs.ts` y `src/core/srs/scheduler.ts` (stubs).
- `src/modules/{vocab,reading,listening,writing,diagnostic,progress}/` cada uno con un `index.ts` stub que exporte un objeto `{ mount }`.
- `src/ui/components/`, `src/ui/animations/` (con un `.gitkeep` o un `index.ts` vacio).
- `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/ink.css` (vacios o con un comentario).
- `src/types/index.ts` (vacio por ahora).
- `src/pwa/register-sw.ts` (stub).
- Carpetas `public/data/{vocab,reading,diagnostic}/` con `.gitkeep`.
Actualiza `src/main.ts` para importar `mountApp` desde `src/app.ts`.
Verifica: `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` TODO verde.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A7. README del proyecto

**commit:** `docs: README con stack, modulos y convenciones`

Crea un `README.md` completo en espanol que documente el proyecto. Incluye secciones:
1. Titulo y descripcion: PWA para reactivar y practicar chino mandarin (HSK 5-6+, chengyu), pensada para una usuaria hispanohablante avanzada pero oxidada. Modos: diagnostico inicial + camino de reactivacion.
2. Stack: Vite + TypeScript vanilla, PWA instalable (iOS Safari -> Compartir -> Anadir a pantalla de inicio), alojada gratis en GitHub Pages, audio via Web Speech API (voz zh-CN/Ting-Ting), SRS con FSRS (ts-fsrs), escritura con hanzi-writer.
3. Modulos: Vocabulario SRS, Lectura con glosas, Escucha/dictado, Escritura de hanzi, Diagnostico/reactivacion, Progreso/gamificacion.
4. Comandos: `npm run dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `test`.
5. Estructura de carpetas (resumen del arbol src/ y public/).
6. Despliegue: GitHub Pages via GitHub Actions; base path = nombre del repo.
7. Convenciones de commit: Conventional Commits en espanol, commits granulares, esperar CI verde, y la regla de que JAMAS se anade a Claude/Anthropic como co-author.
Verifica: `npm run format:check` pasa (Prettier formatea el .md). El resto de checks no debe romperse.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A8. Plantilla de commit + configuracion git de autoria

**commit:** `chore: plantilla de commit y autoria git humana`

Configura git para garantizar autoria humana y commits limpios. Pasos:
1. Crea `.gitmessage` (plantilla de commit) en estilo Conventional Commits en espanol, con comentarios que listen tipos (feat, fix, chore, docs, style, refactor, perf, test, build, ci) y ambitos (vocab, reading, listening, writing, diagnostic, progress, pwa, ui, ci, core), y una nota explicita: "NO anadir Co-Authored-By. NO atribuir a Claude/Anthropic."
2. Configura git en el repo para usarla: `git config commit.template .gitmessage`.
3. Configura autor humano fijo: `git config user.name "<nombre del usuario>"` y `git config user.email "alexitobbsito@protonmail.com"`. (Pregunta el nombre si no lo sabes o deja un placeholder claro que el usuario debe rellenar).
4. Documenta brevemente en el README (seccion de commits) que NUNCA se usa `--author` apuntando a Claude ni trailers de co-autoria.
NO modifiques codigo fuente. Verifica que `git config --get commit.template` devuelve `.gitmessage`.
Verifica que el resto de checks siguen verdes.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author (este prompt precisamente blinda esa regla).

### A9. Husky + lint-staged + hook anti co-autoria

**commit:** `chore: husky, lint-staged y hook commit-msg anti co-autoria`

Anade hooks de git locales que aceleren el feedback y BLINDEN la regla anti-Claude. Pasos:
1. Instala devDependencies `husky` y `lint-staged`. Anade script `"prepare": "husky"` y ejecuta `npx husky init` (crea `.husky/`).
2. Configura `lint-staged` en package.json: `"*.{ts,js}": ["eslint --fix", "prettier --write"]`, `"*.{css,json,md,html}": ["prettier --write"]`.
3. `.husky/pre-commit` ejecuta `npx lint-staged`.
4. `.husky/commit-msg` ejecuta un script POSIX sh que lee el archivo de mensaje (`$1`) y FALLA (exit 1) con un mensaje de error claro en espanol si encuentra, case-insensitive (`grep -iE`), cualquiera de estos patrones: `co-authored-by:.*(claude|anthropic|@anthropic\.com)`, `generated with .*claude`, o `claude code`. Mensaje de error sugerido: "Commit rechazado: prohibida la co-autoria/atribucion de Claude o Anthropic. Elimina las lineas Co-Authored-By / 'Generated with Claude'."
Haz ejecutables los hooks. Prueba el hook commit-msg manualmente: crea un archivo temporal con una linea `Co-Authored-By: Claude <noreply@anthropic.com>` y comprueba que el script devuelve exit 1; con un mensaje limpio devuelve 0 (borra el temporal despues).
Verifica: typecheck, lint, test, build siguen verdes.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A10. vite-plugin-pwa: manifest + service worker

**commit:** `feat(pwa): manifest y service worker con vite-plugin-pwa`

Anade la base de PWA con `vite-plugin-pwa` (envuelve Workbox) en modo generateSW. Pasos:
1. Instala devDependency `vite-plugin-pwa`.
2. En `vite.config.ts` importa y anade `VitePWA({ ... })` con: `registerType: 'prompt'`, `includeAssets: ['favicon.svg','apple-touch-icon.png','fonts/**/*.woff2']`, y un `manifest` con: `name: 'Practicas de Chino'`, `short_name: '中文'`, `description: 'Reactiva y practica tu chino mandarin'`, `lang: 'es'`, `dir: 'ltr'`, `start_url: '.'`, `scope: '.'`, `display: 'standalone'`, `background_color: '#f6efe1'`, `theme_color: '#c8492c'`, e `icons` apuntando a `icons/icon-192.png`, `icons/icon-512.png` y `icons/maskable-512.png` (purpose maskable). En `workbox`: `globPatterns: ['**/*.{js,css,html,woff2,svg,png,json}']`, `cleanupOutdatedCaches: true`, `navigateFallback: 'index.html'`.
3. Anade `"vite-plugin-pwa/client"` a `types` en tsconfig.
4. Implementa `src/pwa/register-sw.ts` usando `registerSW` de `virtual:pwa-register` con `onNeedRefresh` y `onOfflineReady` (por ahora con `console.info` o un placeholder; el toast bonito viene en otro grupo). Llama a `registerSW` desde `src/main.ts`.
5. Crea iconos PLACEHOLDER validos para que el build no falle: `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png`, `public/apple-touch-icon.png` (180x180) y `public/favicon.svg`. Pueden ser PNG simples opacos generados temporalmente (los definitivos llegan en el grupo de diseno). NO uses transparencia en apple-touch-icon.
Verifica: `npm run build` genera `dist/manifest.webmanifest` y `dist/sw.js`; typecheck/lint/test verdes.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A11. Meta tags PWA iOS en index.html

**commit:** `feat(pwa): meta tags iOS para instalacion en pantalla de inicio`

Anade en `index.html` las meta tags necesarias para que la PWA se instale y se vea bien en iOS (Safari -> Compartir -> Anadir a pantalla de inicio). En el `<head>` anade:
- `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- `<meta name="apple-mobile-web-app-title" content="练中文">`
- `<meta name="theme-color" content="#c8492c" media="(prefers-color-scheme: light)">`
- `<meta name="theme-color" content="#16150f" media="(prefers-color-scheme: dark)">`
- `<meta name="description" content="Reactiva y practica tu chino mandarin">`
Asegurate de que el `<meta name="viewport">` ya tiene `viewport-fit=cover` (imprescindible para que `env(safe-area-inset-*)` funcione con el notch). Ten en cuenta que `vite-plugin-pwa` ya inyecta el link al manifest; no lo dupliques.
Verifica: `npm run build` ok, abre el preview y comprueba que las meta tags estan en el HTML servido. typecheck/lint/test verdes.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A12. Base path de GitHub Pages

**commit:** `build(pwa): base path para GitHub Pages`

Configura el `base` de Vite para que la app funcione bajo el subpath de GitHub Pages (`https://<usuario>.github.io/<repo>/`). Pasos:
1. En `vite.config.ts` anade `base: '/practicas-de-chino/'` (debe coincidir EXACTAMENTE, sensible a mayusculas, con el nombre real del repo; si el repo se llama distinto, ajusta el valor). Manten `start_url: '.'` y `scope: '.'` relativos en el manifest para que respeten el base.
2. Revisa que NINGUN fetch/import use rutas absolutas tipo `/data/x.json`; cuando se carguen datos, deben construirse con `import.meta.env.BASE_URL + 'data/x.json'`. Documenta esta regla con un comentario en `src/core/storage.ts` o donde corresponda.
3. Confirma que el router sera hash-based (`#/ruta`) para ser inmune al base y evitar 404 en refresco; deja un comentario en `src/router/router.ts` recordandolo.
4. (Opcional) Crea un `public/404.html` que sea copia de index o redireccion, como red de seguridad.
Verifica: `npm run build` genera assets con el prefijo `/practicas-de-chino/` en `dist/index.html`. typecheck/lint/test verdes.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A13. Workflow CI de calidad

**commit:** `ci: workflow de typecheck, lint, format, test y build`

Crea el workflow de Integracion Continua. Crea `.github/workflows/ci.yml` que corra en `push` a `main` y en `pull_request`. Define un job `quality` en `ubuntu-latest`:
1. `actions/checkout@v4`.
2. `actions/setup-node@v4` con `node-version: 20` y `cache: npm`.
3. `npm ci`.
4. `npm run typecheck`.
5. `npm run lint`.
6. `npm run format:check`.
7. `npm run test` (o `vitest run --coverage`).
8. `npm run build`.
9. `actions/upload-artifact@v4` subiendo `dist` con name `dist`.
Asegurate de que todos esos scripts existen en package.json y pasan en local antes de commitear (corre cada uno).
Verifica en local que toda la secuencia pasa verde. Tras pushear, ESPERA a que el workflow CI este VERDE en GitHub antes de continuar.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A14. Guardarrail CI anti co-autoria

**commit:** `ci: guardarrail que rechaza co-autoria de Claude/Anthropic`

Anade una capa de defensa en CI que rechace cualquier commit que atribuya autoria a Claude/Anthropic, por si alguien se salta el hook local con `--no-verify`. En `.github/workflows/ci.yml` anade un step (al inicio del job `quality`, o un job propio `commit-guard`) que:
1. Haga checkout con `fetch-depth: 0` (`actions/checkout@v4` con `with: { fetch-depth: 0 }`) para tener el historico.
2. Ejecute un script sh que escanee los mensajes de los commits nuevos del push/PR. Para PRs compara contra la base (`${{ github.event.pull_request.base.sha }}..HEAD`); para push usa el rango del evento. Falla (exit 1) si `git log --format='%B' <rango> | grep -iE 'co-authored-by:.*(claude|anthropic)|generated with .*claude|claude code'` encuentra match. Mensaje de error claro en espanol.
Verifica que el step no rompe en commits limpios (todos los del repo deben estar limpios). Tras pushear, ESPERA CI VERDE.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A15. Lighthouse CI assert PWA/a11y

**commit:** `ci: Lighthouse CI con assert de PWA y accesibilidad`

Anade Lighthouse CI para garantizar que la PWA sigue siendo instalable, rapida y accesible commit a commit. Pasos:
1. Crea `lighthouserc.json` con: `ci.collect.staticDistDir: "./dist"`, `numberOfRuns: 1`, y `ci.assert.assertions` con: `categories:pwa` => `["error", { "minScore": 0.9 }]`, `categories:accessibility` => `["error", { "minScore": 0.9 }]`, `categories:performance` => `["warn", { "minScore": 0.85 }]`, ademas `installable-manifest`, `service-worker`, `apple-touch-icon` y `viewport` como `"error"`.
2. En `.github/workflows/ci.yml` anade un job `lighthouse` con `needs: quality`: checkout, setup-node@v4 (node 20, cache npm), `npm ci`, `npm run build`, y `npx @lhci/cli autorun`.
3. IMPORTANTE: como la app usa `base: '/practicas-de-chino/'`, Lighthouse al servir `dist` desde la raiz puede no encontrar las rutas. Resuelvelo: o bien genera para la auditoria un build con `base: '/'` (p.ej. `npx vite build --base=/ --outDir dist-lh` y apunta `staticDistDir` a `dist-lh`), o asegura que el primer render usa rutas relativas. Elige la opcion que deje el assert `installable-manifest` y `service-worker` en verde.
Verifica corriendo `npm run build && npx @lhci/cli autorun` en local hasta que pase. Tras pushear, ESPERA CI VERDE (incluido el job lighthouse).
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A16. Workflow CD a GitHub Pages

**commit:** `ci: despliegue continuo a GitHub Pages`

Crea el despliegue continuo a GitHub Pages con el metodo oficial de Actions (NO la rama gh-pages legacy). Crea `.github/workflows/deploy.yml`:
1. `on: push: branches: [main]`.
2. `permissions: { contents: read, pages: write, id-token: write }`.
3. `concurrency: { group: pages, cancel-in-progress: true }`.
4. Job `build` (ubuntu-latest): checkout@v4, setup-node@v4 (node 20, cache npm), `npm ci`, `npm run build`, y `actions/upload-pages-artifact@v3` con `path: dist`.
5. Job `deploy` con `needs: build`, `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }`, y step `actions/deploy-pages@v4` con id `deployment`.
Documenta en el README (o en un comentario del workflow) que en GitHub hay que activar Settings -> Pages -> Source: GitHub Actions, y recomendar branch protection en `main` exigiendo que CI pase antes de merge (materializa "esperar CI verde" a nivel plataforma).
Nota: `npm run build` ya hace `tsc --noEmit` antes de `vite build`, asi que el deploy revalida tipos.
Verifica: el workflow es YAML valido (revisa indentacion). Tras pushear a main, ESPERA a que CI este VERDE y comprueba que el deploy publica la app en la URL de Pages.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A17. Tipos de dominio compartidos

**commit:** `feat(core): tipos de dominio compartidos`

Define los tipos TypeScript del dominio en `src/types/index.ts` (sin logica, solo tipos/interfaces) segun el modelo de datos del proyecto, para que los modulos los consuman despues. Incluye exactamente:
- `type Habilidad = 'lectura' | 'escucha' | 'vocab_activo' | 'tonos'`.
- `type TipoTarjeta = 'recognition' | 'production' | 'listening' | 'tone' | 'dictation' | 'writing'`.
- `interface LexemaSemilla` con: id, hanzi, pinyin, es, `hsk: 3|4|5|6|7`, esChengyu, trazos?, `ejemplo?: { hanzi: string; pinyin?: string; es: string }`, `tags: string[]`, `dificultad: number`.
- `interface TextoLectura` (id, titulo, `nivel: 'intermedio'|'intermedio-alto'|'avanzado'`, cuerpo, glosaEs, `glosas: Array<{hanzi;pinyin;es}>`, `preguntas: Array<{enunciado; opciones: string[]; correcta: number; explicacion}>`, `lexemasRelacionados: string[]`).
- `interface ItemDiagnostico` y `interface ResultadoDiagnostico` (con `perfilHabilidades: Record<Habilidad, number>` y `gapProduccion: string[]`).
- `type GradoFsrs = 1|2|3|4`.
- `interface EstadoFsrs` (due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, `state: 0|1|2|3`, last_review?).
- `interface TarjetaUsuario` (id, lexemaId, tipo, `origen: 'nuevo'|'reactivacion'`, fsrs, desbloqueada, fallosEscritura?, suspendida?).
- `interface LogReview`, `interface PerfilUsuario`, `interface ProgresoLectura`, `interface Settings`.
Respeta `exactOptionalPropertyTypes` y `verbatimModuleSyntax` (usa `export interface`/`export type`). No introduzcas `any`.
Verifica: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` TODO verde.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

### A18. Router hash + app shell minimo

**commit:** `feat: router hash y app shell navegable`

Implementa el router hash y un app shell minimo navegable, cerrando la base de infraestructura del grupo A. Pasos:
1. En `src/router/router.ts` implementa un router basado en `location.hash`: escucha el evento `hashchange` y `DOMContentLoaded`, parsea `#/ruta`, busca en la tabla de rutas, hace `import()` dinamico (lazy) del modulo y llama a su `mount(el)`. Si no hay match, redirige a una ruta home por defecto. Tipa todo con `Route` de `src/types` o local. Envuelve el cambio de vista en un helper `navigate(render)` que use `document.startViewTransition` si existe y no hay `prefers-reduced-motion: reduce`, con fallback a render directo.
2. En `src/router/routes.ts` define el mapa de las 6 rutas (`#/vocab`, `#/lectura`, `#/escucha`, `#/escritura`, `#/diagnostico`, `#/progreso`) usando `() => import('../modules/...')`. Cada modulo ya tiene su stub `{ mount }`.
3. En `src/app.ts` implementa `mountApp(root)`: pinta el shell con un contenedor `.content` y una barra de navegacion inferior con 6 enlaces hash; inicializa el router. Manten estilos minimos (los tokens bonitos llegan en otro grupo) importando `src/styles/base.css`.
4. Asegura que cada modulo stub renderiza al menos un titulo identificable para verificar la navegacion.
Verifica: `npm run build` ok; en preview, navegar entre las 6 rutas via los enlaces funciona y refrescar no da 404. typecheck/lint/test verdes.
DISCIPLINA INVIOLABLE: UN commit granular, esperar CI verde, JAMAS Claude/Anthropic como co-author.

## Grupo B

### B1. Tokens CSS de color base (pigmentos)

**commit:** `feat(ui): tokens CSS de pigmentos base 水墨`

Crea el archivo `/src/styles/tokens.css` con la capa de PIGMENTOS BASE del sistema de diseno 水墨 (no usar directos en UI, son la fuente). Define en `:root` las variables de los cuatro pigmentos tradicionales mas el papel arroz:

- Tinta 墨: `--ink-900: #1a1a18; --ink-700: #2e2c28; --ink-500: #4a473f; --ink-300: #827d72; --ink-100: #b8b1a3;`
- Bermellon 朱红: `--vermilion-600: #b3331f; --vermilion-500: #c8492c; --vermilion-400: #d96a4f;`
- Jade 青绿: `--jade-700: #2f5d50; --jade-500: #4a8c7a; --jade-300: #8fc0b2;`
- Oro 金: `--gold-500: #b08d4f; --gold-300: #d4bd8f;`
- Papel arroz 宣纸: `--paper-50: #faf6ec; --paper-100: #f4ecdc; --paper-200: #e9ddc6;`

Importa este archivo desde `/src/main.ts` (o desde el CSS raiz que ya cargue main.ts) con `import './styles/tokens.css'` para que Vite lo incluya en el bundle. NO crees aun tokens semanticos (eso es el siguiente paso). Verifica con `npm run build` que compila y que el CSS aparece en `dist`. 

DISCIPLINA: este es UN solo commit granular (solo la capa de pigmentos). Espera CI VERDE (typecheck + lint + format + test + build) antes de continuar. JAMAS pongas a Claude como co-author ni anadas trailers `Co-Authored-By` ni 'Generated with Claude'.

### B2. Tokens semanticos modo claro

**commit:** `feat(ui): tokens semanticos de color modo claro`

Edita `/src/styles/tokens.css` y anade dentro de `:root` (debajo de los pigmentos) la capa de TOKENS SEMANTICOS para MODO CLARO, derivados de los pigmentos ya definidos. Usa exactamente estos nombres y valores:

```
--bg: #f6efe1; --bg-elevated: #fdf9f0; --bg-sunken: #efe6d4; --surface-line: #e3d7bf;
--text: #20201d; --text-muted: #6b665b; --text-faint: #9b9486;
--accent: #c8492c; --accent-hover: #b3331f; --accent-soft: #f3dcd3;
--jade: #4a8c7a; --jade-soft: #dcebe4; --gold: #b08d4f;
--success: #4a8c7a; --success-soft: #d9ece4; --error: #c8492c; --error-soft: #f3dcd3; --warning: #b08d4f;
--shadow-ink: 24 22 18; --focus-ring: #c8492c;
```

El token `--shadow-ink` es un triplete RGB sin coma para usarse como `rgb(var(--shadow-ink) / .12)`. Aplica `background: var(--bg); color: var(--text);` al `body` (puede ir en este mismo archivo o en `base.css` si ya existe; si no existe, ponlo en tokens.css). Verifica con `npm run build` que compila.

DISCIPLINA: commit granular (solo tokens semanticos claros). Espera CI VERDE antes de seguir. JAMAS Claude como co-author.

### B3. Tokens semanticos modo oscuro + toggle data-theme

**commit:** `feat(ui): tokens de color modo oscuro y override data-theme`

Edita `/src/styles/tokens.css` y anade el soporte de MODO OSCURO (tinta sobre seda nocturna, NO negro puro). Crea un bloque `@media (prefers-color-scheme: dark) { :root { ... } }` que sobrescriba SOLO los tokens semanticos con estos valores:

```
--bg: #16150f; --bg-elevated: #211f17; --bg-sunken: #100f0a; --surface-line: #322f24;
--text: #ece4d3; --text-muted: #a59c87; --text-faint: #756e5d;
--accent: #e0644a; --accent-hover: #ef7a60; --accent-soft: #3a241d;
--jade: #6fb3a0; --jade-soft: #1e3029; --gold: #cdaa6a;
--success: #6fb3a0; --success-soft: #1e3029; --error: #e0644a; --error-soft: #3a241d;
--shadow-ink: 0 0 0;
```

Ademas, para permitir un override manual desde Ajustes, anade dos bloques de atributo que repliquen los mismos tokens: `[data-theme="light"] { color-scheme: light; ...tokens claros... }` y `[data-theme="dark"] { color-scheme: dark; ...tokens oscuros... }`. Anade `<html lang="es">` ya existe; no toques HTML. Verifica con `npm run build`.

DISCIPLINA: commit granular (solo modo oscuro + overrides data-theme). Espera CI VERDE. JAMAS Claude como co-author.

### B4. Subsetting y self-host de fuentes hanzi

**commit:** `build(ui): script de subsetting y self-host de fuentes hanzi`

Crea un script de subsetting de fuentes CJK para self-host (offline-first, sin Google Fonts CDN). El contenido chino vive en JSON estatico bajo `/public/data/` (vocabulario, textos, chengyu); usa esos JSON para extraer el conjunto EXACTO de caracteres usados.

1. Anade `fonttools` como dependencia de build documentada en el README (subsetting con `pyftsubset`) O, si prefieres todo-Node, usa `subset-font` (npm) en un script. Elige UNA via y documentala.
2. Crea `/scripts/subset-fonts.mjs` (Node ESM) que: (a) lea recursivamente todos los `.json` de `/public/data/`, extraiga los caracteres CJK unicos (rango U+3000-303F, U+4E00-9FFF, U+FF00-FFEF) mas los caracteres hero del splash/iconos (中 学 文 词 读 听 写 进 印), (b) genere subsets WOFF2 de LXGW WenKai, Noto Serif SC y Ma Shan Zheng a `/public/fonts/` (`lxgw-subset.woff2`, `noto-serif-sc-subset.woff2`, `ma-shan-zheng-subset.woff2`). Las fuentes fuente (`.ttf` originales) ponlas en `/scripts/fonts-src/` (gitignored o commiteadas segun tamano; documenta de donde descargarlas: LXGW WenKai y Ma Shan Zheng de GitHub, Noto Serif SC de Google Fonts, todas OFL).
3. Anade script `package.json`: `"fonts:subset": "node scripts/subset-fonts.mjs"`.

Deja Inter via system stack (no subset). Verifica ejecutando el script y comprobando que los `.woff2` aparecen en `/public/fonts/` y pesan < 700 KB cada uno. Verifica `npm run build`.

DISCIPLINA: commit granular (script + fuentes subset generadas). Espera CI VERDE. JAMAS Claude como co-author.

### B5. @font-face y escala tipografica

**commit:** `feat(ui): @font-face hanzi y escala tipografica`

Crea `/src/styles/typography.css` con las declaraciones `@font-face` y la escala tipografica del sistema. Importalo desde main.ts (`import './styles/typography.css'`) DESPUES de tokens.css.

1. Declara tres `@font-face` apuntando a los WOFF2 self-hosted en `/public/fonts/` (que ya existen del paso de subsetting), todas con `font-display: swap` y `unicode-range: U+4E00-9FFF, U+3000-303F, U+FF00-FFEF`:
   - `"LXGW WenKai"` -> `url('/fonts/lxgw-subset.woff2') format('woff2')`
   - `"Noto Serif SC"` -> `noto-serif-sc-subset.woff2`
   - `"Ma Shan Zheng"` -> `ma-shan-zheng-subset.woff2`
   IMPORTANTE: usa rutas que respeten el `base` de GitHub Pages; como es CSS estatico, usa rutas relativas a la raiz del deploy o documenta que Vite reescribe `/fonts/` correctamente (si hay duda, usa `url('../../public/fonts/...')` NO; mejor deja `/fonts/` y confia en `base` + globPatterns del SW).
2. Define en `:root` las familias y la escala:
```
--font-hanzi-read: 'LXGW WenKai','Noto Serif SC',serif;
--font-hanzi-cal: 'Ma Shan Zheng','LXGW WenKai',serif;
--font-ui: 'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
--fs-pinyin:0.875rem; --fs-caption:0.78rem; --fs-body:1.0625rem; --fs-lead:1.25rem;
--fs-h3:1.5rem; --fs-h2:1.95rem; --fs-h1:2.6rem; --fs-hero:clamp(3rem,14vw,5.5rem);
--lh-tight:1.15; --lh-body:1.7; --lh-hanzi:1.9;
```
3. Aplica `body { font-family: var(--font-ui); font-size: var(--fs-body); line-height: var(--lh-body); }` y crea clases utilitarias `.hanzi-read` y `.hanzi-cal` con sus familias e interlineados. Anade `font-variant-numeric: tabular-nums` a una clase `.nums`.

Verifica con `npm run build`.

DISCIPLINA: commit granular (solo tipografia). Espera CI VERDE. JAMAS Claude como co-author.

### B6. Preload de fuentes criticas en index.html

**commit:** `perf(ui): preload de fuente caligrafica para el splash`

Edita `/index.html` para optimizar el primer pintado de las fuentes (las CJK son pesadas). En el `<head>`:

1. Anade `<link rel="preload" as="font" type="font/woff2" href="/fonts/ma-shan-zheng-subset.woff2" crossorigin>` (la caligrafica la necesita el splash YA).
2. NO precargues LXGW WenKai ni Noto Serif SC: cargan diferido (`font-display: swap`) porque se usan al entrar a lectura/SRS, no en el splash.
3. Confirma que el `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` existe (necesario para notch/env()); si no, anadelo.
4. Asegura que `<html lang="es">`.

Si el preload con ruta absoluta `/fonts/` rompe bajo el `base` de GitHub Pages, documenta en un comentario HTML que la ruta debe coincidir con el `base` configurado en vite.config.ts. Verifica con `npm run build` que el HTML resultante en `dist` conserva el preload.

DISCIPLINA: commit granular (solo preload + meta). Espera CI VERDE. JAMAS Claude como co-author.

### B7. Easings y duraciones de animacion

**commit:** `feat(ui): easings, duraciones y keyframes base de animacion`

Crea `/src/styles/animations.css` (importado desde main.ts despues de typography.css) con los TOKENS DE MOVIMIENTO base. Cada animacion del sistema imita tinta o papel: suave al entrar, decidida al asentar.

Define en `:root`:
```
--ease-ink: cubic-bezier(.4,0,.2,1);
--ease-brush: cubic-bezier(.22,1,.36,1);
--ease-seal: cubic-bezier(.34,1.56,.64,1);
--dur-fast:160ms; --dur:220ms; --dur-slow:360ms;
```

Anade keyframes reutilizables que usaran las micro-interacciones posteriores: `@keyframes ink-shake` (translateX +-4px, 2 ciclos) para feedback incorrecto, `@keyframes ink-bloom` (opacity+scale para destello tipo gota), y `@keyframes seal-drop` (de scale(1.4) opacity .3 a scale(1) opacity .92). NO los apliques aun a ningun componente; solo deja las @keyframes y los tokens listos.

Verifica con `npm run build`.

DISCIPLINA: commit granular (solo tokens de movimiento + keyframes base). Espera CI VERDE. JAMAS Claude como co-author.

### B8. Soporte prefers-reduced-motion global

**commit:** `feat(ui): soporte prefers-reduced-motion global y helper motion`

Edita `/src/styles/animations.css` y anade al FINAL el bloque global de accesibilidad `prefers-reduced-motion`. Debe neutralizar todo lo no esencial sin romper la UX:

```
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Ademas, crea un helper TS reutilizable `/src/core/motion.ts` que exporte `export const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;` y un test `/src/core/motion.test.ts` (Vitest, entorno jsdom) que mockee `window.matchMedia` y verifique que devuelve `true`/`false` segun el mock. Asegurate de que `tests/setup.ts` o el propio test definan `window.matchMedia` (jsdom no lo trae). 

Verifica con `npm run test` y `npm run build`.

DISCIPLINA: commit granular (reduce-motion CSS + helper + test). Espera CI VERDE (incluido el nuevo test). JAMAS Claude como co-author.

### B9. Textura de papel arroz 宣纸

**commit:** `feat(ui): textura de papel arroz 宣纸 con feTurbulence`

Crea `/src/styles/motifs.css` (importado desde main.ts despues de animations.css) y empieza por la TEXTURA DE PAPEL 宣纸, sin peticiones de red. Implementa el grano con un `feTurbulence` SVG embebido como data-URI en una variable CSS:

1. Genera un SVG inline minimo `<svg><filter><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect filter=.../></svg>`, codificalo como data-URI y asignalo a `--paper-grain`.
2. Crea una clase `.paper` que aplique `background-color: var(--bg)` y superponga `--paper-grain` a opacidad muy baja (`background-image` con `opacity` via pseudo-elemento `::before` a `opacity:.04` aprox) para que el grano no afecte el texto.
3. En modo oscuro la textura debe ACLARAR levemente (papel de seda nocturno) en vez de oscurecer: usa `mix-blend-mode` apropiado o una segunda variable `--paper-grain` dentro del bloque dark.
4. Aplica `.paper` al contenedor raiz de la app (documenta cual: `.app` o `body`).

Verifica que NO hay ninguna peticion de red por la textura (todo data-URI) y que `npm run build` pasa.

DISCIPLINA: commit granular (solo textura de papel). Espera CI VERDE. JAMAS Claude como co-author.

### B10. Componente SVG del sello 印章

**commit:** `feat(ui): componente SVG del sello 印章`

Crea el motivo de marca mas reconocible: el SELLO/chop 印章. Crea `/src/ui/components/seal.ts` que exporte una funcion `createSeal(opts: { hanzi: string; size?: number; variant?: 'red'|'jade'; mode?: 'zhuwen'|'baiwen' }): SVGElement`. Debe:

1. Generar un SVG con un `<rect>` de esquinas `rx` pequeno, relleno bermellon (`var(--accent)`) o jade (`var(--jade)`) segun `variant`.
2. Colocar el `hanzi` dentro en `var(--font-hanzi-cal)`: en blanco sobre rojo (白文) o rojo sobre blanco (朱文) segun `mode`.
3. Dar el aspecto de estampado imperfecto: `opacity: .92` y `mix-blend-mode: multiply` sobre el papel, con un borde ligeramente irregular (puede ser un `feTurbulence`+`feDisplacementMap` muy sutil en un `<filter>`, o una `mask` de ruido si es mas barato).
4. No depender de red ni de imagenes raster.

Anade los estilos en `/src/styles/motifs.css` (clase `.seal`). Crea un test `/src/ui/components/seal.test.ts` (Vitest+jsdom) que verifique que `createSeal({hanzi:'中'})` devuelve un `SVGElement` que contiene el hanzi y un `<rect>`. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (componente sello + estilos + test). Espera CI VERDE. JAMAS Claude como co-author.

### B11. Trazo de pincel 水墨 (brush stroke)

**commit:** `feat(ui): motivo de trazo de pincel 水墨 en SVG`

Crea el motivo de TRAZO DE PINCEL 水墨 para subrayados, divisores y el barrido del splash. Un trazo no es una linea recta: entrada fina, panza gruesa, final que se afina (飞白).

1. Crea `/src/ui/components/brushStroke.ts` que exporte `createBrushStroke(opts: { color?: string; width?: number; animated?: boolean }): SVGElement`. Debe devolver un `<svg>` con un `<path>` cuya SILUETA del trazo este rellena (`fill`, no `stroke`), con extremos irregulares. Color por defecto `var(--accent)`.
2. Si `animated: true`, prepara el trazo para 'pintarse' de izquierda a derecha mediante una `mask`/`clip-path` deslizante o `stroke-dashoffset` sobre un path central; respeta `prefers-reduced-motion` (importa el helper de `/src/core/motion.ts` y, si esta activo, muestra el trazo ya formado).
3. Anade en `/src/styles/motifs.css`: una clase `.brush-underline` (subrayado de acento bajo titulos, ~6px, extremos irregulares) que use este motivo en lugar de `border-bottom`.

Crea test `/src/ui/components/brushStroke.test.ts` que verifique que devuelve un SVG con un `<path>` con atributo `fill`. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (motivo de pincel + estilos + test). Espera CI VERDE. JAMAS Claude como co-author.

### B12. Marca de agua 留白 y esquinas de marco

**commit:** `feat(ui): marca de agua 留白, esquinas de marco y separador`

Anade dos motivos sutiles a `/src/styles/motifs.css` y un helper TS:

1. MARCA DE AGUA 留白: una clase `.watermark` que coloque un hanzi gigante (el del modulo, p.ej. 读 en Lectura) a `opacity:.03` (claro) / `.05` (oscuro) en una esquina del fondo, en `var(--font-hanzi-cal)`, con `position:absolute; pointer-events:none;` y recortado por `overflow:hidden` del contenedor. Crea `/src/ui/components/watermark.ts` con `createWatermark(hanzi: string): HTMLElement` que devuelva el nodo posicionado.
2. ESQUINAS DE MARCO 边框: clase `.corner-brackets` que dibuje cuatro esquinas en 'L' finas de oro mate (`var(--gold)`, 1px) en las cuatro esquinas de una tarjeta (via cuatro pseudo-elementos o un SVG de fondo), SIN borde completo. Evoca marcos de album de caligrafia.
3. SEPARADOR 分隔: clase `.divider-ink` que sea un hairline de oro de 1px con un mini-rombo ◆ centrado.

Verifica con `npm run build`. Crea un test minimo `/src/ui/components/watermark.test.ts` que verifique que `createWatermark('读')` devuelve un elemento con el hanzi y la clase `watermark`.

DISCIPLINA: commit granular (marca de agua + marco + separador). Espera CI VERDE. JAMAS Claude como co-author.

### B13. Datos de trazos del caracter hero del splash

**commit:** `feat(splash): datos de trazos y builder SVG del caracter hero`

Prepara los datos de trazos para la ANIMACION DE ENTRADA. El splash pintara un unico caracter hero (recomendado: 学 'aprender', o 中) trazo a trazo. Para que el splash NO dependa de cargar la libreria hanzi-writer al arranque frio, embebe los paths del caracter directamente.

1. Crea `/src/splash/heroChar.ts` que exporte una constante con la geometria del caracter hero: un array de paths SVG (uno por trazo, en orden de trazos correcto) y el `viewBox`. Tipa con una interfaz `interface HeroChar { char: string; viewBox: string; strokes: string[]; }`. Puedes obtener los paths del dataset publico de hanzi-writer (`hanzi-writer-data`, MIT) en build, copiando los `strokes` del caracter elegido a este archivo (documenta la fuente y la licencia en un comentario).
2. Exporta tambien una funcion `buildHeroSvg(hero: HeroChar): SVGElement` que monte el `<svg>` con un `<path>` por trazo, cada uno en `stroke: var(--ink-900)`, sin animar todavia.

Crea test `/src/splash/heroChar.test.ts` que verifique que `buildHeroSvg` genera un `<svg>` con tantos `<path>` como trazos. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (datos + builder del caracter hero, sin animacion). Espera CI VERDE. JAMAS Claude como co-author.

### B14. Pintado del caracter con stroke-dashoffset

**commit:** `feat(splash): pintado de trazos con stroke-dashoffset (WAAPI)`

Implementa el PINTADO del caracter hero trazo a trazo con `stroke-dashoffset`. Crea `/src/splash/paintCharacter.ts` que exporte `async function paintCharacter(svg: SVGElement): Promise<void>`.

1. Para cada `<path>` de trazo del SVG (generado por `buildHeroSvg`): calcula su longitud con `path.getTotalLength()`, fija `stroke-dasharray` y `stroke-dashoffset` a esa longitud, y anima el `dashoffset` a 0 secuenciando los trazos uno tras otro (cada trazo ~150ms, total ~1.35s para los trazos del caracter), usando la Web Animations API (`path.animate(...)`) con `--ease-ink`.
2. Al terminar cada trazo, deja el `stroke` visible; al terminar TODOS, opcionalmente pasa de `stroke` a `fill` solido (asentamiento de tinta). Resuelve la Promise al completar.
3. Respeta `prefers-reduced-motion` (helper `/src/core/motion.ts`): si esta activo, muestra el caracter ya formado (`opacity 0->1` en 250ms) y resuelve.

Crea test `/src/splash/paintCharacter.test.ts` (jsdom) que mockee `getTotalLength` y `Element.prototype.animate` y verifique que la Promise resuelve y que se llamo a `animate` una vez por trazo (o cero veces si reduce-motion). Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (logica de pintado). Espera CI VERDE. JAMAS Claude como co-author.

### B15. Caida del sello con overshoot

**commit:** `feat(splash): caida del sello con overshoot (WAAPI)`

Implementa la CAIDA DEL SELLO bermellon que cierra el splash. Crea `/src/splash/dropSeal.ts` que exporte `async function dropSeal(container: HTMLElement, hanzi?: string): Promise<void>`.

1. Usa `createSeal` de `/src/ui/components/seal.ts` (caracter por defecto 学 o 中) y montalo en `container`.
2. Anima con Web Animations API (`element.animate([...], { easing, fill })`): de `scale(1.4) opacity .3` a `scale(1) opacity .92` con `cubic-bezier(.34,1.56,.64,1)` (token `--ease-seal`), duracion ~250ms, mas un micro-shake de +-2px al impactar (golpe seco). Resuelve la Promise al terminar.
3. Respeta `prefers-reduced-motion`: aparece ya formado con un fade de 250ms, sin overshoot ni shake.

Crea test `/src/splash/dropSeal.test.ts` (jsdom) que mockee `Element.prototype.animate` (devolviendo un objeto con `finished: Promise.resolve()`) y verifique que `dropSeal` monta un sello y resuelve. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (caida del sello). Espera CI VERDE. JAMAS Claude como co-author.

### B16. Orquestacion del splash

**commit:** `feat(splash): orquestacion de animacion de entrada`

Ensambla la ANIMACION DE ENTRADA completa. Crea `/src/splash/splash.ts` que exporte `async function playSplash(): Promise<void>` siguiendo el storyboard (~2.2s total, saltable al tocar):

1. Crea un overlay a pantalla completa (`position:fixed; inset:0; z-index alto`) con clase `.splash` y fondo `var(--bg)` + textura `.paper`; fade-in 150ms.
2. Monta el SVG hero (`buildHeroSvg(heroChar)`), llama `await paintCharacter(svg)`, luego `await dropSeal(overlay)`, luego disuelve el overlay (`scale(.98)` + fade, 200ms) y eliminalo del DOM.
3. ARRANQUE FRIO unico: usa `sessionStorage.getItem('splashed')`; si ya se vio en esta sesion, ejecuta una version EXPRES (~400ms, solo el sello) o saltalo. Al terminar, `sessionStorage.setItem('splashed','1')`.
4. SALTABLE: un click/tap en el overlay aborta las animaciones pendientes y resuelve de inmediato (limpia el overlay).
5. Respeta `prefers-reduced-motion` (delegado a paintCharacter/dropSeal, que ya lo manejan).

Llama `playSplash()` desde `/src/main.ts` ANTES (o en paralelo controlado) del montaje de la home. Anade estilos `.splash` en `/src/styles/motifs.css` o un `splash.css` dedicado importado por splash.ts.

Crea test `/src/splash/splash.test.ts` que mockee paintCharacter/dropSeal y `sessionStorage` y verifique: (a) primera vez ejecuta el flujo completo, (b) segunda vez en la misma sesion usa la via expres. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (orquestacion del splash). Espera CI VERDE. JAMAS Claude como co-author.

### B17. Wrapper de View Transitions API

**commit:** `feat(ui): transiciones de pagina con View Transitions API`

Crea el helper de TRANSICIONES DE PAGINA con la View Transitions API para la SPA vanilla. Crea `/src/core/navigate.ts` que exporte:

```ts
export function withViewTransition(render: () => void): void;
```

Comportamiento: si `!document.startViewTransition` O `prefersReducedMotion()` (helper de `/src/core/motion.ts`), llama `render()` directo (fallback sin animacion). En otro caso, envuelve con `document.startViewTransition(render)`.

Integra este wrapper en el router casero existente (`/src/router/router.ts`): el montaje/render de cada vista debe pasar por `withViewTransition`. NO cambies la tabla de rutas, solo envuelve el render.

Define en CSS (`/src/styles/animations.css`) el aspecto de la transicion por defecto via los pseudo-elementos `::view-transition-old(root)` y `::view-transition-new(root)`: un cross-fade + leve deslizamiento de la pagina entrante (sube 12px). 

Crea test `/src/core/navigate.test.ts` que: (a) cuando `document.startViewTransition` no existe, verifica que `render` se llama directo; (b) cuando existe (mockeado), verifica que se llama a `startViewTransition` con la funcion render. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (wrapper VT + integracion router). Espera CI VERDE. JAMAS Claude como co-author.

### B18. Morph de hanzi compartido entre vistas

**commit:** `feat(ui): morph de hanzi compartido entre lista y detalle`

Anade el efecto 'el caracter te lleva a su ficha': un MORPH del gran hanzi/titulo compartido entre dos vistas mediante `view-transition-name`.

1. En el render de la lista de vocabulario y en el render del detalle de palabra (modulos `vocab`), asigna al elemento del hanzi principal un `style.viewTransitionName` UNICO y ESTABLE basado en el id del lexema (p.ej. `vt-hanzi-${lexemaId}`). IMPORTANTE: solo UN elemento por nombre puede estar presente a la vez en cada snapshot; asegura que al navegar, el hanzi de origen y el de destino compartan el mismo nombre.
2. Crea un helper en `/src/core/navigate.ts` o `/src/ui/viewTransitionName.ts`: `export function setVTName(el: HTMLElement, name: string): void` que asigne el nombre y, opcionalmente, lo limpie tras la transicion para evitar colisiones.
3. En CSS, define que el grupo con ese nombre haga un morph suave (la VT API lo anima automaticamente; solo ajusta `animation-duration`/`easing` con `--ease-brush` si hace falta via `::view-transition-group(*)`).

Respeta reduce-motion (ya cubierto por `withViewTransition`). Crea test que verifique que `setVTName(el,'vt-hanzi-x')` fija `el.style.viewTransitionName === 'vt-hanzi-x'`. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (morph de hanzi compartido). Espera CI VERDE. JAMAS Claude como co-author.

### B19. Boton de tinta con feedback de presion

**commit:** `feat(ui): boton de tinta con feedback de presion`

Crea el componente de BOTON con estetica de tinta. Crea `/src/ui/components/button.ts` que exporte `createButton(opts: { label: string; variant?: 'primary'|'ghost'; onClick?: () => void }): HTMLButtonElement` y los estilos en `/src/styles/motifs.css` (o `components.css`).

Comportamiento visual:
1. Primario: fondo `var(--accent)`, texto claro; ghost: borde fino y texto `var(--accent)`.
2. Al presionar (`:active`): `transform: scale(.97)` + sombra de tinta que se reduce (el boton 'presiona el papel'), con `--ease-ink`.
3. En el primario, un destello de `var(--accent-soft)` que se expande tipo gota de tinta (radial, usando el keyframe `ink-bloom` ya definido) en un pseudo-elemento al hacer click.
4. Tamano tactil minimo 48x48px. Estado `:focus-visible` con anillo `var(--focus-ring)`.
5. Respeta reduce-motion (el bloque global ya neutraliza; no anadas movimiento extra obligatorio).

Crea test `/src/ui/components/button.test.ts` que verifique que `createButton` devuelve un `<button>` con el label y que `onClick` se dispara al click. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (boton de tinta). Espera CI VERDE. JAMAS Claude como co-author.

### B20. Volteo 3D de tarjeta SRS

**commit:** `feat(ui): volteo 3D de tarjeta SRS`

Implementa la micro-interaccion de VOLTEAR TARJETA SRS (frente hanzi -> reverso glosa). Crea `/src/ui/components/flipCard.ts` que exporte `createFlipCard(opts: { front: HTMLElement; back: HTMLElement }): { el: HTMLElement; flip: () => void; reset: () => void }`.

1. Estructura con `transform-style: preserve-3d`; cara frontal y trasera con `backface-visibility: hidden`.
2. `flip()` aplica `rotateY(180deg)` en 320ms con `--ease-brush`, anadiendo un leve `scale(1.02)` en el ecuador (a mitad de la animacion) para dar 'peso'. Nada de flip mecanico de 90 grados duro.
3. El reverso tiene un leve tinte papel envejecido (`var(--bg-sunken)`) y una marca de agua del caracter (usa `.watermark`).
4. Respeta reduce-motion: con reduce, intercambia caras con un fade corto en lugar de rotacion 3D (consulta `prefersReducedMotion()`).

Anade estilos en `/src/styles/motifs.css`. Crea test `/src/ui/components/flipCard.test.ts` que verifique que `flip()` cambia el estado (p.ej. una clase `is-flipped`) y `reset()` lo revierte. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (volteo de tarjeta). Espera CI VERDE. JAMAS Claude como co-author.

### B21. Popover de glosa emergente

**commit:** `feat(ui): popover de glosa emergente con efecto tinta`

Implementa la micro-interaccion de REVELAR GLOSA EMERGENTE para el modulo de lectura. Crea `/src/ui/components/glossPopover.ts` que exporte `showGloss(opts: { anchor: HTMLElement; pinyin: string; es: string; onAudio?: () => void }): HTMLElement` y `hideGloss(): void`.

1. La palabra en el texto va subrayada con un trazo bermellon fino (`.brush-underline`). La glosa NO aparece sola: solo al TOCAR la palabra (forzar recuperacion primero).
2. Al tocar: un popover sube 6px con `opacity 0->1` + `translateY`, fondo `var(--bg-elevated)`, sombra de tinta suave (`rgb(var(--shadow-ink)/.12)`). Muestra pinyin + español + boton 'escuchar' (llama `onAudio`).
3. La glosa 'se humedece': un brevisimo `filter: blur(2px)->0` en 80ms (tinta absorbiendo). Con reduce-motion: solo fade, sin blur ni translate.
4. Se cierra al tocar fuera o al abrir otra glosa.

Anade estilos en `/src/styles/motifs.css`. Crea test `/src/ui/components/glossPopover.test.ts` (jsdom) que verifique que `showGloss` inserta un nodo con el pinyin y el español, y que `hideGloss` lo elimina. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (popover de glosa). Espera CI VERDE. JAMAS Claude como co-author.

### B22. Feedback de acierto e incorrecto

**commit:** `feat(ui): feedback de acierto (jade) e incorrecto (shake)`

Implementa las micro-interacciones de FEEDBACK de respuesta. Crea `/src/ui/feedback.ts` que exporte `flashCorrect(el: HTMLElement): void` y `flashIncorrect(el: HTMLElement): void`.

1. CORRECTO: un trazo de pincel JADE (`var(--jade)`) que se 'pinta' de izquierda a derecha en el borde de la tarjeta (`clip-path` o `stroke-dashoffset`, 300ms), + un mini-sello jade que cae suave (reutiliza `createSeal({hanzi:'✓'?,variant:'jade'})` o un check). NADA de verde semaforo: jade. Opcionalmente reproduce audio TTS (deja un callback opcional, no acoples la API de audio aqui).
2. INCORRECTO: micro-shake horizontal +-4px (keyframe `ink-shake`, 2 ciclos, 200ms) + flash de `var(--error-soft)` que decae. NO reveles la respuesta aqui (eso es responsabilidad del modulo).
3. Ambos respetan reduce-motion: correcto -> solo cambio de color a jade-soft sin pintado; incorrecto -> sin shake, solo flash de color.

Anade estilos/keyframes necesarios (el `ink-shake` ya existe en animations.css). Crea test `/src/ui/feedback.test.ts` que verifique que `flashCorrect` y `flashIncorrect` anaden/quitan clases o disparan `el.animate` segun el modo. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (feedback acierto/incorrecto). Espera CI VERDE. JAMAS Claude como co-author.

### B23. SVG maestro del icono (hanzi + sello)

**commit:** `feat(ui): SVG maestro del icono (hanzi + sello 印章)`

Crea el SVG MAESTRO del que se generaran favicon y todos los iconos. Crea `/public/icon-master.svg` (1024x1024) con: fondo papel arroz opaco (`#faf6ec`, sin transparencia porque iOS recorta y rellena el alfa), un unico hanzi en tinta (`#1a1a18`) en estilo caligrafico (Ma Shan Zheng convertido a PATHS, no texto, para no depender de la fuente al renderizar el icono), y un pequeno sello bermellon (`#c8492c`) en la esquina inferior derecha. Caracter recomendado: 学 (o 文). Deja margenes de seguridad ~10% para que el caracter no toque bordes.

Crea TAMBIEN `/public/favicon.svg` (version vectorial limpia para navegadores modernos), preferiblemente con el caracter 中 (mas legible a 16px) o el mismo 学, mismo fondo opaco + sello.

Documenta en un comentario como convertir el glifo de la fuente a path (p.ej. con un editor o `fonttools`). Verifica que ambos SVG abren sin errores y que `npm run build` los copia a `dist`.

DISCIPLINA: commit granular (SVG maestro + favicon.svg). Espera CI VERDE. JAMAS Claude como co-author.

### B24. Generador de iconos PNG con sharp

**commit:** `build(ui): generador de iconos PNG/ICO con sharp`

Crea el pipeline que genera TODOS los tamanos de icono desde `/public/icon-master.svg`. Anade `sharp` como devDependency y crea `/scripts/gen-icons.mjs` (Node ESM) que rasterice el SVG maestro a:

- `/public/apple-touch-icon.png` 180x180 (PNG OPACO, sin alfa transparente — iOS rellena con negro si hay transparencia).
- `/public/icons/icon-192.png` 192x192
- `/public/icons/icon-512.png` 512x512
- `/public/icons/maskable-512.png` 512x512 con 20% de safe zone (caracter mas pequeno/centrado para `purpose:maskable`).
- `/public/favicon.ico` 32x32 (+16x16) como fallback legacy (usa `sharp` o documenta `png-to-ico`).

Anade script en package.json: `"icons:gen": "node scripts/gen-icons.mjs"`. Ejecutalo y comprueba que los PNG existen con los tamanos correctos y SIN canal alfa transparente en el apple-touch-icon. Verifica `npm run build`.

DISCIPLINA: commit granular (script + iconos PNG generados). Espera CI VERDE. JAMAS Claude como co-author.

### B25. Meta tags iOS de icono y standalone

**commit:** `feat(pwa): meta tags de icono iOS y modo standalone`

Edita `/index.html` para enlazar TODOS los iconos y habilitar el modo standalone iOS. En el `<head>` anade (rutas que respeten el `base` de GitHub Pages):

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#c8492c" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#16150f" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="练中文">
```

Recuerda: iOS NO usa el manifest para el icono de inicio; estas meta tags son las que importan. Si el `base` no es `/`, ajusta las rutas absolutas en consecuencia (documentalo en comentario). NO toques el manifest aqui (lo gestiona el grupo PWA). Verifica con `npm run build` que el HTML de `dist` conserva las meta tags.

DISCIPLINA: commit granular (meta tags de icono iOS). Espera CI VERDE. JAMAS Claude como co-author.

### B26. Iconos de pestaña con hanzi-ancla

**commit:** `feat(ui): iconos de pestaña con hanzi-ancla y estado activo`

Crea los ICONOS DE LA BARRA DE NAVEGACION inferior, coherentes con la estetica de pincel. Crea `/src/ui/components/tabIcon.ts` que exporte `createTabIcon(opts: { hanzi: string; label: string; active?: boolean }): HTMLElement`.

1. Cada modulo lleva su hanzi-ancla mostrado en `var(--font-hanzi-cal)` (trazo de pincel monolineal, no iconos genericos): 词 vocabulario, 读 lectura, 听 escucha, 写 escritura, 进 progreso. Debajo, label en español en `var(--fs-caption)`.
2. ESTADO ACTIVO (`active:true`): el hanzi se rellena de tinta (`var(--text)`) y aparece un mini-sello/punto bermellon (`var(--accent)`) debajo; transicion `--ease-ink` 200ms. El inactivo va en `var(--text-faint)`.
3. Tamano tactil >=48x48px. Asigna `view-transition-name` a la pestaña activa para el morph entre secciones (coordina con el wrapper VT existente).

Anade estilos `.tabbar`/`.tab` en `/src/styles/motifs.css` (o el CSS del shell): `position:fixed; bottom:0;` con `backdrop-filter: blur(12px) saturate(1.1)` ('papel translucido'), `padding-bottom: var(--safe-bottom)` y borde superior `var(--surface-line)`.

Crea test `/src/ui/components/tabIcon.test.ts` que verifique que `createTabIcon({hanzi:'读',label:'Lectura',active:true})` contiene el hanzi, el label y la clase de activo. Verifica `npm run test` y `npm run build`.

DISCIPLINA: commit granular (iconos de pestaña). Espera CI VERDE. JAMAS Claude como co-author.

## Grupo C

### C1. Capa de persistencia: wrapper de IndexedDB

**commit:** `feat(core): wrapper de persistencia IndexedDB + localStorage`

Implementa la capa de persistencia offline-first de la PWA de chino. Crea `src/core/storage.ts` con un wrapper minimo y tipado sobre IndexedDB usando la libreria `idb-keyval` (instalala: `npm i idb-keyval`). El wrapper debe exponer dos almacenes logicos: (1) un store clave-valor general en IndexedDB para datos voluminosos (tarjetas, estados FSRS, logs de review, progreso de lectura), y (2) helpers para `settings` y `userProfile` que vivan en `localStorage` (pequenos y sincronos al arrancar). API a exportar: `getItem<T>(key: string): Promise<T | undefined>`, `setItem<T>(key: string, value: T): Promise<void>`, `removeItem(key: string): Promise<void>`, `getAllKeys(): Promise<IDBValidKey[]>`, y para localStorage `getLocal<T>(key): T | undefined` y `setLocal<T>(key, value): void` (con `JSON.parse`/`stringify` y try/catch). Usa una constante `DB_NAME` y un store namespaced via `createStore('practicas-chino', 'kv')` de idb-keyval. En `tests/setup.ts` ya debe (o anade) el mock de IndexedDB con `fake-indexeddb` (`npm i -D fake-indexeddb`) importando `'fake-indexeddb/auto'`. Escribe `src/core/storage.test.ts` con Vitest que verifique round-trip set/get, removeItem, getAllKeys, y la rama de error de getLocal cuando el JSON es invalido. No toques DOM. Verifica con `npm run typecheck`, `npm run lint`, `npm run test` y `npm run build` antes de terminar. RECUERDA la disciplina del proyecto: commit GRANULAR (solo este cambio), espera CI VERDE antes de continuar, y JAMAS pongas a Claude como co-author en el commit.

### C2. Store reactivo casero (observable + pub/sub)

**commit:** `feat(core): store reactivo casero con pub/sub y select`

Crea un store reactivo minimo, sin dependencias, en `src/core/store.ts` para gestionar estado de UI de la PWA vanilla. API: una factoria `createStore<T>(initialState: T)` que devuelva `{ get(): T, set(partial: Partial<T> | ((prev: T) => Partial<T>)): void, subscribe(listener: (state: T) => void): () => void }`. `set` hace merge superficial inmutable y notifica a todos los suscriptores; `subscribe` devuelve una funcion de desuscripcion. Anade tambien un helper `select<T, S>(store, selector: (s: T) => S, onChange: (value: S) => void): () => void` que solo dispare `onChange` cuando el valor seleccionado cambie (comparacion `Object.is`). No uses Proxy ni librerias; mantenlo en ~60 lineas. Escribe `src/core/store.test.ts` con Vitest cubriendo: estado inicial, set con objeto, set con funcion updater, notificacion a multiples listeners, desuscripcion que detiene notificaciones, y `select` que no dispara si el valor no cambia. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. RECUERDA: commit GRANULAR, espera CI VERDE, y NUNCA Claude como co-author.

### C3. Sistema i18n en espanol (diccionario de strings)

**commit:** `feat(core): sistema i18n en espanol con interpolacion`

Implementa el sistema de internacionalizacion (todo en espanol, una sola locale por ahora) en `src/core/i18n.ts`. Crea un diccionario plano tipado `const es = { ... } as const` con las claves de UI que la app necesitara: navegacion (vocab, lectura, escucha, escritura, progreso), acciones comunes (continuar, empezar, cerrar, guardar, reintentar), estados (cargando, sinConexion, actualizacionDisponible, actualizar), e instrucciones de instalacion iOS (compartir, anadirAPantalla). Exporta `type StringKey = keyof typeof es` y una funcion `t(key: StringKey, params?: Record<string, string | number>): string` que sustituya placeholders del tipo `{nombre}` en el valor. Maneja claves faltantes devolviendo la propia clave (y `console.warn` en dev via `import.meta.env.DEV`). Escribe `src/core/i18n.test.ts` que verifique: resolucion de una clave existente, interpolacion de params, y fallback al pasar una clave invalida (castea para forzar el caso). Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. RECUERDA: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### C4. Tokens de estilo y base CSS mobile-first

**commit:** `feat(ui): tokens de diseno y base CSS mobile-first`

Crea la base de estilos de la PWA con estetica 水墨 (tinta/papel arroz, acento bermellon, jade, oro en hairlines). Archivos: `src/styles/tokens.css` con las variables CSS de la paleta (modo claro y `@media (prefers-color-scheme: dark)`), tipografia (`--font-hanzi-read`, `--font-hanzi-cal`, `--font-ui`, escala `--fs-*`, `--lh-*`), easings (`--ease-ink`, `--ease-brush`, `--ease-seal`) y duraciones; usa exactamente los tokens del sistema de diseno del proyecto (incluido el fix de oro oscuro `#cdaa6a`). `src/styles/base.css` con reset minimo, `box-sizing: border-box`, `html{height:100%}`, `body{min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-ui)}`, variables de safe-area (`--safe-top`, `--safe-bottom` via `env(safe-area-inset-*)`), `--nav-h:64px`, y el bloque global de `@media (prefers-reduced-motion: reduce)`. Importa ambos en `src/main.ts` (o crea `src/styles/index.css` que los `@import` y se importe una vez). Asegura que `index.html` tenga el meta viewport con `viewport-fit=cover`. No anadas logica todavia. Verifica que `npm run build` compila e incluye el CSS y que `npm run typecheck && npm run lint` pasan. RECUERDA: commit GRANULAR, espera CI VERDE, y NUNCA Claude como co-author.

### C5. Router casero hash-based compatible con GitHub Pages

**commit:** `feat(router): router hash-based con lazy loading de vistas`

Implementa un router minimo casero hash-based (inmune al base path de GitHub Pages) en `src/router/router.ts` y la tabla de rutas en `src/router/routes.ts`. Tipos: `type RouteModule = { mount: (el: HTMLElement) => void; unmount?: () => void }` y `type Route = { path: string; load: () => Promise<RouteModule> }`. El router debe: parsear `location.hash` (formato `#/vocab`), escuchar `hashchange` y `DOMContentLoaded`/`load`, hacer `import()` dinamico del modulo de la ruta (code-splitting), llamar a `unmount()` del modulo anterior antes de montar el nuevo, y montar en un contenedor pasado al inicializar (`initRouter(outlet: HTMLElement, routes: Route[], fallbackPath: string)`). Si no hay match, navega al `fallbackPath` (home). Expon tambien `navigate(path: string)` que setee `location.hash`. En `routes.ts` declara las rutas de los 5 modulos + home apuntando a loaders placeholder (por ahora cada loader devuelve un modulo dummy que escribe el nombre de la seccion en el outlet; los modulos reales llegan en otro grupo). Escribe `src/router/router.test.ts` con Vitest (jsdom) que verifique: parseo de hash, match de ruta, fallback a home con hash desconocido, y que `navigate` cambia el hash. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. RECUERDA: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### C6. App shell: layout grid y montaje del router

**commit:** `feat(ui): app shell con layout grid y outlet del router`

Crea el shell de la aplicacion en `src/app.ts` y conectalo desde `src/main.ts`. `app.ts` exporta `mountApp(root: HTMLElement)` que construye el layout grid mobile-first descrito en el sistema de diseno: un contenedor `.app` con `grid-template-rows: auto 1fr auto; min-height:100svh; padding-top:var(--safe-top)`, una zona `.content` scrollable (`overflow-y:auto`, padding inferior `calc(var(--nav-h) + var(--safe-bottom) + 16px)`, `overscroll-behavior-y:contain`) que sera el outlet del router, y un placeholder `<nav class="tabbar">` (vacio por ahora, se rellena en el siguiente prompt). Anade `src/styles/app.css` con las reglas de `.app` y `.content` (importalo en el index de estilos). En `main.ts`: importa estilos, llama a `mountApp(document.getElementById('app')!)`, e inicializa el router pasandole la zona `.content` como outlet y las rutas de `routes.ts`. Asegurate de que `index.html` tenga `<div id="app"></div>`. Crea `src/app.test.ts` que monte el shell en un contenedor jsdom y verifique que existen `.app`, `.content` y `.tabbar`. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`, y comprueba con `npm run dev` que la home dummy se renderiza. RECUERDA: commit GRANULAR, espera CI VERDE, y NUNCA Claude como co-author.

### C7. Barra de navegacion inferior estilo iOS con safe-area

**commit:** `feat(ui): tabbar inferior estilo iOS con safe-area y estado activo`

Implementa la barra de navegacion inferior (tabbar) estilo iOS en `src/ui/components/tabbar.ts` y `src/styles/tabbar.css`. `tabbar.ts` exporta `createTabbar(): HTMLElement` que genera un `<nav class="tabbar">` con 5 destinos (Vocabulario 词 -> #/vocab, Lectura 读 -> #/lectura, Escucha 听 -> #/escucha, Escritura 写 -> #/escritura, Progreso 进 -> #/progreso). Cada item: un boton/enlace con el hanzi-ancla en `--font-hanzi-cal` + label en espanol (`--fs-caption`, usando `t()` de i18n), area tactil >=48x48px. El CSS: `position:fixed; inset-inline:0; bottom:0; height:calc(var(--nav-h)+var(--safe-bottom)); padding-bottom:var(--safe-bottom); display:grid; grid-auto-flow:column; grid-auto-columns:1fr; backdrop-filter:blur(12px) saturate(1.1); border-top:1px solid var(--surface-line)`. Resalta el item activo segun `location.hash` (clase `.is-active`, relleno tinta + trazo/punto bermellon debajo) y actualizalo en `hashchange`. Integra `createTabbar()` en `app.ts` reemplazando el placeholder de tabbar. Escribe `src/ui/components/tabbar.test.ts` que verifique: se renderizan 5 items, el item cuyo hash coincide recibe `.is-active`, y al cambiar `location.hash` se actualiza el activo. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. RECUERDA: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### C8. Transiciones de pagina con View Transitions API

**commit:** `feat(router): transiciones de vista con View Transitions API`

Anade transiciones suaves entre vistas usando la View Transitions API, con fallback. Crea `src/router/transition.ts` que exporte `withViewTransition(render: () => void): void`: si `document.startViewTransition` no existe o `matchMedia('(prefers-reduced-motion: reduce)').matches`, ejecuta `render()` directamente; en otro caso lo envuelve en `document.startViewTransition(render)`. Integra esto en el router (`router.ts`): el (des)montaje de vistas al navegar debe pasar por `withViewTransition`. Anade en `src/styles/animations.css` un cross-fade + leve deslizamiento (la vista entrante sube ~12px) para `::view-transition-old(root)` / `::view-transition-new(root)`, respetando `prefers-reduced-motion` (sin animacion). Importa `animations.css` en el index de estilos. Escribe `src/router/transition.test.ts` que verifique: cuando `startViewTransition` no esta definido, `render` se llama igualmente (mockea ausencia y presencia de la API y reduce-motion via mock de matchMedia). Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. RECUERDA: commit GRANULAR, espera CI VERDE, y NUNCA Claude como co-author.

### C9. Perfil de usuario y settings persistidos

**commit:** `feat(core): perfil de usuario y settings con racha diaria`

Crea la capa de modelo de usuario sobre la persistencia. En `src/core/profile.ts` define e implementa el acceso a `PerfilUsuario` (creado, diagnosticoHecho, rachaDias, ultimoDiaActivo, totalReviews, sellosGanados) y `Settings` (requestRetention default 0.90, maxNuevasPorDia 10, ttsRate 0.9, mostrarPinyinSiempre true, voz 'zh-CN', fsrsParams opcional) usando los tipos del modelo de datos del proyecto (coloca las interfaces en `src/types/user.ts` si no existen aun). API: `loadProfile(): PerfilUsuario` y `loadSettings(): Settings` que lean de localStorage via el wrapper `storage.ts` aplicando defaults cuando no existan; `saveProfile(p)` y `saveSettings(s)` que persistan; y `updateStreak(today: string)` que recalcule `rachaDias` (incrementa si el dia es consecutivo a `ultimoDiaActivo`, resetea a 1 si hubo hueco, no cambia si es el mismo dia). Escribe `src/core/profile.test.ts` cubriendo defaults en primer arranque, persistencia round-trip, y los tres casos de `updateStreak` (mismo dia / consecutivo / con hueco). Usa el mock de localStorage/IndexedDB ya presente en `tests/setup.ts`. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. RECUERDA: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### C10. Pantalla de inicio / dashboard

**commit:** `feat(home): dashboard de inicio con racha y CTA dinamico`

Implementa la vista home (dashboard) en `src/modules/home/home.view.ts` (+ `home.css`) y conectala en `routes.ts` como ruta `#/` (fallback). `mount(el)` debe renderizar: un saludo/identidad con un hanzi hero, un resumen del estado del usuario leyendo `loadProfile()`/`loadSettings()` de `core/profile.ts` (racha de dias con icono de sello/estrella dorada, total de reviews), una llamada a la accion principal: si `diagnosticoHecho === false` muestra boton 'Empezar diagnostico' (-> #/diagnostico, placeholder por ahora), si ya esta hecho muestra 'Continuar reactivacion' (-> #/vocab); y accesos rapidos a los modulos. Usa `t()` de i18n para todos los textos y los tokens de estilo (marca de agua de un hanzi gigante a baja opacidad como en el sistema de diseno). Aprovecha el store reactivo (`core/store.ts`) para reflejar la racha. Implementa `unmount()` limpiando suscripciones. Escribe `src/modules/home/home.logic.ts` con la logica pura del CTA (`decideCta(profile): 'diagnostico' | 'reactivacion'`) y su test `home.logic.test.ts`. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`, y revisa con `npm run dev`. RECUERDA: commit GRANULAR, espera CI VERDE, y NUNCA Claude como co-author.

### C11. PWA: vite-plugin-pwa, manifest e iconos iOS

**commit:** `feat(pwa): manifest, iconos iOS y service worker con vite-plugin-pwa`

Configura la PWA instalable. Instala `vite-plugin-pwa` (`npm i -D vite-plugin-pwa`) y configuralo en `vite.config.ts` en modo `generateSW` con `registerType: 'prompt'`. Define `base: '/practicas-de-chino/'` (nombre exacto del repo) si no esta puesto ya. Manifest: name 'Practicas de Chino', short_name '中文', lang 'es', `start_url: '.'`, `scope: '.'`, `display: 'standalone'`, background_color '#f6efe1', theme_color '#c8492c', e iconos 192/512/maskable-512 (crea placeholders PNG en `public/icons/` si aun no existen, mas `public/apple-touch-icon.png` 180x180 opaco). Workbox: `globPatterns: ['**/*.{js,css,html,woff2,svg,png,json}']`, `cleanupOutdatedCaches:true`, `navigateFallback:'index.html'`. En `index.html` anade los meta/link iOS: `apple-touch-icon`, `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style=black-translucent`, `apple-mobile-web-app-title`, y `theme-color` claro/oscuro. Anade `'vite-plugin-pwa/client'` a `types` en tsconfig si falta. Verifica que `npm run build` genera `sw.js`/`manifest.webmanifest` en `dist`, y que `npm run typecheck && npm run lint` pasan. RECUERDA: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### C12. Registro del SW y aviso de actualizacion

**commit:** `feat(pwa): registro de SW con toast de actualizacion y offline-ready`

Implementa el registro del service worker y el aviso de nueva version. Crea `src/pwa/register-sw.ts` que use `registerSW` de `virtual:pwa-register` (de vite-plugin-pwa) con callbacks `onNeedRefresh` y `onOfflineReady`. `onNeedRefresh` debe mostrar un toast/banner con estetica china (texto via `t('actualizacionDisponible')` y boton `t('actualizar')`) que al pulsar llame a `updateSW(true)` para recargar; `onOfflineReady` muestra un toast breve `t('listoOffline')`. Crea un componente toast reutilizable `src/ui/components/toast.ts` (+ css) con `showToast({ message, actionLabel?, onAction?, duration? })` que aparezca desde abajo respetando `--safe-bottom` y `--ease-brush`. Llama a `registerServiceWorker()` desde `main.ts` (solo en produccion: protege con `if (import.meta.env.PROD)` o que el virtual sea no-op en dev). Anade las claves i18n necesarias. Escribe `src/ui/components/toast.test.ts` (jsdom) verificando que el toast se inserta, dispara `onAction` al pulsar y se elimina tras la duracion. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. RECUERDA: commit GRANULAR, espera CI VERDE, y NUNCA Claude como co-author.

### C13. Prompt de instalacion PWA (Android + instrucciones iOS)

**commit:** `feat(pwa): prompt de instalacion con sheet e instrucciones iOS`

Implementa el flujo de instalacion 'Anadir a pantalla de inicio'. Crea `src/pwa/install.ts` que: (1) capture el evento `beforeinstallprompt` (Android/desktop) guardandolo y previniendo el banner por defecto, exponiendo `promptInstall(): Promise<void>` que llame a `prompt()` del evento diferido; (2) detecte iOS Safari (sin `beforeinstallprompt`) mediante user agent + `!('standalone' in navigator) || !navigator.standalone`, y en ese caso exponga un flag `needsManualIosInstall(): boolean`; (3) detecte si ya esta en modo standalone (`window.matchMedia('(display-mode: standalone)').matches` o `navigator.standalone`) para no mostrar nada. Crea una hoja modal `src/ui/components/install-sheet.ts` (+ css, sheet que sube desde abajo, esquinas redondeadas arriba, cierre por backdrop) que muestre: en Android un boton 'Instalar' (-> promptInstall), en iOS las instrucciones ilustradas (icono Compartir -> 'Anadir a pantalla de inicio') usando claves i18n. Anade un disparador discreto en el dashboard (home) que abra la sheet solo si la app no esta instalada. Escribe tests `src/pwa/install.test.ts` para la deteccion (mockea userAgent y matchMedia): standalone -> no mostrar, iOS -> manual, Android con evento -> promptInstall resuelve. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. RECUERDA: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### C14. Estado offline / online global

**commit:** `feat(core): deteccion de estado offline con banner reactivo`

Anade deteccion y feedback de estado de conexion. Crea `src/core/network.ts` que exponga `isOnline(): boolean` (lee `navigator.onLine`), un store reactivo (reutilizando `core/store.ts`) `networkStore` con `{ online: boolean }`, y `initNetworkWatch()` que escuche los eventos `window` `online`/`offline` y actualice el store. En la UI, integra en `app.ts`: cuando se pase a offline, muestra un banner/chip discreto fijo (estetica papel, no alarmante) con `t('sinConexion')` que desaparezca al volver online; reutiliza el componente toast o crea `src/ui/components/offline-banner.ts`. Asegura que el banner respeta `--safe-top` y no tapa la tabbar. Llama a `initNetworkWatch()` desde `main.ts`. Escribe `src/core/network.test.ts` que dispare eventos `online`/`offline` (via `window.dispatchEvent(new Event(...))`) y verifique que el store reactivo se actualiza y notifica a los suscriptores. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. RECUERDA: commit GRANULAR, espera CI VERDE, y NUNCA Claude como co-author.

### C15. Export/import de datos (backup contra eviction de iOS)

**commit:** `feat(core): export/import de datos para backup offline`

Implementa backup/restauracion de datos del usuario para mitigar la eviction de IndexedDB de Safari iOS (ITP ~7 dias). Crea `src/core/backup.ts` con `exportData(): Promise<string>` que recopile todas las claves relevantes de IndexedDB (via `storage.getAllKeys()`/`getItem`) mas `profile` y `settings` de localStorage, y devuelva un JSON serializado con un campo `schemaVersion` y `exportedAt`. `importData(json: string): Promise<void>` que valide el JSON, compruebe `schemaVersion`, y restaure cada clave a su almacen correspondiente (rechazando con error claro si el formato es invalido). Anade `downloadBackup()` que genere un `Blob` y dispare la descarga de un archivo `practicas-chino-backup-YYYYMMDD.json`, y `pickAndImport(file: File)` para leer un archivo seleccionado. Expon estos accesos desde una seccion de Ajustes minima (puede vivir en el dashboard por ahora) con botones 'Exportar copia' / 'Importar copia' usando i18n. Escribe `src/core/backup.test.ts`: round-trip export->import preservando datos, rechazo de JSON invalido, y rechazo de schemaVersion incompatible. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. RECUERDA: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### C16. Pulido de accesibilidad y navegacion del shell

**commit:** `feat(ui): accesibilidad del shell, skip link y vista 404`

Pule la accesibilidad y robustez del shell de navegacion ya construido. Cambios: (1) en la tabbar (`src/ui/components/tabbar.ts`/css) anade roles/ARIA correctos (`role="navigation"`, `aria-label`, `aria-current="page"` en el item activo), foco visible con `:focus-visible` usando `--focus-ring`, y asegura objetivos tactiles >=48px; (2) en `app.ts` anade un enlace 'saltar al contenido' (skip link) oculto hasta foco y un `<main id="contenido" tabindex="-1">` como `.content`, moviendo el foco al cambiar de ruta para lectores de pantalla; (3) anade un manejador global de ruta no encontrada que muestre una vista 404 sobria (`src/modules/notfound/notfound.view.ts`) en lugar de pantalla vacia, registrada en `routes.ts`; (4) verifica contraste AA de los tokens usados en navegacion. Crea/extiende tests: `tabbar.test.ts` comprueba `aria-current` en el activo; un test del shell comprueba presencia del skip link y del `<main>` con tabindex. Verifica `npm run typecheck && npm run lint && npm run test && npm run build`. Si el proyecto ya tiene Lighthouse CI, asegura que accesibilidad sigue >=0.9. RECUERDA: commit GRANULAR, espera CI VERDE, y NUNCA Claude como co-author.

## Grupo D

### D1. Tipos del dominio de vocabulario y SRS

**commit:** `feat(vocab): tipos del dominio de vocabulario y SRS`

Crea el archivo `src/types/vocab.ts` con los tipos TypeScript del dominio de vocabulario y SRS de la PWA de chino (Vite + TS vanilla, sin React). Define exactamente: `type Habilidad = 'lectura' | 'escucha' | 'vocab_activo' | 'tonos';`, `type TipoTarjeta = 'recognition' | 'production' | 'listening' | 'tone' | 'dictation' | 'writing';`, `type GradoFsrs = 1 | 2 | 3 | 4;` (Again|Hard|Good|Easy), y las interfaces `LexemaSemilla` (id, hanzi, pinyin, es, hsk: 3|4|5|6|7, esChengyu: boolean, trazos?: number, ejemplo?: {hanzi; pinyin?; es}, tags: string[], dificultad: number), `EstadoFsrs` (due:number, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state: 0|1|2|3, last_review?:number) reflejando el Card de ts-fsrs, `TarjetaUsuario` (id: `${lexemaId}:${tipo}`, lexemaId, tipo: TipoTarjeta, origen: 'nuevo'|'reactivacion', fsrs: EstadoFsrs, desbloqueada: boolean, fallosEscritura?: number, suspendida?: boolean), y `LogReview` (id, tarjetaId, fecha, grado: GradoFsrs, latenciaMs, estadoPrevio: EstadoFsrs). Exporta todo con `export`. Respeta el tsconfig estricto del proyecto (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` -> usa `export type` donde corresponda). No toques ningun otro archivo. Verifica con `npm run typecheck` que compila sin errores. Recuerda la disciplina del proyecto: este debe ser un commit GRANULAR (solo este archivo de tipos), espera a que CI este VERDE antes de seguir, y JAMAS pongas a Claude como co-author en el commit.

### D2. Tipos de contenido de lectura y diagnostico

**commit:** `feat(vocab): tipos de contenido de lectura y diagnostico`

Crea el archivo `src/types/contenido.ts` con los tipos de contenido estatico que viven en el bundle. Define e exporta: `TextoLectura` (id, titulo, nivel: 'intermedio'|'intermedio-alto'|'avanzado', cuerpo: string, glosaEs: string, glosas: Array<{hanzi; pinyin; es}>, preguntas: Array<{enunciado; opciones: string[]; correcta: number; explicacion: string}>, lexemasRelacionados: string[]), `ItemDiagnostico` (id, tipo: TipoTarjeta, habilidad: Habilidad, dificultad: number 3..7, lexemaId?: string, prompt: string, opciones?: string[], correcta: number|string), y `ResultadoDiagnostico` (fecha:number, itemsRespondidos: Array<{itemId; correcto:boolean; latenciaMs:number; dificultad:number}>, nivelEstimadoHsk:number, perfilHabilidades: Record<Habilidad, number>, gapProduccion: string[]). Importa `Habilidad` y `TipoTarjeta` desde `./vocab` usando `import type`. Respeta el tsconfig estricto y `verbatimModuleSyntax`. No modifiques otros archivos. Verifica con `npm run typecheck`. Recuerda: commit GRANULAR (solo este archivo), espera CI VERDE antes de continuar, y JAMAS pongas a Claude como co-author.

### D3. Contenido semilla: 26 palabras HSK5-6

**commit:** `feat(vocab): contenido semilla 26 palabras HSK5-6`

Crea el archivo `src/modules/vocab/data/lexemas.ts` que exporte `export const LEXEMAS: LexemaSemilla[]` (importa el tipo con `import type { LexemaSemilla } from '../../../types/vocab';`) con las 26 palabras HSK5-6 siguientes, cada una con id en formato `w_<pinyin sin tono>` (ej. `w_jingji`), hanzi, pinyin con marcas tonales, es, hsk, esChengyu:false, dificultad = hsk (asi 5 o 6), y tags tematicos coherentes (economia/sociedad/neijuan donde aplique). Las palabras: 经济 jīngjì economía (5), 趋势 qūshì tendencia (5), 效率 xiàolǜ eficiencia (5), 焦虑 jiāolǜ ansiedad (6), 培养 péiyǎng cultivar/formar (5), 平衡 pínghéng equilibrio (5), 资源 zīyuán recurso (5), 现象 xiànxiàng fenómeno (5), 观念 guānniàn concepto/mentalidad (5), 责任 zérèn responsabilidad (5), 缺乏 quēfá carecer de/falta (5), 承担 chéngdān asumir responsabilidad (6), 矛盾 máodùn contradicción/conflicto (5), 妥协 tuǒxié ceder/transigir (6), 谨慎 jǐnshèn prudente/cauteloso (6), 显著 xiǎnzhù notable/significativo (6), 局限 júxiàn limitación (6), 倾向 qīngxiàng inclinación/tendencia (6), 衡量 héngliáng sopesar/evaluar (6), 剥削 bōxuē explotación (6), 渴望 kěwàng anhelar (6), 沉默 chénmò silencio/callar (5), 庞大 pángdà enorme/colosal (6), 凝聚 níngjù aglutinar/cohesionar (6), 严峻 yánjùn severo/crítico (6), 潜力 qiánlì potencial (5). Añade un `ejemplo` breve (hanzi + es) al menos a 10 de ellas usando frases naturales. Verifica con `npm run typecheck`. Recuerda: commit GRANULAR (solo este archivo de datos), espera CI VERDE, y JAMAS Claude como co-author.

### D4. Contenido semilla: 18 chengyu

**commit:** `feat(vocab): contenido semilla 18 chengyu`

Crea el archivo `src/modules/vocab/data/chengyu.ts` que exporte `export const CHENGYU: LexemaSemilla[]` (con `import type { LexemaSemilla }`) con los 18 chengyu siguientes: id `c_<pinyin sin tonos ni espacios>`, hanzi, pinyin con tonos, es (glosa en español), hsk:7, esChengyu:true, dificultad:7, tags relevantes, y `ejemplo` (hanzi + es) en TODOS. Los chengyu: 画蛇添足 (huà shé tiān zú) arruinar algo por exceso — 你已经解释清楚了，再补充就是画蛇添足。; 入乡随俗 (rù xiāng suí sú) donde fueres haz lo que vieres — 到了中国就要入乡随俗，学着用筷子吧。; 一举两得 (yī jǔ liǎng dé) matar dos pájaros de un tiro — 骑车上班既省钱又锻炼身体，真是一举两得。; 半途而废 (bàn tú ér fèi) abandonar a mitad de camino — 学语言最忌半途而废，要坚持下去。; 入木三分 (rù mù sān fēn) penetrante/certero — 他对社会问题的分析入木三分。; 名副其实 (míng fù qí shí) hacer honor a su nombre — 她是名副其实的专家，大家都信服。; 不可思议 (bù kě sī yì) inconcebible/increíble — 短短几年变化这么大，简直不可思议。; 守株待兔 (shǒu zhū dài tù) confiar en la suerte sin esfuerzo — 不努力只想中奖，无异于守株待兔。; 对牛弹琴 (duì niú tán qín) hablar a quien no entiende — 跟他讲艺术简直是对牛弹琴。; 画龙点睛 (huà lóng diǎn jīng) el toque maestro — 这句结尾真是画龙点睛，全文都活了。; 自相矛盾 (zì xiāng máo dùn) contradecirse a sí mismo — 他的说法前后自相矛盾，让人难以相信。; 杞人忧天 (qǐ rén yōu tiān) preocuparse sin motivo — 别杞人忧天了，事情没你想的那么糟。; 塞翁失马 (sài wēng shī mǎ) no hay mal que por bien no venga — 失业后他创了业，真是塞翁失马，焉知非福。; 井底之蛙 (jǐng dǐ zhī wā) visión estrecha — 不出去看看世界，就会变成井底之蛙。; 锦上添花 (jǐn shàng tiān huā) mejorar lo que ya es bueno — 有了你的帮助，真是锦上添花。; 雪中送炭 (xuě zhōng sòng tàn) ayudar en el momento crítico — 我最困难时是他雪中送炭，永远感激。; 络绎不绝 (luò yì bù jué) flujo continuo — 展览期间，参观的人络绎不绝。; 一丝不苟 (yī sī bù gǒu) meticuloso — 他工作一丝不苟，从不出错。. Verifica con `npm run typecheck`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D5. Indice de contenido semilla y test de integridad

**commit:** `test(vocab): indice de contenido semilla con tests de integridad`

Crea `src/modules/vocab/data/index.ts` que reexporte `LEXEMAS` y `CHENGYU` y exporte `export const TODOS_LEXEMAS: LexemaSemilla[] = [...LEXEMAS, ...CHENGYU];` y un helper `export function getLexema(id: string): LexemaSemilla | undefined`. Crea ademas el test `src/modules/vocab/data/data.test.ts` (Vitest) que verifique: (1) no hay ids duplicados en `TODOS_LEXEMAS`, (2) todos los ids siguen el patron `^[cw]_[a-z]+$`, (3) cada lexema tiene hanzi, pinyin y es no vacios, (4) todo chengyu tiene `esChengyu===true && hsk===7 && ejemplo` definido, (5) `dificultad` esta en rango 3..7, (6) `getLexema('w_jingji')?.hanzi === '经济'`. Usa `import { describe, it, expect } from 'vitest'` (o globals si el setup los activa). Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR (indice + su test), espera CI VERDE, y JAMAS Claude como co-author.

### D6. Instalar ts-fsrs y wrapper del motor FSRS

**commit:** `feat(srs): motor FSRS con ts-fsrs y wrapper de estado`

Instala la dependencia `ts-fsrs` (`npm install ts-fsrs`) — es FSRS-6 en TypeScript puro, MIT, offline. Crea `src/core/srs/fsrs.ts` que envuelva ts-fsrs y exponga una API estable e independiente de la libreria: `export function crearScheduler(opts?: { requestRetention?: number; maximumInterval?: number; enableFuzz?: boolean; w?: number[] })` que devuelva una instancia de FSRS configurada con defaults `requestRetention: 0.90, maximumInterval: 365, enableFuzz: true`; `export function nuevoEstadoFsrs(ahora?: number): EstadoFsrs` que cree un Card nuevo (estado New) mapeado a nuestro tipo `EstadoFsrs`; y `export function calificar(estado: EstadoFsrs, grado: GradoFsrs, ahora: number, scheduler?): { estado: EstadoFsrs; logRevisionInfo: ... }` que aplique la review usando `scheduler.repeat`/`next` de ts-fsrs y devuelva el nuevo `EstadoFsrs` (due, stability, difficulty, etc.). Mapea nuestro `GradoFsrs` (1..4) a `Rating` de ts-fsrs (Again/Hard/Good/Easy) con un helper interno. Importa `import type { EstadoFsrs, GradoFsrs } from '../../types/vocab';`. Asegura que las conversiones de fecha (ts-fsrs usa Date) se conviertan a/desde timestamps ms en nuestro modelo. Verifica con `npm run typecheck && npm run build` que compila y empaqueta. Recuerda: commit GRANULAR (package.json/lock + fsrs.ts), espera CI VERDE, y JAMAS Claude como co-author.

### D7. Tests del motor FSRS

**commit:** `test(srs): tests del motor FSRS`

Crea `src/core/srs/fsrs.test.ts` (Vitest) que pruebe el wrapper de `src/core/srs/fsrs.ts` sin depender de la implementacion interna de ts-fsrs: (1) `nuevoEstadoFsrs()` devuelve estado con `state===0` (New), `reps===0`, `lapses===0` y `due` un timestamp valido; (2) tras `calificar(estado, 3 /*Good*/, ahora)` la `stability` aumenta y `due` queda en el futuro respecto a `ahora`; (3) `calificar(..., 1 /*Again*/)` sobre una tarjeta en review incrementa `lapses` o reduce el intervalo respecto a Good; (4) `calificar(..., 4 /*Easy*/)` produce un `due` mas lejano que Good para el mismo estado de partida; (5) con `requestRetention` mas alto los intervalos son mas cortos (compara dos schedulers con 0.95 vs 0.85 sobre el mismo estado). Usa un `ahora` fijo (ej. `Date.UTC(2026,0,1)`) para reproducibilidad. Verifica con `npm run test`. Recuerda: commit GRANULAR (solo el test), espera CI VERDE, y JAMAS Claude como co-author.

### D8. Capa de almacenamiento IndexedDB para SRS

**commit:** `feat(core): wrapper IndexedDB para tarjetas y reviews`

Crea `src/core/storage.ts`, un wrapper minimo de IndexedDB (sin librerias pesadas; usa la API nativa con Promises envueltas, ~80-120 lineas) con una base de datos `chino-srs` versionada (`DB_VERSION` exportada). Crea los object stores: `tarjetas` (keyPath 'id'), `reviews` (keyPath 'id', con indice por `tarjetaId` y por `fecha`). Expone funciones tipadas: `getTarjeta(id)`, `putTarjeta(t: TarjetaUsuario)`, `getTodasTarjetas(): Promise<TarjetaUsuario[]>`, `bulkPutTarjetas(ts: TarjetaUsuario[])`, `addReview(r: LogReview)`, `getReviews(): Promise<LogReview[]>`, y `borrarTodo()` para tests/import. Maneja `onupgradeneeded` creando stores e indices solo si no existen (idempotente para futuras migraciones). Usa `import type { TarjetaUsuario, LogReview } from '../types/vocab';`. NO uses `localStorage` aqui (eso sera settings, otro archivo). Verifica con `npm run typecheck && npm run build`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D9. Tests de la capa de almacenamiento con fake-indexeddb

**commit:** `test(core): tests de IndexedDB con fake-indexeddb`

Instala `fake-indexeddb` como devDependency (`npm install -D fake-indexeddb`). Edita `tests/setup.ts` (creándolo si no existe; si lo creas, registralo en `setupFiles` de la config de Vitest en `vite.config.ts`) para importar `import 'fake-indexeddb/auto';` de modo que `indexedDB` exista en jsdom. Crea `src/core/storage.test.ts` que pruebe `src/core/storage.ts`: (1) `putTarjeta` + `getTarjeta` round-trip devuelve la misma tarjeta; (2) `getTodasTarjetas` devuelve todas las insertadas; (3) `bulkPutTarjetas` inserta varias y son recuperables; (4) `addReview` + `getReviews` round-trip; (5) `borrarTodo` deja ambos stores vacios. Usa `beforeEach(borrarTodo)` para aislar tests. Verifica con `npm run test`. Recuerda: commit GRANULAR (setup + test + config si aplica), espera CI VERDE, y JAMAS Claude como co-author.

### D10. Settings en localStorage

**commit:** `feat(core): settings persistidos en localStorage`

Crea `src/core/settings.ts` que gestione la interfaz `Settings` (defínela aqui o en `src/types/vocab.ts`; si la defines aqui, expórtala): `requestRetention: number` (default 0.90), `maxNuevasPorDia: number` (default 10), `ttsRate: number` (default 0.9), `mostrarPinyinSiempre: boolean` (default true), `voz: string` (default 'zh-CN'), `fsrsParams?: number[]`. Persiste en `localStorage` bajo la clave `chino-settings`. Expone `getSettings(): Settings` (con merge de defaults si faltan campos o no hay nada guardado), `saveSettings(parcial: Partial<Settings>): Settings` (merge + persist + devuelve el resultado), y `DEFAULT_SETTINGS`. Maneja el caso de JSON corrupto devolviendo defaults sin lanzar. Crea tambien `src/core/settings.test.ts` que pruebe: defaults cuando no hay nada, persistencia tras `saveSettings`, merge parcial (cambiar solo `maxNuevasPorDia` conserva el resto), y recuperacion ante JSON invalido. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D11. Generacion de tarjetas desde lexemas

**commit:** `feat(srs): generador de tarjetas desde lexemas`

Crea `src/core/srs/generador.ts` con la logica pura (sin DOM) que convierte lexemas en tarjetas de usuario. Expone: `idTarjeta(lexemaId: string, tipo: TipoTarjeta): string` que devuelve `${lexemaId}:${tipo}`; `crearTarjeta(lexema: LexemaSemilla, tipo: TipoTarjeta, origen: 'nuevo'|'reactivacion', ahora: number): TarjetaUsuario` usando `nuevoEstadoFsrs` de `./fsrs`, con `desbloqueada` = true para `recognition` y, si origen es 'reactivacion', tambien para `production` (la traza ya existe); el resto de tipos arrancan `desbloqueada:false`; `generarTarjetasIniciales(lexema, origen, ahora): TarjetaUsuario[]` que para origen 'nuevo' genera solo `recognition`, y para 'reactivacion' genera `recognition` + `production` juntas. Importa tipos con `import type`. Crea `src/core/srs/generador.test.ts` que verifique: id correcto, que 'nuevo' produce 1 tarjeta recognition desbloqueada, que 'reactivacion' produce recognition+production ambas desbloqueadas, y que cada tarjeta tiene `lexemaId` y estado FSRS New. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D12. Siembra de stability alta para reactivacion

**commit:** `feat(srs): siembra de stability alta y penalizacion suave en reactivacion`

Edita `src/core/srs/generador.ts` añadiendo `export function sembrarReactivacion(tarjeta: TarjetaUsuario, latenciaMs: number, ahora: number): TarjetaUsuario` que, para tarjetas con `origen==='reactivacion'` acertadas en el diagnostico, inyecte una `stability` inicial ELEVADA en su `EstadoFsrs` saltando el valle del reaprendizaje (efecto savings): si latencia < 2000ms -> stability ~7 dias, 2000-4000ms -> ~5 dias, >4000ms -> ~3 dias; ajusta `due = ahora + stability*86400000`, `state = 2` (Review), `reps = 1`, `last_review = ahora`, `difficulty` moderada (~5 en la escala 1..10, no maxima). Añade tambien `export function penalizacionSuaveReactivacion(estado: EstadoFsrs): EstadoFsrs` que, al fallar una de reactivacion, la lleve a intervalo corto (1 dia) pero SIN degradar difficulty a maxima (mantenla moderada). Añade tests en `generador.test.ts`: stability sembrada decreciente segun latencia, due en el futuro, y que la penalizacion suave deja un intervalo de ~1 dia con difficulty < 7. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D13. Scheduler: cola de repaso priorizada

**commit:** `feat(srs): scheduler con cola de repaso priorizada e interleaving`

Crea `src/core/srs/scheduler.ts` con la logica pura de construccion de la cola diaria de repaso (sin DOM). Expone `construirCola(tarjetas: TarjetaUsuario[], ahora: number, opts: { maxNuevas: number }): TarjetaUsuario[]` que ordene segun la prioridad pedagogica del proyecto: (1) vencidas de reactivacion fragiles (origen 'reactivacion', due<=ahora) primero, (2) vencidas normales del SRS (due<=ahora), (3) tarjetas de produccion ya desbloqueadas vencidas, (4) material nuevo (state===0) capado a `maxNuevas` (default 10-20%). Excluye `suspendida===true` y tarjetas `desbloqueada===false`. Implementa tambien `cardsVencidas(tarjetas, ahora)` y `cardsNuevas(tarjetas)` como helpers exportados. Aplica interleaving: no devuelvas mas de 3 tarjetas seguidas del mismo `tipo` (reordena suavemente). Crea `src/core/srs/scheduler.test.ts` con tests deterministas: cola respeta orden de prioridad, capa nuevas a maxNuevas, excluye suspendidas y bloqueadas, y el interleaving evita 4+ del mismo tipo seguidas. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D14. Audio TTS con Web Speech API

**commit:** `feat(core): audio TTS zh-CN con Web Speech API`

Crea `src/core/audio.ts` que envuelva la Web Speech API (sintesis) para pronunciar chino, gratis y offline en iOS (voz zh-CN, Ting-Ting en iPhone). Expone: `hablar(texto: string, opts?: { rate?: number; voz?: string }): Promise<void>` que cree un `SpeechSynthesisUtterance` con `lang='zh-CN'`, seleccione la mejor voz zh-CN disponible (prefiriendo una que contenga 'Ting' o lang 'zh-CN') de `speechSynthesis.getVoices()`, aplique `rate` (default desde settings 0.9) y resuelva la promesa en `onend`/`onerror`; `vozDisponible(): boolean`; y `cargarVoces(): Promise<SpeechSynthesisVoice[]>` que maneje el caso de que `getVoices()` venga vacio inicialmente (escuchar `voiceschanged` una vez). Cancela cualquier utterance previa antes de hablar. Maneja el entorno de test/SSR donde `speechSynthesis` no existe (no lanzar; resolver vacio). Crea `src/core/audio.test.ts` que mockee `window.speechSynthesis` y `SpeechSynthesisUtterance` en `tests/setup.ts` (o en el propio test) y verifique: `hablar` invoca `speechSynthesis.speak`, aplica el rate, y resuelve al disparar `onend`. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D15. Generador de opciones (distractores) para tarjetas

**commit:** `feat(srs): generador de distractores para opcion multiple`

Crea `src/core/srs/distractores.ts` con logica pura para generar opciones de respuesta multiple. Expone `generarDistractores(correcto: LexemaSemilla, pool: LexemaSemilla[], opts: { n: number; modo: 'recognition'|'production'|'listening'; dificultad: 'facil'|'dificil' }): LexemaSemilla[]` que devuelva `n-1` distractores + el correcto, barajados. Para `dificil`: prioriza distractores del mismo campo semantico (tags compartidos) o, en modo production, hanzi visualmente similares (misma longitud de hanzi, comparte algun caracter); para `facil`: semanticamente lejanos (sin tags compartidos). Garantiza que nunca repite el correcto ni duplica distractores, y que rellena con aleatorios si no hay suficientes del tipo deseado. Acepta una funcion `rng: () => number` opcional (default Math.random) para tests deterministas. Crea `src/core/srs/distractores.test.ts`: el array resultante tiene tamaño n e incluye el correcto, no hay duplicados, modo dificil prefiere tags compartidos cuando existen, y con rng fijo el resultado es reproducible. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D16. Estilos de tarjeta SRS (estetica tinta)

**commit:** `style(vocab): estilos de tarjeta SRS con volteo y estetica tinta`

Crea `src/modules/vocab/vocab.css` con los estilos de la tarjeta SRS y la pantalla de repaso, usando EXCLUSIVAMENTE los tokens CSS del sistema de diseño (`var(--bg)`, `var(--bg-elevated)`, `var(--text)`, `var(--text-muted)`, `var(--accent)`, `var(--jade)`, `var(--gold)`, fuentes `var(--font-hanzi-read)`, `var(--font-ui)`, etc. — asume que existen definidos en `src/styles/tokens.css`/`typography.css`). Define: `.srs-card` (contenedor con perspective para el volteo 3D, `transform-style: preserve-3d`), `.srs-card__cara` (front/back con `backface-visibility:hidden`, cara trasera rotada `rotateY(180deg)`), estado `.srs-card.is-flipped` que aplica `rotateY(180deg)` con transicion `320ms var(--ease-brush)` y un `scale(1.02)` en el ecuador, el gran hanzi en `.srs-card__hanzi` (font-hanzi-read, tamaño grande), pinyin en `--text-faint`, glosa en español, y los botones de grado (`.srs-grade--again` bermellón, `.srs-grade--good`, `.srs-grade--easy` jade, con `min-height:48px` para toque). Añade feedback `.is-correcto` (trazo jade que se pinta) y `.is-incorrecto` (micro-shake ±4px). Respeta `@media (prefers-reduced-motion: reduce)` neutralizando animaciones. Este commit es solo CSS; verifica con `npm run build` y `npm run format:check`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D17. Componente de tarjeta SRS con volteo

**commit:** `feat(vocab): componente de tarjeta SRS con volteo 3D`

Crea `src/modules/vocab/srs-card.view.ts`, un componente DOM vanilla (sin React) que renderice una tarjeta SRS volteable. Expone `crearSrsCard(opts: { lexema: LexemaSemilla; tipo: TipoTarjeta; mostrarPinyin: boolean; onGrado: (grado: GradoFsrs) => void; onAudio: () => void }): { el: HTMLElement; voltear: () => void; reset: () => void }`. La cara frontal muestra el frente segun `tipo`: `recognition` -> hanzi grande (+ pinyin si mostrarPinyin); `production` -> español/pinyin pidiendo el hanzi; `listening` -> un boton de audio (texto '听 escuchar') sin mostrar el hanzi. Al tocar la tarjeta se voltea (toggle clase `is-flipped`) revelando hanzi+pinyin+es+ejemplo y los botones de grado (Again/Good/Easy mapeados a GradoFsrs 1/3/4; deriva Hard=2 de latencia mas tarde). Conecta `onAudio` a un boton 🔊 que llama al callback. Usa `import { crearSrsCard }`-style con tipos `import type`. Importa el CSS con `import './vocab.css';`. Asegura accesibilidad: `role`, foco y que los botones tengan ≥48px. Crea `src/modules/vocab/srs-card.view.test.ts` (jsdom) que monte la tarjeta, compruebe que `recognition` muestra el hanzi en la cara frontal, que `voltear()` añade `is-flipped`, y que pulsar el boton Good llama `onGrado(3)`. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D18. Logica de sesion de repaso

**commit:** `feat(vocab): logica de sesion de repaso`

Crea `src/modules/vocab/sesion.logic.ts` con la maquina de estado pura (sin DOM) de una sesion de repaso. Expone una clase o factory `crearSesion(cola: TarjetaUsuario[], deps: { ahora: () => number; scheduler: ReturnType<typeof crearScheduler> })` con: `actual(): TarjetaUsuario | null`, `responder(grado: GradoFsrs): { tarjetaActualizada: TarjetaUsuario; log: LogReview }` que aplique `calificar` (de `core/srs/fsrs`), genere el `LogReview` (con `estadoPrevio`, `latenciaMs` pasado o medido, grado, fecha) y avance a la siguiente; deriva el grado Hard (2) automaticamente si el grado es Good (3) pero la latencia supero un umbral (ej. 8000ms). `progreso(): { hechas: number; total: number }`, y `terminada(): boolean`. NO escribe en IndexedDB (eso lo hara la vista); devuelve los objetos para que el caller persista. Crea `src/modules/vocab/sesion.logic.test.ts`: responder avanza la cola, produce un log con estadoPrevio correcto, la tarjeta actualizada tiene nuevo `due` futuro, Good lento se degrada a Hard, y `terminada()` es true al acabar la cola. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D19. Vista de sesion de repaso integrada

**commit:** `feat(vocab): vista de sesion de repaso integrada`

Crea `src/modules/vocab/vocab.view.ts` que ensamble la pantalla de repaso completa montable por el router. Expone `mount(el: HTMLElement): void | (() => void)`. Al montar: carga settings (`getSettings`), lee tarjetas de IndexedDB (`getTodasTarjetas`); si no hay tarjetas, siembra desde el contenido semilla generando tarjetas `recognition` para `TODOS_LEXEMAS` con origen 'nuevo' y las persiste (`bulkPutTarjetas`). Construye la cola con `construirCola` y un scheduler de `crearScheduler(settings)`. Crea una `crearSesion` y renderiza la tarjeta actual con `crearSrsCard`, conectando `onAudio` a `hablar(lexema.hanzi, { rate: settings.ttsRate })` y `onGrado` a: llamar `sesion.responder(grado)`, persistir la tarjeta actualizada (`putTarjeta`) y el log (`addReview`), mostrar feedback (clase is-correcto/is-incorrecto) y renderizar la siguiente. Muestra una barra de progreso (`sesion.progreso()`) y una pantalla de fin con el conteo cuando `terminada()`. Mide la latencia (timestamp al mostrar la cara frontal hasta el grado). Verifica con `npm run typecheck && npm run build`. (Tests de DOM opcionales aqui dado que integra IndexedDB; si añades alguno usa fake-indexeddb.) Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D20. Algoritmo de diagnostico adaptativo

**commit:** `feat(diagnostic): algoritmo de diagnostico adaptativo CAT`

Crea `src/modules/diagnostic/diagnostico.logic.ts` con el test adaptativo ligero (CAT simplificado, regla de escalera) puro y testeable. Expone `crearDiagnostico(banco: ItemDiagnostico[], opts?: { nivelInicial?: number; maxItems?: number }): { siguiente(): ItemDiagnostico | null; responder(respuesta: number|string, latenciaMs: number): void; terminado(): boolean; resultado(): ResultadoDiagnostico }`. Reglas: arranca en HSK 4 (`nivelInicial` default 4); acierto -> sube un nivel, fallo -> baja un nivel (rango 3..7); mantiene `θ` como media movil de niveles con acierto estable; PARADA tras 12-15 items o al detectar 2 reversiones (sube-baja-sube) alrededor del mismo nivel. Selecciona el siguiente item del banco mas cercano al nivel objetivo no usado. `resultado()` calcula `nivelEstimadoHsk` (nivel mas alto con ≥70% acierto), `perfilHabilidades` (acierto 0..1 por cada Habilidad), y `gapProduccion` (lexemaIds acertados en items 'recognition' pero fallados/lentos en 'production' de la MISMA palabra; tambien marca como fragil cualquier acierto con latencia >4000ms). Registra `latenciaMs` siempre. Acepta un `rng` para reproducibilidad. Crea `src/modules/diagnostic/diagnostico.logic.test.ts`: subir/bajar nivel correctamente, parada por nº de items y por reversiones, gapProduccion cruzando recognition vs production de la misma palabra, y nivelEstimado coherente con respuestas simuladas. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D21. Banco de items de diagnostico

**commit:** `feat(diagnostic): banco de items adaptativos desde contenido semilla`

Crea `src/modules/diagnostic/data/banco.ts` que exporte `export const BANCO_DIAGNOSTICO: ItemDiagnostico[]` (import type) construido a partir del contenido semilla (`TODOS_LEXEMAS` de `src/modules/vocab/data`). Genera ~20 items cubriendo la mezcla de habilidades del diseño: items `recognition` (hanzi->significado, opcion multiple de 4 usando `generarDistractores`) para palabras HSK5 y HSK6; items `production` (español/pinyin->hanzi) sobre las MISMAS palabras clave (para medir la brecha pasivo/activo, p.ej. 经济, 矛盾, 责任); items `listening` (audio->hanzi, el prompt es el hanzi a pronunciar por TTS); items `tone` (identificar el tono de una silaba); items de chengyu (HSK7) para detectar el techo (p.ej. 画蛇添足, 塞翁失马). Cada item con `dificultad` = hsk del lexema, `habilidad` mapeada al tipo, y `correcta` como indice valido en `opciones`. Asegura ≥3 items por nivel 4,5,6 y ≥2 de nivel 7. Crea `src/modules/diagnostic/data/banco.test.ts`: no hay items con `correcta` fuera de rango de `opciones`, hay items de production y recognition que comparten lexemaId (para el gap), y cobertura de niveles 4-7. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D22. Vista de diagnostico + carta de calibracion

**commit:** `feat(diagnostic): vista de diagnostico con carta de calibracion y radar`

Crea `src/modules/diagnostic/diagnostic.view.ts` (montable por el router, `mount(el)`) y `src/modules/diagnostic/diagnostic.css`. La vista usa `crearDiagnostico(BANCO_DIAGNOSTICO)` y renderiza item a item: muestra el prompt (hanzi, pinyin, o boton de audio TTS con `hablar` para items 'listening'/'tone'), las `opciones` como botones tipo tap (≥48px), mide latencia, y llama `responder`. Al `terminado()`, muestra la pantalla-sello tipo 'carta de calibracion' (estetica 水墨, usa tokens) con microcopy POSITIVO que NUNCA humilla: 'Tu chino está en torno a HSK {nivel}. Reconoces mucho de lo que ves, pero tu producción está dormida — vamos a despertarla.', un radar de 4 ejes (Lectura/Escucha/Vocabulario activo/Tonos) dibujado en SVG inline desde `perfilHabilidades`, y un boton 'Empezar reactivación'. Al pulsarlo: persiste el `ResultadoDiagnostico` (guarda en localStorage bajo 'chino-diagnostico' o en el perfil) y dispara la siembra del SRS (siguiente prompt usara este resultado). Importa el CSS. Verifica con `npm run typecheck && npm run build`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D23. Modo reactivacion: siembra del SRS desde el diagnostico

**commit:** `feat(diagnostic): siembra del SRS en modo reactivacion (efecto savings)`

Crea `src/modules/diagnostic/reactivacion.ts` con la logica pura que convierte un `ResultadoDiagnostico` en tarjetas sembradas para el SRS. Expone `sembrarDesdeResultado(resultado: ResultadoDiagnostico, lexemas: LexemaSemilla[], ahora: number): TarjetaUsuario[]`. Reglas (efecto savings): para cada lexema acertado en el diagnostico, crea tarjeta `recognition` con `origen:'reactivacion'` y aplica `sembrarReactivacion` con la latencia registrada (stability alta, salta el valle); si el lexema esta en `gapProduccion`, genera tambien una tarjeta `production` desbloqueada con stability MAS BAJA (la produccion esta dormida); para lexemas no vistos o fallados en el diagnostico, crea tarjetas `recognition` `origen:'nuevo'` (estabilidad baja). Cap de material nuevo segun el diseño (no inundar). Reutiliza `crearTarjeta`/`sembrarReactivacion`/`generarTarjetasIniciales` de `src/core/srs/generador.ts`. Crea `src/modules/diagnostic/reactivacion.test.ts`: lexema acertado rapido -> tarjeta reactivacion con due lejano; lexema en gapProduccion -> ademas tarjeta production desbloqueada con menor stability; lexema fallado -> tarjeta nuevo con due cercano. Verifica con `npm run typecheck && npm run test`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

### D24. Importar/exportar mazos y gestion de mazos

**commit:** `feat(vocab): gestion de mazos e import/export de backup JSON`

Crea `src/modules/vocab/mazos.ts` con la gestion de mazos e import/export (clave por la eviccion de IndexedDB en iOS: backup manual). Expone: `MAZOS` -> definicion de los mazos del contenido semilla agrupando lexemas por etiqueta/origen, p.ej. `{ id:'hsk5', nombre:'HSK 5', lexemaIds:[...] }`, `{ id:'hsk6', nombre:'HSK 6', ... }`, `{ id:'chengyu', nombre:'Chengyu 成语', ... }` derivados de `TODOS_LEXEMAS`. `exportarBackup(): Promise<string>` que serialice a JSON `{ version, fecha, tarjetas, reviews, settings, diagnostico }` leyendo de IndexedDB/localStorage. `importarBackup(json: string): Promise<{ tarjetas: number; reviews: number }>` que valide el `version`, haga `borrarTodo()` + `bulkPutTarjetas` + reinserte reviews y settings, devolviendo conteos; lanza error claro si el JSON es invalido o de version incompatible. Crea `src/modules/vocab/mazos.test.ts` (con fake-indexeddb): round-trip export->import preserva tarjetas y reviews; import de JSON invalido lanza; los mazos cubren todos los lexemas sin duplicar ids. Verifica con `npm run typecheck && npm run test && npm run build`. Recuerda: commit GRANULAR, espera CI VERDE, y JAMAS Claude como co-author.

## Grupo E

### E1. Tipos de datos del modulo Lectura

**commit:** `feat(reading): tipos de datos de textos y progreso de lectura`

Trabajas en una PWA Vite + TypeScript VANILLA (sin React) para practicar chino. Crea el archivo `src/types/reading.ts` con los tipos del modulo de lectura, coherentes con el modelo de datos ya definido en el proyecto. Define y exporta:

- `type NivelTexto = 'intermedio' | 'intermedio-alto' | 'avanzado'`.
- `interface GlosaLexica { hanzi: string; pinyin: string; es: string }`.
- `interface PreguntaComprension { enunciado: string; opciones: string[]; correcta: number; explicacion: string }`.
- `interface TextoLectura { id: string; titulo: string; nivel: NivelTexto; cuerpo: string; glosaEs: string; glosas: GlosaLexica[]; preguntas: PreguntaComprension[]; lexemasRelacionados: string[] }`.
- `interface ProgresoLectura { textoId: string; leido: boolean; velocidadCharMin?: number; aciertoComprension?: number; palabrasGuardadas: string[] }`.

No crees vistas ni logica todavia, solo los tipos. Si ya existe un `src/types/index.ts` que reexporta tipos, anade `export * from './reading'`. Verifica con `npm run typecheck` y `npm run build` que todo compila.

DISCIPLINA INVIOLABLE: haz UN commit granular solo para este cambio. Espera a que CI este VERDE antes de continuar. JAMAS pongas a Claude/Anthropic como co-author ni anadas trailers `Co-Authored-By` ni 'Generated with Claude'.

### E2. Contenido semilla: texto 塞翁失马

**commit:** `feat(reading): texto semilla 塞翁失马 con glosas y preguntas`

En la PWA de chino (Vite + TS vanilla, offline-first con contenido en JSON estatico del bundle), crea `public/data/reading/sai-weng-shi-ma.json` con el texto semilla narrativo 塞翁失马, conforme al tipo `TextoLectura` de `src/types/reading.ts`. Usa este contenido REAL:

- `id`: "txt_saiweng"
- `titulo`: "塞翁失马"
- `nivel`: "intermedio-alto"
- `cuerpo`: el texto chino completo: 从前，边境上住着一位老人。一天，他的马跑到了塞外，邻居们都来安慰他。老人却说："这未必不是一件好事。" 几个月后，那匹马竟然带回来一匹好马。邻居们又来道贺，老人说："这也许会带来麻烦。" 后来，他的儿子骑那匹马时摔断了腿。大家都为他难过，老人依然平静地说："谁知道这是福还是祸呢？" 不久，战争爆发，年轻人都被征去打仗，很多人死了，而他的儿子因为腿伤留在家里，保住了性命。
- `glosaEs`: la traduccion completa al espanol (Hace tiempo, en la frontera vivia un anciano... y salvo la vida).
- `glosas`: al menos estas: 边境/biānjìng/frontera, 安慰/ānwèi/consolar, 未必/wèibì/no necesariamente, 道贺/dàohè/felicitar, 摔断/shuāiduàn/romperse al caer, 征/zhēng/reclutar, 爆发/bàofā/estallar, 福/fú/fortuna, 祸/huò/desgracia.
- `preguntas`: 2 preguntas de comprension con `opciones`, `correcta` (indice) y `explicacion` que cite la frase del texto.
- `lexemasRelacionados`: array vacio por ahora (lo conectaremos al SRS despues).

Escribe un test minimo en `tests/reading-seed.test.ts` (Vitest) que importe el JSON y valide con un type guard o asersiones que cumple la forma `TextoLectura` (id no vacio, cuerpo no vacio, al menos 1 pregunta con `correcta` dentro del rango de `opciones`). Verifica con `npm run typecheck`, `npm run test` y `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E3. Contenido semilla: texto 内卷

**commit:** `feat(reading): texto semilla 内卷 con glosas y preguntas`

En la PWA de chino, crea `public/data/reading/neijuan.json` con el segundo texto semilla (expositivo/actual) sobre 内卷, conforme al tipo `TextoLectura`. Usa este contenido REAL:

- `id`: "txt_neijuan"
- `titulo`: "关于\"内卷\""
- `nivel`: "avanzado"
- `cuerpo`: 近年来，"内卷"成了中国年轻人常挂在嘴边的一个词。它原本是一个学术概念，如今却被用来形容一种激烈而又无意义的竞争：大家都付出更多的努力，结果却没有人真正受益。比如，公司里人人都加班到深夜，并不是因为工作需要，而是因为不想显得比别人差。久而久之，加班成了常态，效率反而下降。许多人开始反思：与其在内卷中精疲力尽，不如重新思考自己真正想要的生活。
- `glosaEs`: la traduccion completa al espanol.
- `glosas`: 内卷/nèijuǎn/involución, 挂在嘴边/guà zài zuǐbiān/tener siempre en la boca, 激烈/jīliè/feroz, 受益/shòuyì/beneficiarse, 加班/jiābān/horas extra, 常态/chángtài/norma, 反思/fǎnsī/reflexionar, 精疲力尽/jīng pí lì jìn/agotado, 与其…不如…/yǔqí…bùrú…/más que… mejor….
- `preguntas`: 2 preguntas de comprension con explicacion.
- `lexemasRelacionados`: array vacio.

Anade su validacion al test `tests/reading-seed.test.ts` (o uno nuevo) con las mismas asersiones de forma. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E4. Cargador de textos de lectura

**commit:** `feat(reading): cargador de textos semilla offline-first`

En la PWA de chino (Vite + TS vanilla, base path de GitHub Pages), crea `src/modules/reading/reading.data.ts`, un cargador puro (sin DOM) de los textos semilla. Implementa:

- `import` de los JSON estaticos en `public/data/reading/` usando `fetch(import.meta.env.BASE_URL + 'data/reading/<file>.json')` para respetar el base path de Pages (NO uses rutas absolutas que empiecen por `/`).
- `export async function cargarTextos(): Promise<TextoLectura[]>` que cargue ambos textos (sai-weng-shi-ma, neijuan), valide forma minima y devuelva el array.
- `export async function cargarTextoPorId(id: string): Promise<TextoLectura | undefined>`.
- Cachea el resultado en memoria (variable modulo) para no re-fetchear.

Escribe `tests/reading-data.test.ts` con Vitest mockeando `fetch` (devolviendo los JSON) y comprobando que `cargarTextos` retorna 2 textos y que `cargarTextoPorId('txt_neijuan')` los encuentra. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E5. Segmentacion de palabras chinas

**commit:** `feat(reading): segmentador FMM de palabras chinas`

En la PWA de chino, crea `src/modules/reading/segmenter.ts`, un segmentador de palabras chino PURO (sin DOM, testeable). El objetivo: partir un texto chino corrido en tokens (palabras/puntuacion) para poder envolver cada palabra y mostrar glosas al tocar. Implementa un algoritmo de maximum matching hacia adelante (forward maximum matching, FMM):

- `export interface Token { texto: string; esPalabra: boolean }` (esPalabra=false para puntuacion/espacios).
- `export function segmentar(texto: string, diccionario: Set<string>, maxLen = 4): Token[]`. Recorre el texto; en cada posicion intenta el substring mas largo (hasta maxLen caracteres) que exista en el diccionario; si no hay match, emite un token de 1 caracter. Separa la puntuacion CJK (，。！？：\"\"；、（）) y latina como tokens con esPalabra=false.
- El diccionario se construira a partir de los `hanzi` de las glosas del texto + lexemas del SRS; acepta cualquier `Set<string>`.

Escribe `tests/segmenter.test.ts` cubriendo: match de palabra de 2 chars, fallback a caracter suelto, separacion de puntuacion, y que reconstruir `tokens.map(t=>t.texto).join('')` devuelve el texto original exacto (propiedad de no-perdida). Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E6. Logica de estado de lectura

**commit:** `feat(reading): logica pura de estado del lector`

En la PWA de chino, crea `src/modules/reading/reading.logic.ts` con la logica PURA (sin DOM) del lector, separada de la vista. Implementa:

- `export interface EstadoLector { texto: TextoLectura; palabrasGuardadas: Set<string>; preguntaActual: number; respuestas: (number|null)[] }`.
- `export function crearEstadoLector(texto: TextoLectura): EstadoLector`.
- `export function alternarPalabraGuardada(estado: EstadoLector, hanzi: string): EstadoLector` (marca/desmarca una palabra desconocida, inmutable).
- `export function responderPregunta(estado, idx, opcion): EstadoLector`.
- `export function aciertoComprension(estado): number` (0..1 sobre preguntas respondidas).
- `export function calcularVelocidadCharMin(numChars: number, ms: number): number` (caracteres/min, redondeado).
- `export function buscarGlosa(texto: TextoLectura, hanzi: string): GlosaLexica | undefined`.

Escribe `tests/reading-logic.test.ts` cubriendo guardar/desguardar palabra, responder y recalcular acierto, y velocidad (p.ej. 200 chars en 60000 ms = 200). Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E7. Estilos del modulo Lectura

**commit:** `style(reading): estilos 水墨 del lector y glosas`

En la PWA de chino con estetica 水墨 (papel arroz, bermellon, jade, oro en hairlines), crea `src/modules/reading/reading.css` usando EXCLUSIVAMENTE los tokens CSS ya definidos (`--bg`, `--bg-elevated`, `--text`, `--text-muted`, `--accent`, `--jade`, `--gold`, `--font-hanzi-read`, `--lh-hanzi`, etc.). Define clases para:

- `.lectura-texto`: contenedor de lectura con `font-family: var(--font-hanzi-read)`, `line-height: var(--lh-hanzi)`, `font-size: var(--fs-lead)`, ancho de lectura comodo.
- `.lectura-palabra`: palabra tappable (cursor pointer, `touch-action: manipulation`); estado `.lectura-palabra--guardada` con subrayado de trazo bermellon fino (usa `text-decoration` o `border-bottom` con `--accent`).
- `.glosa-popover`: popover de glosa (fondo `--bg-elevated`, sombra de tinta suave, esquinas redondeadas, sube 6px con translateY + opacity). Respeta `prefers-reduced-motion` (solo fade).
- `.lectura-pregunta`, `.lectura-opcion`, estados `--correcta` (jade) y `--incorrecta` (bermellon).
- `.lectura-stats`: velocidad y acierto con `font-variant-numeric: tabular-nums`.

No cambies logica ni vistas todavia; solo CSS. Verifica con `npm run build` (que Vite procese el CSS) y `npm run format:check`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E8. Componente de glosa emergente

**commit:** `feat(reading): popover de glosa emergente al tocar palabra`

En la PWA de chino, crea `src/modules/reading/glosa-popover.ts`, un componente de UI vanilla que muestra la glosa de una palabra al tocarla. Requisitos:

- `export function mostrarGlosa(opts: { anchorEl: HTMLElement; glosa: GlosaLexica; onEscuchar: () => void; onGuardar: () => void; guardada: boolean }): () => void` que crea un popover posicionado cerca de `anchorEl`, con: hanzi grande, pinyin (con marcas tonales), traduccion espanol, un boton 'Escuchar' (llama `onEscuchar`) y un boton 'Marcar desconocida'/'Guardada' (llama `onGuardar`). Devuelve una funcion para cerrarlo.
- IMPORTANTE pedagogia: la glosa NO debe aparecer sola; solo al tocar (recuperacion forzada). Un solo popover a la vez: al abrir uno, cierra el anterior.
- Cierra al tocar fuera (listener en document) y al hacer scroll. Usa las clases `.glosa-popover` de `reading.css`.
- Reproduce el TTS de la palabra mediante el modulo de audio existente (`src/core/audio.ts`, Web Speech zh-CN) a traves del callback `onEscuchar` (no acoples audio directo aqui).

Escribe `tests/glosa-popover.test.ts` con jsdom: monta un anchor, llama `mostrarGlosa`, comprueba que el popover existe con el hanzi/pinyin/es correctos y que el boton Escuchar invoca el callback. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E9. Vista de lectura con texto segmentado

**commit:** `feat(reading): vista de lectura con palabras tappables`

En la PWA de chino, crea `src/modules/reading/reading.view.ts` que renderiza un texto con palabras tappables. Requisitos:

- `export function montarLector(el: HTMLElement, texto: TextoLectura): void`.
- Construye un diccionario `Set<string>` con los `hanzi` de `texto.glosas` y segmenta `texto.cuerpo` con `segmentar()` de `segmenter.ts`.
- Renderiza cada token: palabras (esPalabra) como `<span class="lectura-palabra" data-hanzi="...">`, puntuacion como texto plano. Usa `.lectura-texto` como contenedor.
- Al tocar una palabra: si tiene glosa (`buscarGlosa`), abre el popover (`mostrarGlosa`) con callbacks de Escuchar (TTS via `core/audio`) y Guardar (`alternarPalabraGuardada` de la logica). Refleja `.lectura-palabra--guardada` en el DOM.
- Usa `reading.logic.ts` para todo el estado; la vista solo orquesta DOM.
- Sanitiza: nunca uses innerHTML con el cuerpo; crea nodos con `textContent`.

Escribe `tests/reading-view.test.ts` (jsdom) que monte un texto pequeno, compruebe que se generan spans de palabra, y que al simular click en una palabra con glosa aparece el popover. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E10. Comprension: preguntas y feedback

**commit:** `feat(reading): preguntas de comprension con feedback`

En la PWA de chino, extiende el lector con la fase de comprension. Crea `src/modules/reading/comprension.view.ts`:

- `export function montarComprension(el: HTMLElement, texto: TextoLectura, onFinalizar: (acierto: number) => void): void`.
- Renderiza las `preguntas` del texto una a una (o en lista) con `opciones` como botones (`.lectura-opcion`).
- Al responder: marca la opcion elegida; si es correcta, feedback jade; si no, marca la incorrecta en bermellon y resalta la correcta, y muestra la `explicacion` (que cita la frase del texto). Usa `responderPregunta`/`aciertoComprension` de `reading.logic.ts`.
- Al terminar todas, llama `onFinalizar` con el acierto (0..1).
- Respeta `prefers-reduced-motion` para el feedback (sin shake, solo color).

Escribe `tests/comprension-view.test.ts` (jsdom): responde correcta e incorrecta, comprueba clases de feedback, que se muestra la explicacion al fallar, y que `onFinalizar` recibe el acierto esperado. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E11. Cronometro y velocidad lectora

**commit:** `feat(reading): cronometro y velocidad lectora como progreso`

En la PWA de chino, anade medicion de velocidad lectora al modulo de lectura. Edita `src/modules/reading/reading.view.ts` (o crea `src/modules/reading/cronometro.ts` si conviene aislarlo):

- Inicia un temporizador (`performance.now()`) cuando el usuario empieza a leer (al montar el lector o al pulsar 'Empezar a leer').
- Al pulsar 'He terminado' (boton que ya debe existir o que anades), detiene el cronometro, cuenta los caracteres chinos del cuerpo (filtra solo hanzi, rango U+4E00–U+9FFF) y calcula la velocidad con `calcularVelocidadCharMin` de la logica.
- Muestra la velocidad en `.lectura-stats` como 'X caracteres/min' enmarcado como PROGRESO, nunca como nota (microcopy positivo).
- Tras terminar, transiciona a la fase de comprension (`montarComprension`).

Anade tests en `tests/reading-view.test.ts` (o nuevo) mockeando `performance.now()` para verificar el calculo de velocidad con un intervalo conocido. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E12. Persistencia de progreso de lectura

**commit:** `feat(reading): persistencia de progreso de lectura en IndexedDB`

En la PWA de chino (storage en `src/core/storage.ts`, wrapper de IndexedDB; settings/perfil en localStorage), persiste el progreso de lectura. Crea `src/modules/reading/reading.store.ts`:

- Usa el wrapper de IndexedDB existente (o `idb-keyval` si ya es la dependencia del proyecto) con un store/clave `progresoLectura`.
- `export async function guardarProgreso(p: ProgresoLectura): Promise<void>` (clave por `textoId`).
- `export async function obtenerProgreso(textoId: string): Promise<ProgresoLectura | undefined>`.
- `export async function listarProgreso(): Promise<ProgresoLectura[]>`.
- Al terminar comprension en la vista, persiste `{ textoId, leido: true, velocidadCharMin, aciertoComprension, palabrasGuardadas }`.

Escribe `tests/reading-store.test.ts` usando `fake-indexeddb` (ya configurado en `tests/setup.ts`): guarda y recupera un progreso, comprueba que `listarProgreso` lo incluye. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E13. Palabras desconocidas alimentan el SRS

**commit:** `feat(reading): palabras desconocidas alimentan el SRS`

En la PWA de chino, conecta las palabras marcadas como desconocidas durante la lectura con el SRS (FSRS en `src/core/srs/`). Crea `src/modules/reading/reading-to-srs.ts`:

- `export async function anadirPalabrasAlSrs(texto: TextoLectura, hanzis: string[]): Promise<string[]>` que, para cada hanzi guardado: busque su glosa en `texto.glosas` para tener pinyin+es, cree (si no existe) una `TarjetaUsuario` de tipo `recognition` con `origen: 'reactivacion'` (la usuaria es avanzada y oxidada) usando el scheduler/FSRS existente, y la inserte en el store del SRS. Devuelve los ids de las tarjetas creadas.
- Evita duplicados: si ya hay tarjeta para ese lexema/tipo, no la recrees.
- En la fase final de comprension, muestra la lista de palabras tocadas/guardadas con un boton 'Anadir a repaso' que invoque esta funcion (microcopy: 'Estas palabras entraran a tu repaso espaciado').

Escribe `tests/reading-to-srs.test.ts` (fake-indexeddb): marca 2 palabras, ejecuta la funcion, comprueba que se crean 2 tarjetas `recognition` con `origen: 'reactivacion'` y que reejecutar no duplica. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E14. Indice de lectura y ruta del modulo

**commit:** `feat(reading): indice de textos y ruta #/lectura`

En la PWA de chino (router casero hash-based en `src/router/`), integra el modulo de lectura en la navegacion. Crea `src/modules/reading/index.ts` que exporte `mount(el: HTMLElement)`:

- Renderiza un indice: lista de textos (`cargarTextos`) como tarjetas con titulo (hanzi), nivel y estado (leido/no leido desde `reading.store`), estetica 水墨 con esquinas en L de oro.
- Al elegir un texto, monta el flujo completo: lector (`montarLector`) -> 'He terminado' (velocidad) -> comprension (`montarComprension`) -> pantalla final con stats y boton 'Anadir a repaso' (reading-to-srs).
- Registra la ruta `#/lectura` en `src/router/routes.ts` con `import()` dinamico para code-splitting.
- Asegura el `view-transition-name` del titulo si la app usa View Transitions.

Escribe `tests/reading-index.test.ts` (jsdom) que monte el indice con textos mockeados y compruebe que aparecen las 2 tarjetas. Verifica con `npm run typecheck`, `npm run test`, `npm run build`. Comprueba manualmente que `#/lectura` carga sin errores en `npm run dev`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E15. Modo karaoke-lectura con TTS

**commit:** `feat(reading): modo karaoke-lectura con resaltado TTS`

En la PWA de chino, anade el modo karaoke-lectura al modulo de lectura (entrena prosodia y velocidad). Crea `src/modules/reading/karaoke.ts`:

- `export function iniciarKaraoke(opts: { textoEl: HTMLElement; texto: TextoLectura; rate: number }): { detener: () => void }`.
- Usa Web Speech `SpeechSynthesisUtterance` (voz zh-CN, p.ej. Ting-Ting) via `core/audio.ts`. Aprovecha el evento `boundary` del utterance para resaltar la palabra/segmento actual aplicando una clase `.lectura-palabra--activa` (defínela en `reading.css` con un sutil resaltado bermellon/jade).
- Honestidad tecnica: el evento `boundary` es irregular en iOS Safari; implementa un fallback temporizado por longitud de segmento si `boundary` no dispara. Permite parar en cualquier momento.
- Respeta `prefers-reduced-motion` (sin animacion del resaltado, solo cambio de color).

Escribe `tests/karaoke.test.ts` (jsdom) mockeando `speechSynthesis`/`SpeechSynthesisUtterance` para verificar que se inicia la sintesis y que `detener()` llama `cancel()`. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E16. Caza de chengyu en el texto

**commit:** `feat(reading): modo caza de chengyu en el texto`

En la PWA de chino, anade un modo 'Caza de chengyu' al modulo de lectura que aprovecha el contenido semilla (los textos comparten temas con los 18 chengyu del proyecto). Crea `src/modules/reading/caza-chengyu.ts`:

- `export function montarCazaChengyu(el: HTMLElement, texto: TextoLectura, chengyuConocidos: Set<string>): void`. Detecta en el `cuerpo` los chengyu (4 caracteres) presentes en `chengyuConocidos` o en las glosas marcadas como chengyu, y pide a la usuaria que los identifique tocandolos.
- Feedback: acierto -> mini-sello jade y microcopy avanzado ('Esto es nivel avanzado. Sigue ahi.'); fallo o palabra incorrecta -> shake suave (respeta reduce-motion) + revelado.
- Reutiliza el segmentador y las clases CSS existentes.

Escribe `tests/caza-chengyu.test.ts` (jsdom) con un texto que contenga un chengyu conocido: comprueba que tocar el chengyu correcto da feedback de acierto y que tocar otra palabra da fallo. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E17. Dependencia hanzi-writer y tipos de escritura

**commit:** `chore(writing): instala hanzi-writer y define tipos de escritura`

En la PWA de chino (Vite + TS vanilla), prepara el modulo de ESCRITURA de hanzi con la libreria `hanzi-writer`. Pasos:

- Instala la dependencia: `npm install hanzi-writer` (libreria que anima orden de trazos y ofrece quiz interactivo). Verifica que tiene tipos TS (incluye `@types/hanzi-writer` si fuese necesario; si la libreria ya trae tipos, no lo anadas).
- Crea `src/types/writing.ts` con: `interface CaracterEscritura { hanzi: string; pinyin: string; es: string; trazos?: number }`, `interface LeccionEscritura { id: string; titulo: string; caracteres: CaracterEscritura[] }`, `type ResultadoTrazo = { caracter: string; fallos: number; completado: boolean }`.
- Decide la fuente de datos de trazos de hanzi-writer: por defecto los carga de CDN (jsDelivr). Para offline-first, anota en un comentario que se cubrira con runtime caching del SW (`/hanzi-data/`), ya previsto en la config Workbox.

No crees vistas todavia. Verifica con `npm run typecheck`, `npm run build` que compila con la nueva dependencia. Confirma que el lockfile (`package-lock.json`) queda actualizado.

DISCIPLINA INVIOLABLE: UN commit granular (incluye package.json + lockfile + tipos). Espera CI VERDE. JAMAS Claude como co-author.

### E18. Carga offline de datos de trazos

**commit:** `feat(writing): carga y precarga offline de datos de trazos`

En la PWA de chino, configura la carga de los datos de trazos de hanzi-writer para que funcione offline (PWA en iPhone, runtime caching ya previsto para `/hanzi-data/`). Crea `src/modules/writing/stroke-loader.ts`:

- `export function configurarCargaTrazos(): void` que defina la opcion `charDataLoader` que se pasara a `HanziWriter.create(...)`, apuntando a una URL estable de datos (CDN jsDelivr de hanzi-writer-data) y compatible con el runtime caching `CacheFirst` del service worker.
- `export async function precargarTrazos(caracteres: string[]): Promise<void>` que dispare la descarga (fetch) de los datos de los caracteres de las lecciones semilla para que el SW los cachee tras la primera carga online.
- Maneja errores de red con un fallback claro (si no hay datos, la vista debe degradar a mostrar el caracter estatico).

Escribe `tests/stroke-loader.test.ts` (jsdom) mockeando `fetch` para comprobar que `precargarTrazos` pide los caracteres dados y que un fallo de red no lanza excepcion no controlada. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E19. Lecciones semilla de escritura

**commit:** `feat(writing): lecciones semilla de caracteres y cargador`

En la PWA de chino, crea el contenido semilla de escritura coherente con el vocabulario HSK 5-6 ya definido. Crea `public/data/writing/lecciones.json` conforme a `LeccionEscritura[]` con al menos 2 lecciones:

- Leccion 1 'Economia y sociedad' (id `lec_economia`): caracteres de palabras frecuentes y de pocos/medios trazos del set semilla, p.ej. 经, 济, 效, 率, 资, 源 (con pinyin y es de la palabra que los contiene).
- Leccion 2 'Conceptos' (id `lec_conceptos`): 现, 象, 观, 念, 责, 任.
- Cada `CaracterEscritura` con `hanzi`, `pinyin`, `es` y `trazos` aproximado. Empieza por caracteres frecuentes y de pocos trazos (criterio de dificultad del proyecto).

Crea `src/modules/writing/writing.data.ts` con `export async function cargarLecciones(): Promise<LeccionEscritura[]>` usando `fetch(import.meta.env.BASE_URL + 'data/writing/lecciones.json')` (respeta base path). Escribe `tests/writing-data.test.ts` (mock fetch) validando que carga >=2 lecciones con caracteres no vacios. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E20. Estilos del modulo Escritura

**commit:** `style(writing): estilos 水墨 del lienzo y retícula de hanzi`

En la PWA de chino con estetica 水墨, crea `src/modules/writing/writing.css` usando solo tokens CSS existentes. Define:

- `.escritura-canvas-wrap`: contenedor cuadrado responsive del lienzo de hanzi-writer, con fondo papel (`--bg-elevated`), retícula tradicional 米字格/田字格 dibujada con hairlines (`--surface-line` y un eje fino en `--gold`).
- `.escritura-caracter-info`: pinyin y traduccion bajo el caracter (`--text-muted`, pinyin con marcas tonales).
- Estados de feedback de trazo: `.escritura--trazo-ok` (jade) y `.escritura--trazo-error` (bermellon) para mensajes/indicadores.
- `.escritura-controles`: botones 'Ver animacion', 'Practicar (quiz)', 'Borrar', 'Siguiente' con estetica de boton del sistema.
- `.escritura-progreso-leccion`: indicador de avance dentro de la leccion (tabular-nums).

Respeta `prefers-reduced-motion`. No toques logica. Verifica con `npm run build` y `npm run format:check`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E21. Animacion de orden de trazos

**commit:** `feat(writing): animacion de orden de trazos con hanzi-writer`

En la PWA de chino, crea `src/modules/writing/stroke-animation.ts`, un wrapper sobre hanzi-writer para mostrar el orden de trazos animado de un caracter. Implementa:

- `export function crearEscritor(target: HTMLElement, hanzi: string, opts?: Partial<...>): HanziWriter` que llame `HanziWriter.create(target, hanzi, { width, height, padding, strokeColor: tinta, radicalColor, showOutline: true, charDataLoader, ... })`, usando `stroke-loader.ts` para los datos y colores derivados de los tokens (tinta `--ink-900`, acento `--accent`).
- `export async function animarCaracter(writer: HanziWriter): Promise<void>` que llame `writer.animateCharacter()` y resuelva al completar (envuelve el callback `onComplete` en una Promise).
- `export function reiniciar(writer: HanziWriter): void`.
- Respeta `prefers-reduced-motion`: si esta activo, muestra el caracter completo sin animar (usa `showCharacter` / `setTimeout(0)`).

Escribe `tests/stroke-animation.test.ts` (jsdom) mockeando el modulo `hanzi-writer` (vi.mock) para verificar que `crearEscritor` llama `HanziWriter.create` con el hanzi dado y que `animarCaracter` resuelve cuando el mock dispara `onComplete`. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E22. Modo quiz de trazado a mano

**commit:** `feat(writing): modo quiz de trazado a mano con feedback`

En la PWA de chino, anade el modo quiz de trazado a mano (la usuaria escribe el caracter con el dedo en el lienzo y hanzi-writer valida cada trazo). Crea `src/modules/writing/stroke-quiz.ts`:

- `export function iniciarQuiz(writer: HanziWriter, cbs: { onTrazoCorrecto?: (n:number)=>void; onTrazoFallo?: (n:number)=>void; onCompletado?: (fallosTotales:number)=>void }): void` que llame `writer.quiz({ showHintAfterMisses: 2, onMistake, onCorrectStroke, onComplete })` (quiz interactivo nativo de hanzi-writer con eventos tactiles/puntero).
- Cuenta fallos por caracter (acumula `onMistake`) y al `onComplete` reporta `fallosTotales` (de `summary.totalMistakes`).
- Feedback visual: trazo correcto -> indicador jade; fallo -> indicador bermellon; tras N fallos hanzi-writer muestra la pista del siguiente trazo (showHintAfterMisses). Usa las clases de `writing.css`.
- Asegura `touch-action: none` en el lienzo para que iOS no robe el gesto.

Escribe `tests/stroke-quiz.test.ts` (jsdom) con el mock de hanzi-writer: simula `onMistake` x2 y `onComplete`, comprueba que se cuentan fallos y que `onCompletado` recibe el total. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E23. Vista de practica por caracter

**commit:** `feat(writing): vista de practica de caracter (animacion + quiz)`

En la PWA de chino, crea `src/modules/writing/writing.view.ts`, la vista de practica de UN caracter que une animacion y quiz. Implementa:

- `export function montarPracticaCaracter(el: HTMLElement, car: CaracterEscritura, onResultado: (r: ResultadoTrazo) => void): void`.
- Renderiza el lienzo (`.escritura-canvas-wrap` con retícula), el pinyin+es (`.escritura-caracter-info`) y los controles: 'Ver animacion' (`animarCaracter`), 'Practicar' (`iniciarQuiz`), 'Borrar'/'Reiniciar'.
- Tras completar el quiz, reproduce el audio de la palabra (TTS via `core/audio`) y llama `onResultado` con `{ caracter, fallos, completado: true }`.
- Para caracteres muy oxidados/nuevos, ofrece 'Ver animacion' antes del quiz (andamiaje).
- Crea el escritor con `crearEscritor`; destruye/limpia al desmontar para evitar fugas.

Escribe `tests/writing-view.test.ts` (jsdom, mock hanzi-writer) que monte la practica, dispare animacion y quiz, y verifique que `onResultado` recibe `completado: true` con los fallos del quiz. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E24. Flujo de leccion y persistencia

**commit:** `feat(writing): flujo de leccion con avance y persistencia`

En la PWA de chino, crea el flujo de leccion completa de escritura. Crea `src/modules/writing/leccion.view.ts`:

- `export function montarLeccion(el: HTMLElement, leccion: LeccionEscritura, onFin: (resultados: ResultadoTrazo[]) => void): void` que recorra los caracteres uno a uno con `montarPracticaCaracter`, mostrando avance en `.escritura-progreso-leccion` (p.ej. '3 / 6').
- Acumula los `ResultadoTrazo` y al terminar llama `onFin`.
- Persiste el progreso: crea `src/modules/writing/writing.store.ts` con `guardarResultadoLeccion(leccionId, resultados)` y `obtenerResultadoLeccion(leccionId)` usando el wrapper de IndexedDB (store `progresoEscritura`). Guarda `fallosEscritura` por caracter (alimentara la dificultad de la tarjeta `writing` del SRS mas adelante).

Escribe `tests/leccion-view.test.ts` (jsdom, mock hanzi-writer) que monte una leccion de 2 caracteres, simule completarlos y verifique avance + `onFin`. Escribe `tests/writing-store.test.ts` (fake-indexeddb) para guardar/recuperar resultados. Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E25. Quiz a ciegas y composicion por radicales

**commit:** `feat(writing): quiz a ciegas y composicion por radicales`

En la PWA de chino, anade dos modos avanzados de escritura (produccion pura y estructura). Crea `src/modules/writing/quiz-ciego.ts` y `src/modules/writing/radicales.ts`:

- `quiz-ciego.ts`: `export function montarQuizCiego(el, car: CaracterEscritura, onResultado): void`. Dado solo pinyin+significado, la usuaria escribe el caracter de memoria SIN contorno (`showOutline: false`, `showCharacter: false`) usando `writer.quiz()`. Tras N fallos, ofrece 'Mostrar pista'. Es produccion pura.
- `radicales.ts`: `export function montarComposicion(el, car: CaracterEscritura, componentes: string[], distractores: string[], onResultado): void`. Muestra los componentes/radicales mezclados con distractores; la usuaria elige los correctos para componer el caracter (estructura, no solo memoria muscular). Feedback jade/bermellon.

Escribe `tests/quiz-ciego.test.ts` (mock hanzi-writer, comprueba que se crea el writer con outline oculto) y `tests/radicales.test.ts` (jsdom, comprueba seleccion correcta/incorrecta de componentes). Verifica con `npm run typecheck`, `npm run test`, `npm run build`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

### E26. Indice de escritura, ruta y conexion con SRS

**commit:** `feat(writing): indice, ruta #/escritura y conexion con SRS`

En la PWA de chino, integra el modulo de escritura en la navegacion y el SRS. Crea `src/modules/writing/index.ts` con `mount(el: HTMLElement)`:

- Indice de lecciones (`cargarLecciones`) como tarjetas 水墨 con titulo, nº de caracteres y progreso (`writing.store`). Al elegir, monta `montarLeccion`; al terminar, pantalla de resumen con fallos por caracter.
- Registra la ruta `#/escritura` en `src/router/routes.ts` con `import()` dinamico (code-splitting).
- Conexion SRS: crea `src/modules/writing/writing-to-srs.ts` con `export async function actualizarTarjetasWriting(resultados: ResultadoTrazo[]): Promise<void>` que, por cada caracter completado, cree/actualice una `TarjetaUsuario` de tipo `writing` guardando `fallosEscritura` para modular la dificultad FSRS (mas fallos -> intervalo mas corto). Usa el scheduler existente.

Escribe `tests/writing-index.test.ts` (jsdom, mocks) que monte el indice con lecciones mockeadas (aparecen las tarjetas) y `tests/writing-to-srs.test.ts` (fake-indexeddb) que verifique creacion/actualizacion de tarjetas `writing` con `fallosEscritura`. Verifica con `npm run typecheck`, `npm run test`, `npm run build`; comprueba `#/escritura` en `npm run dev`.

DISCIPLINA INVIOLABLE: UN commit granular. Espera CI VERDE. JAMAS Claude como co-author.

## Grupo F

### F1. Capa core de Web Speech (TTS) con tipos y stub testeable

**commit:** `feat(audio): motor de sintesis de voz zh-CN con Web Speech API`

Crea el archivo `src/core/audio.ts` que encapsule la sintesis de voz (Web Speech API, NO el reconocimiento ASR) para el resto de la app. Requisitos:

1. Exporta una clase o modulo `SpeechEngine` con metodos puros y testeables:
   - `isSupported(): boolean` -> comprueba `'speechSynthesis' in window` y `typeof SpeechSynthesisUtterance !== 'undefined'`.
   - `getVoices(): SpeechSynthesisVoice[]` -> devuelve `speechSynthesis.getVoices()`.
   - `speak(text: string, opts?: { rate?: number; voice?: SpeechSynthesisVoice; lang?: string }): Promise<void>` -> crea un `SpeechSynthesisUtterance`, fija `lang` por defecto a `'zh-CN'`, aplica `rate` (default leido de settings, fallback 0.9), resuelve la Promise en el evento `onend` y la rechaza en `onerror`. Llama a `speechSynthesis.cancel()` antes de hablar para evitar solapes.
   - `cancel(): void` -> `speechSynthesis.cancel()`.
2. Define en `src/types/audio.ts` los tipos `VozPreferida` y `OpcionesHabla` y reexportalos.
3. Maneja el hecho de que `getVoices()` puede devolver `[]` hasta que dispara `voiceschanged`: expone `onVoicesReady(cb: (voices: SpeechSynthesisVoice[]) => void)` que escucha ese evento una vez y tambien llama al cb si ya hay voces.
4. NO toques aun la UI ni el desbloqueo por gesto (eso viene en prompts siguientes).

Crea `tests/setup.ts` (si no existe) con mocks de `window.speechSynthesis` y `SpeechSynthesisUtterance` para jsdom, y registra `setupFiles: ['tests/setup.ts']` en la config de Vitest dentro de `vite.config.ts`. Anade `src/core/audio.test.ts` con tests de `isSupported`, fallback de `rate` y resolucion de `speak` (simulando `onend`).

Verifica: `npm run typecheck`, `npm run lint`, `npm run test` y `npm run build` en verde.

Disciplina: haz UN commit granular para este cambio, espera a que el CI este VERDE antes de seguir, y JAMAS pongas a Claude como co-author en el commit.

### F2. Seleccion y persistencia de voz zh-CN (preferir Ting-Ting)

**commit:** `feat(audio): seleccion y persistencia de voz zh-CN con preferencia Ting-Ting`

Amplia `src/core/audio.ts` para gestionar la SELECCION de voz zh-CN y persistirla en settings. Requisitos:

1. Anade `listChineseVoices(): SpeechSynthesisVoice[]` que filtre `getVoices()` por `lang` que empiece por `zh` (incluye `zh-CN`, `zh-TW`, `zh-HK`).
2. Anade `pickDefaultVoice(): SpeechSynthesisVoice | undefined` con esta prioridad: (a) voz cuyo `name` contenga 'Ting-Ting' o 'Tingting' (iOS), (b) cualquier `zh-CN`, (c) cualquier `zh`, (d) `undefined`.
3. Lee/escribe la voz elegida en `Settings.voz` (string con el `voiceURI` o `name`) usando el wrapper de `src/core/storage.ts` (localStorage para settings). Si no hay ninguna guardada, usa `pickDefaultVoice()`.
4. `resolveVoice(): SpeechSynthesisVoice | undefined` -> resuelve la voz a usar combinando lo guardado y el fallback, y hazlo robusto a que la lista de voces aun no este cargada (usa `onVoicesReady`).
5. Asegura que `speak()` use `resolveVoice()` cuando no se pase `voice` explicito.

Crea/actualiza el tipo `Settings` en `src/types/` si hace falta el campo `voz`. Anade tests en `src/core/audio.test.ts` para `pickDefaultVoice` (mockea voces con/sin Ting-Ting) y para la persistencia en settings.

Verifica: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` en verde.

Disciplina: UN commit granular, espera CI VERDE antes de continuar, y JAMAS Claude como co-author.

### F3. Desbloqueo de audio por gesto de usuario (iOS Safari)

**commit:** `feat(audio): desbloqueo de TTS por gesto para iOS Safari`

Implementa el desbloqueo del TTS por gesto del usuario, obligatorio en iOS Safari por la politica de autoplay. Requisitos:

1. En `src/core/audio.ts` anade estado `private unlocked = false` y `isUnlocked(): boolean`.
2. Anade `unlock(): void` que, dentro del handler de un gesto (tap), dispare una utterance silenciosa o casi inaudible (texto ' ' o volumen 0) via `speechSynthesis.speak(...)` y marque `unlocked = true`. Esto "calienta" el motor para reproducciones futuras sin gesto directo.
3. Crea `src/ui/components/audioGate.ts` que exporte `mountAudioGate(onUnlocked: () => void): HTMLElement`: un boton/overlay con estetica del proyecto (texto en espanol, p.ej. "Toca para activar el audio 🔊") que al pulsarse llame a `SpeechEngine.unlock()` y luego a `onUnlocked`. Debe poder mostrarse y ocultarse.
4. La logica debe degradar con gracia: si `isSupported()` es false, `mountAudioGate` muestra en su lugar un aviso "Tu navegador no soporta sintesis de voz" y no rompe la app.
5. Documenta con comentario por que iOS exige el gesto y por que NO usamos Web Speech ASR (poco fiable offline en Safari zh-CN).

No conectes aun esto a ningun ejercicio; solo crea la pieza reutilizable. Anade `src/ui/components/audioGate.test.ts` (jsdom) verificando que el click invoca unlock y onUnlocked.

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F4. Control de velocidad (rate) reutilizable

**commit:** `feat(audio): control de velocidad de reproduccion (rate) persistente`

Crea un control de velocidad de reproduccion reutilizable para los ejercicios de escucha. Requisitos:

1. Crea `src/ui/components/rateControl.ts` que exporte `mountRateControl(opts: { initial: number; onChange: (rate: number) => void }): HTMLElement`.
2. UI: un grupo de botones o slider con pasos discretos { 0.6 (lento), 0.8, 1.0 (normal), 1.2 } etiquetados en espanol (Lento / Normal / Rapido). Marca visualmente el activo. Tamano tactil >= 44px.
3. Al cambiar, llama `onChange(rate)` y persiste el valor en `Settings.ttsRate` via `src/core/storage.ts`.
4. El valor inicial debe leerse de `Settings.ttsRate` (fallback 0.9). Expon `getRate(): number`.
5. Conecta conceptualmente: cualquier llamada a `SpeechEngine.speak()` debe poder recibir `rate` desde aqui (no hardcodear). NO crees aun pantallas de ejercicio.

Anade `src/ui/components/rateControl.css` con la estetica del sistema (tokens existentes). Anade `src/ui/components/rateControl.test.ts` verificando que seleccionar un paso llama onChange con el rate correcto y persiste en settings.

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F5. Datos semilla de escucha (silabas, minimal pairs, items)

**commit:** `feat(listening): contenido semilla de silabas, minimal pairs y dictado`

Crea el contenido estatico JSON que alimentara los ejercicios de escucha y tonos. Requisitos:

1. Crea `public/data/listening/syllables.json` con un array de silabas para practica de tonos: cada entrada `{ id, base (pinyin sin tono, p.ej. 'ma'), formas: { t1, t2, t3, t4, t0 } }` donde cada forma es `{ pinyin (con marca tonal, p.ej. 'mā'), hanzi, es }`. Incluye al menos los clasicos: ma (妈/麻/马/骂), yi, shi, bei, tang, mai. Tono neutro (t0) opcional por silaba (puede ser null si no aplica).
2. Crea `public/data/listening/minimalPairs.json`: array de pares minimos de tono `{ id, a: { pinyin, hanzi, es }, b: { pinyin, hanzi, es }, tonoA, tonoB }` (p.ej. mǎi 买 vs mài 卖). Al menos 12 pares reales y utiles HSK5-6.
3. Crea `public/data/listening/dictationItems.json`: array `{ id, hanzi, pinyin, es, nivel }` reutilizando lexemas del contenido semilla del proyecto (经济, 效率, 焦虑, 培养, 平衡, 责任, 矛盾, 谨慎, 显著, 潜力...). Incluye tambien 4-5 FRASES cortas tomadas de los ejemplos de chengyu del contenido semilla.
4. Define en `src/types/listening.ts` los tipos `Syllable`, `MinimalPair`, `DictationItem` y un loader `src/modules/listening/listening.data.ts` que importe/fetchee estos JSON usando `import.meta.env.BASE_URL` (compatible con el base path de GitHub Pages).
5. Verifica que los JSON son validos y que el loader tipa correctamente (sin `any`).

Anade `src/modules/listening/listening.data.test.ts` que valide forma minima de los datos (campos requeridos presentes).

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F6. Ruta y shell del modulo Escucha en el router

**commit:** `feat(listening): ruta y shell del modulo escucha`

Registra el modulo de Escucha en el router hash y crea su shell. Requisitos:

1. En `src/router/routes.ts` anade la ruta `#/escucha` con lazy import (`() => import('../modules/listening/listening.view')`).
2. Crea `src/modules/listening/listening.view.ts` que exporte `mount(el: HTMLElement): void` y renderice un shell con: titulo "Escucha y dictado" (con su hanzi-ancla 听 como marca de agua, estetica del sistema), el `mountAudioGate` (prompt previo) mostrado si el audio no esta desbloqueado, el `mountRateControl`, y un menu con sub-secciones placeholder: "Dictado", "Comprension auditiva", "Tonos", "Pares minimos". De momento cada sub-seccion es un boton que no hace nada o muestra "Proximamente".
3. Crea `src/modules/listening/listening.css` con la estetica (tokens, marca de agua, layout mobile-first respetando safe areas).
4. Anade el icono/tab 听 a la barra de navegacion inferior si existe el componente tabbar; si no existe aun, deja solo la ruta navegable.
5. Asegura que al entrar a `#/escucha` se invoque `SpeechEngine.onVoicesReady` para precargar voces.

Anade `src/modules/listening/listening.view.test.ts` (jsdom) verificando que `mount` inserta el titulo y los 4 botones de sub-seccion.

Verifica: typecheck, lint, test, build en verde. Comprueba que `#/escucha` carga sin errores en consola.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F7. Logica de comparacion de dictado (hanzi/pinyin) sin DOM

**commit:** `feat(listening): logica de correccion de dictado hanzi/pinyin`

Crea la logica pura de correccion del ejercicio de dictado, totalmente testeable y sin DOM. Requisitos:

1. Crea `src/modules/listening/dictation.logic.ts` con:
   - `normalizePinyin(input: string): string` -> minusculas, quita espacios sobrantes, convierte marcas tonales a numeros opcionalmente (acepta tanto 'mǎi' como 'mai3' como 'mai'), elimina puntuacion. Define una tabla de mapeo acentos->base+numero.
   - `compareHanzi(expected: string, got: string): { correcto: boolean; diff: Array<{ char: string; ok: boolean }> }` -> compara caracter a caracter ignorando espacios, devolviendo un diff por caracter para resaltar diferencias.
   - `comparePinyin(expected: string, got: string): { correcto: boolean }` -> compara tras normalizar; acepta con o sin tonos pero marca como "casi" (campo `tonoOmitido: boolean`) si coincide la base pero falta el tono.
   - `evaluateDictation(item: DictationItem, modo: 'hanzi'|'pinyin', input: string)` -> orquesta lo anterior y devuelve un resultado unificado.
2. NO toques la vista todavia.

Anade `src/modules/listening/dictation.logic.test.ts` con casos: hanzi exacto, hanzi con un caracter mal (diff correcto), pinyin con tono, pinyin sin tono (tonoOmitido true), pinyin con numero de tono, entradas con espacios/mayusculas.

Verifica: typecheck, lint, test, build en verde. Prioriza cobertura alta de este archivo (es logica critica).

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F8. Ejercicio de dictado: oye y escribe

**commit:** `feat(listening): ejercicio de dictado oye-y-escribe con feedback`

Implementa la vista del ejercicio de DICTADO conectando TTS + logica de correccion. Requisitos:

1. Crea `src/modules/listening/dictation.view.ts` con `mount(el, opts?: { modo?: 'hanzi'|'pinyin' })`.
2. Flujo: toma items de `listening.data.ts` (`dictationItems.json`), reproduce el item con `SpeechEngine.speak(item.hanzi/frase, { rate: getRate() })`. Muestra: boton "Repetir audio 🔊", un `<input>` (teclado nativo del iPhone; para pinyin un input de texto, para hanzi el usuario usa teclado pinyin del sistema), boton "Comprobar".
3. Al comprobar, usa `evaluateDictation` (prompt previo). Feedback: si acierto, confirmacion jade + reproduce audio de refuerzo; si fallo, muestra hanzi + pinyin con tonos + es + diff por caracter resaltado (rojo bermellon donde difiere) + ejemplo si existe. Microcopy de reactivacion ("Ahi estaba. Lo tenias guardado.").
4. Selector de modo hanzi/pinyin en la cabecera. Boton "Siguiente".
5. Respeta `prefers-reduced-motion` para feedback animado.
6. Conecta el sub-boton "Dictado" del shell (`listening.view.ts`) para montar esta vista.

Usa solo `import()` dinamico desde el shell para code-splitting. Anade `src/modules/listening/dictation.view.test.ts` (jsdom, mock de SpeechEngine) verificando que tras escribir el hanzi correcto se muestra feedback de acierto.

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F9. Comprension auditiva con preguntas

**commit:** `feat(listening): comprension auditiva con preguntas y transcripcion`

Implementa el ejercicio de COMPRENSION AUDITIVA. Requisitos:

1. Crea `public/data/listening/comprehension.json`: array `{ id, audioTexto (frases en hanzi que el TTS leera), nivel, preguntas: [{ enunciado, opciones[], correcta (indice), explicacion }] }`. Usa 3-4 items basados en los mini-textos del contenido semilla (塞翁失马 / 内卷) recortados a fragmentos cortos. Tipa en `src/types/listening.ts` como `ComprehensionItem`.
2. Crea `src/modules/listening/comprehension.logic.ts` con `gradeAnswer(item, preguntaIdx, opcionIdx): { correcto, explicacion }` (puro, testeable).
3. Crea `src/modules/listening/comprehension.view.ts` con `mount(el)`: reproduce el `audioTexto` via `SpeechEngine.speak` a la velocidad del rateControl (idealmente empezar lento), botones "Reproducir" y "Reproducir mas lento" (rate 0.6). Tras escuchar, muestra las preguntas de opcion multiple (tap). Al responder, feedback con la explicacion citando el fragmento. El texto en hanzi se oculta por defecto y hay un boton "Mostrar transcripcion" (forzar escucha primero).
4. Conecta el sub-boton "Comprension auditiva" del shell.

Anade `src/modules/listening/comprehension.logic.test.ts` cubriendo respuesta correcta/incorrecta y la explicacion devuelta.

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F10. Visualizacion del contorno tonal (SVG)

**commit:** `feat(ui): visualizacion svg del contorno de los tonos`

Crea un componente SVG reutilizable que dibuje el CONTORNO de cada tono del mandarin. Requisitos:

1. Crea `src/ui/components/toneContour.ts` que exporte `renderToneContour(tono: 1|2|3|4|0, opts?: { width?: number; height?: number; animate?: boolean }): SVGElement`.
2. Contornos (escala Chao 5=alto, 1=bajo) como `<path>`:
   - Tono 1 (alto plano 55): linea horizontal arriba.
   - Tono 2 (ascendente 35): sube de medio a alto.
   - Tono 3 (descendente-ascendente 214): baja y vuelve a subir (forma de V).
   - Tono 4 (descendente 51): baja brusco de alto a bajo.
   - Tono 0 (neutro): punto/linea corta a media altura, mas tenue.
3. Estetica: trazo de pincel bermellon (token `--accent`), con entrada fina y panza (puedes usar `stroke-linecap: round`). Si `animate` y NO `prefers-reduced-motion`, anima el trazado con `stroke-dasharray`/`stroke-dashoffset` (el contorno "se pinta").
4. Sin dependencias externas; SVG inline.

Anade `src/ui/components/toneContour.test.ts` verificando que para cada tono se genera un `<path>` con `d` no vacio y que tono neutro tiene clase/estilo distinto.

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F11. Logica del ejercicio de identificacion de tonos

**commit:** `feat(listening): logica de identificacion de tonos`

Crea la logica pura del ejercicio de TONOS, sin DOM. Requisitos:

1. Crea `src/modules/listening/tones.logic.ts` con:
   - `tonoDePinyin(pinyin: string): 1|2|3|4|0` -> deriva el tono de una silaba con marca tonal (ā=1, á=2, ǎ=3, à=4, sin marca=0). Maneja vocales con diacriticos y la regla de colocacion (a/e/o/i/u/ü).
   - `buildToneQuiz(syllable: Syllable): { prompt: Syllable; formaCorrecta; opciones: Array<1|2|3|4|0> }` -> elige una forma al azar (con seed inyectable para tests) de las disponibles y arma 4-5 opciones de tono.
   - `gradeTone(elegido, correcto): { correcto: boolean }`.
2. Inyecta el RNG como parametro opcional para tests deterministas.

Anade `src/modules/listening/tones.logic.test.ts`: prueba `tonoDePinyin` con mā/má/mǎ/mà/ma, lü/lǘ, y `buildToneQuiz` con seed fija (opciones incluyen el correcto).

Verifica: typecheck, lint, test, build en verde. Alta cobertura aqui.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F12. Ejercicio: practica de los 4 tonos + neutro

**commit:** `feat(listening): ejercicio de practica de los 4 tonos y neutro`

Implementa la vista del ejercicio de TONOS conectando audio, contorno y logica. Requisitos:

1. Crea `src/modules/listening/tones.view.ts` con `mount(el)`.
2. Flujo: toma una `Syllable` de `syllables.json`, usa `buildToneQuiz` para elegir una forma y reproducela con `SpeechEngine.speak(forma.hanzi)` a la velocidad del rateControl. Muestra 5 botones de tono (1°/2°/3°/4°/neutro) con su `renderToneContour` correspondiente dentro de cada boton.
3. Al responder: si acierto, marca jade + reproduce de nuevo + muestra hanzi/pinyin/es; si fallo, micro-shake (respetando reduce-motion) y reproduce EN CONTRASTE las distintas formas tonales de esa silaba (recalibrar el oido), resaltando el contorno correcto.
4. Boton "Repetir audio" y "Siguiente".
5. Conecta el sub-boton "Tonos" del shell.

Anade `src/modules/listening/tones.view.test.ts` (jsdom, mock SpeechEngine, RNG con seed) verificando que aparecen 5 botones de tono y que elegir el correcto da feedback de acierto.

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F13. Ejercicio de pares minimos de tono

**commit:** `feat(listening): ejercicio de pares minimos de tono`

Implementa el ejercicio de PARES MINIMOS de tono (discriminacion fina). Requisitos:

1. Crea `src/modules/listening/minimalPairs.logic.ts` (puro): `buildPairQuiz(pair: MinimalPair, rng?)` -> elige al azar cual de las dos formas (a/b) suena, devuelve `{ sonido: 'a'|'b', opciones: [a, b] }`; y `gradePair(elegido, sonido)`.
2. Crea `src/modules/listening/minimalPairs.view.ts` con `mount(el)`: reproduce la forma elegida con `SpeechEngine.speak(forma.hanzi)`, muestra las DOS opciones (hanzi + pinyin + es + su `renderToneContour`), la usuaria toca la que cree haber oido. Feedback: acierto jade; fallo -> reproduce ambas formas en contraste y resalta la diferencia tonal con los contornos.
3. Boton "Repetir" y "Siguiente par". Itera sobre `minimalPairs.json`.
4. Conecta el sub-boton "Pares minimos" del shell.

Anade `src/modules/listening/minimalPairs.logic.test.ts` (con RNG seed) verificando que el quiz incluye ambas formas y la calificacion correcta/incorrecta.

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F14. Audio -> opcion multiple (reconexion, baja friccion)

**commit:** `feat(listening): ejercicio audio a opcion multiple para reconexion`

Implementa el ejercicio AUDIO -> OPCION MULTIPLE de hanzi, mas facil que el dictado, para la fase de reconexion. Requisitos:

1. Crea `src/modules/listening/audioChoice.logic.ts` (puro): `buildAudioChoiceQuiz(item: DictationItem, pool: DictationItem[], rng?)` -> elige 3 distractores del pool (preferentemente del mismo nivel/campo semantico) y arma 4 opciones de hanzi con el correcto; `gradeAudioChoice(elegidoIdx, correctoIdx)`.
2. Crea `src/modules/listening/audioChoice.view.ts` con `mount(el)`: reproduce `item` con TTS, muestra 4 tarjetas hanzi (tap). Feedback: acierto jade + audio refuerzo; fallo -> resalta el correcto y reproduce su audio, muestra pinyin/es.
3. Anade un sub-boton "Audio -> opcion" al shell `listening.view.ts` (5a sub-seccion) y conectalo.
4. Reutiliza `dictationItems.json` como pool.

Anade `src/modules/listening/audioChoice.logic.test.ts` (RNG seed) verificando 4 opciones unicas que incluyen el correcto y la calificacion.

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F15. Shadowing ligero (auto-reportado, sin ASR)

**commit:** `feat(listening): shadowing ligero auto-reportado sin ASR`

Implementa el ejercicio de SHADOWING ligero, honesto con la limitacion tecnica (NO usamos ASR para zh-CN en iOS). Requisitos:

1. Crea `src/modules/listening/shadowing.view.ts` con `mount(el)`: muestra una frase (de `dictationItems.json` o de los textos semilla), boton "Escuchar 🔊" (TTS), un breve aviso en espanol explicando que ella debe repetir en voz alta y AUTO-EVALUARSE (no hay correccion automatica de pronunciacion). Tras escuchar, botones de auto-reporte: "Me costo" / "Bien" / "Perfecto".
2. El auto-reporte se guarda como un evento simple (puede registrar progreso ligero via `src/core/storage.ts`), pero NO afecta al SRS de forma critica (es practica subjetiva). Incluye boton "Reproducir mas lento" (rate 0.6) y "Siguiente".
3. Anade comentario tecnico claro: por que no hay reconocimiento de voz (Web Speech ASR poco fiable/online en Safari zh-CN).
4. Anade un sub-boton "Shadowing" al shell y conectalo.

Anade `src/modules/listening/shadowing.view.test.ts` (jsdom, mock SpeechEngine) verificando que el boton Escuchar invoca speak y que los 3 botones de auto-reporte existen.

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F16. Manejo de no disponibilidad de Web Speech y fallbacks

**commit:** `fix(listening): fallbacks robustos ante Web Speech no disponible`

Endurece el modulo de escucha frente a navegadores/dispositivos sin Web Speech o sin voces zh. Requisitos:

1. En `listening.view.ts` y todas las sub-vistas, comprueba `SpeechEngine.isSupported()` al montar. Si NO esta soportado: muestra un banner en espanol explicando la limitacion y DESHABILITA (no ocultes silenciosamente) los botones de reproduccion, dejando visibles hanzi+pinyin como modo de respaldo (los ejercicios de comprension/dictado siguen siendo usables leyendo el texto). 
2. Si `isSupported()` pero `listChineseVoices().length === 0` (no hay voz zh instalada): muestra aviso "No se encontro una voz china; el audio puede sonar incorrecto" y permite continuar usando la voz por defecto.
3. Si el audio no esta desbloqueado (`isUnlocked()` false), el primer tap de cualquier boton de reproduccion debe llamar `unlock()` y luego reproducir, sin obligar a un paso extra (mejora UX iOS).
4. Centraliza estos chequeos en un helper `src/modules/listening/audioAvailability.ts` (`getAudioStatus(): { soportado, hayVozZh, desbloqueado }`) y reutilizalo en las vistas.

Anade `src/modules/listening/audioAvailability.test.ts` cubriendo los 3 estados (mockeando `speechSynthesis` ausente, voces vacias, y normal).

Verifica: typecheck, lint, test, build en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

### F17. Integracion de escucha con SRS y barra de progreso del modulo

**commit:** `feat(listening): integracion con SRS y progreso del modulo escucha`

Cierra el modulo conectando los resultados de escucha al SRS y mostrando progreso. Requisitos:

1. Genera/actualiza tarjetas FSRS de tipo `listening`, `dictation` y `tone` cuando la usuaria responde en los ejercicios: al acertar/fallar, llama al scheduler de `src/core/srs/scheduler.ts` con el `lexemaId` correspondiente y el grado FSRS derivado (acierto rapido = Easy/Good, acierto lento por latencia = Hard, fallo = Again). Usa la latencia medida en cada ejercicio.
2. Respeta el modelo: clave de tarjeta `${lexemaId}:${tipo}`. Para tonos, usa el id de la silaba como base. No crees tarjetas duplicadas.
3. Anade una mini barra de progreso/sello del dia en `listening.view.ts` que muestre cuantos items de escucha repasados hoy (lee del log de reviews / progreso).
4. Asegura que toda llamada async (speak, storage, scheduler) tenga manejo de errores y no genere floating promises (regla `no-floating-promises`).
5. Revisa que el code-splitting sigue: el modulo escucha y sus sub-vistas se cargan via `import()` dinamico.

Anade tests en `src/modules/listening/*.test.ts` (o uno nuevo `listening.srs.test.ts`) mockeando el scheduler y verificando que un acierto de dictado invoca el scheduler con el grado correcto segun latencia.

Verifica: typecheck, lint, test, build en verde, y revisa que Lighthouse PWA/a11y siga en verde.

Disciplina: UN commit granular, espera CI VERDE, y JAMAS Claude como co-author.

## Grupo G

### G1. Capa de stats: agregacion de reviews desde IndexedDB

**commit:** `feat(progress): capa de agregacion de stats desde reviews (logica pura + tests)`

Contexto: PWA Vite + TypeScript vanilla para practicar chino. Ya existen `src/core/storage.ts` (wrapper IndexedDB con stores de `TarjetaUsuario`, `LogReview`, `PerfilUsuario`) y el motor FSRS en `src/core/srs/`. Vas a construir la capa de datos del modulo de progreso, SIN tocar DOM todavia.

Crea `src/modules/progress/progress.logic.ts` con funciones puras (testeables) que reciben arrays de `LogReview` y `TarjetaUsuario` (no leen IndexedDB directamente; el caller inyecta los datos):
- `reviewsPorDia(logs: LogReview[]): Map<string, number>` -> agrupa por fecha 'YYYY-MM-DD' (en zona horaria local) y cuenta reviews.
- `calcularRacha(diasActivos: string[], hoy: string): { actual: number; maxima: number }` -> racha consecutiva actual (cuenta hoy o ayer como vivo) y racha maxima historica.
- `dominioPorModulo(tarjetas: TarjetaUsuario[]): Record<TipoTarjeta, { total: number; maduras: number; retencionMedia: number }>` -> agrupa por `tipo`, considera 'madura' una tarjeta con `fsrs.stability >= 21`, y calcula retencion media usando `fsrs.stability` y `fsrs.elapsed_days` con la formula de retrievability de FSRS (R = (1 + FACTOR * t/S)^DECAY, con FACTOR=19/81, DECAY=-0.5).
- `totalesGlobales(logs, tarjetas)` -> { totalReviews, tarjetasActivas, aciertoGlobal } donde acierto = proporcion de logs con grado>=3.

Crea `src/modules/progress/progress.data.ts` con `cargarDatosProgreso()` async que lee de `storage.ts` los logs y tarjetas y devuelve los agregados llamando a las funciones puras.

Crea `tests/progress.logic.test.ts` (Vitest) con casos para racha (incluyendo huecos, racha que termino ayer, racha que sigue hoy), agregacion por dia con varios timestamps el mismo dia, y dominio por modulo con tarjetas nuevas vs maduras. Usa fixtures inline.

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build` en verde. Recuerda: commit granular, espera CI verde antes de seguir, y JAMAS pongas a Claude como co-author.

### G2. Vista de progreso: shell, ruta y tarjetas de resumen

**commit:** `feat(progress): vista de resumen con racha, totales y acierto`

Contexto: PWA de chino, router hash en `src/router/`. Ya existe `src/modules/progress/progress.data.ts` con `cargarDatosProgreso()`. Vas a montar la vista del modulo Progreso.

Crea `src/modules/progress/progress.view.ts` que exporte `mount(el: HTMLElement)`. Al montar: llama a `cargarDatosProgreso()`, muestra un estado de carga (skeleton 水墨), y luego renderiza una cabecera con el hanzi-ancla 进 como marca de agua (`opacity:.04`, posicion absoluta) y tres tarjetas de resumen: Racha actual (con dias), Total de reviews, Acierto global (%). Usa `font-variant-numeric: tabular-nums` para los numeros.

Crea `src/modules/progress/progress.css` con estilos usando exclusivamente los tokens de `src/styles/tokens.css` (--bg-elevated, --text, --jade, --accent, --gold para hairlines). Tarjetas tipo album de caligrafia: esquinas en L de oro mate (1px), nada de borde completo.

Registra la ruta `#/progreso` en `src/router/routes.ts` con lazy `import()` del modulo (code-splitting). Anade su entrada a la barra inferior si existe (icono 进).

Maneja el caso sin datos (usuaria nueva): mensaje amable en espanol invitando a hacer una sesion, nunca un cero frio.

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build`; abre `npm run dev` y comprueba que `#/progreso` monta sin errores en consola. Recuerda: commit granular, esperar CI verde, y JAMAS Claude como co-author.

### G3. Heatmap de actividad estilo calendario (SVG)

**commit:** `feat(progress): heatmap de actividad en SVG con escala jade`

Contexto: PWA de chino. Ya tienes `src/modules/progress/progress.logic.ts` con `reviewsPorDia()` y la vista `progress.view.ts`. Vas a anadir un heatmap de actividad de las ultimas ~17 semanas (estilo GitHub) en SVG inline, sin librerias.

Crea `src/modules/progress/heatmap.ts` que exporte `renderHeatmap(reviewsPorDia: Map<string,number>, hoy: Date): SVGElement`. Dibuja una rejilla de celdas (7 filas = dias de la semana, columnas = semanas), cada celda un `<rect>` con `rx` pequeno. Escala de color en 5 niveles desde `--bg-sunken` (0 reviews) a `--jade` saturado (maximo), calculando umbrales por cuantiles. Cada celda lleva `<title>` accesible con 'N repasos el YYYY-MM-DD'. Etiquetas de mes arriba en `--text-faint`, `--fs-caption`.

Integra el heatmap en `progress.view.ts` bajo las tarjetas de resumen, dentro de un contenedor con scroll horizontal en movil (`overflow-x:auto`, `touch-action: pan-x`).

Accesibilidad: el SVG con `role="img"` y `aria-label` resumiendo 'Actividad de los ultimos N dias'. Respeta `prefers-reduced-motion` (sin transiciones de aparicion si esta activo).

Verifica: `npm run typecheck && npm run lint && npm run build`; en `npm run dev` comprueba que el heatmap refleja datos de prueba. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G4. Grafica radar de dominio por modulo (SVG)

**commit:** `feat(progress): grafica radar de dominio por modulo reutilizable`

Contexto: PWA de chino. Tienes `dominioPorModulo()` en `progress.logic.ts` y la vista de progreso. Vas a anadir un radar de 4-6 ejes que muestre el dominio por tipo de tarjeta (recognition, production, listening, tone, dictation, writing), reutilizable tambien para el diagnostico.

Crea `src/ui/components/radar.ts` que exporte `renderRadar(ejes: Array<{ label: string; valor: number }>, opts?): SVGElement` donde `valor` esta en 0..1. Dibuja: poligono de rejilla de fondo (--surface-line), poligono de datos relleno con `--jade` a baja opacidad y borde solido, puntos en vertices, y etiquetas en espanol en cada eje (--text-muted). Sin dependencias; calcula coordenadas con trigonometria. `role="img"` + `aria-label` describiendo los valores por eje.

En `progress.view.ts`, mapea `dominioPorModulo()` a porcentajes de retencion media por modulo y renderiza el radar bajo el heatmap, con titulo 'Dominio por modulo' y un trazo de pincel bermellon de subrayado (reusa el motivo de `src/styles/motifs.css` si existe).

Si un modulo no tiene tarjetas, omitelo del radar (no muestres ejes vacios).

Verifica: `npm run typecheck && npm run lint && npm run build`; visualmente en dev. Crea `tests/radar.test.ts` que verifique que `renderRadar` produce el numero correcto de vertices y un `aria-label` no vacio (usa jsdom). Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G5. Metas diarias y anillo de progreso del dia

**commit:** `feat(progress): meta diaria configurable con anillo de progreso`

Contexto: PWA de chino. Existe `Settings` (en localStorage via `storage.ts`) y `progress.logic.ts`. Vas a anadir el concepto de meta diaria de reviews y un anillo de progreso.

1) Anade a `Settings` el campo `metaDiariaReviews: number` (default 20) y asegura su lectura/escritura en la capa de settings. Si el tipo `Settings` vive en `src/types/`, actualizalo alli.
2) Crea `src/ui/components/anillo.ts` con `renderAnillo(actual: number, meta: number): SVGElement`: un anillo SVG (dos `<circle>`, fondo --bg-sunken y progreso --accent) usando `stroke-dasharray`/`stroke-dashoffset` para el porcentaje (capado al 100%). Texto central 'actual / meta'. Al alcanzar la meta, el anillo se tine de `--jade` y muestra un mini-sello ✓. `role="img"` + `aria-label` 'Meta diaria: X de Y repasos'.
3) En `progress.view.ts`, calcula los reviews de hoy con `reviewsPorDia()` y muestra el anillo arriba del todo.
4) Respeta `prefers-reduced-motion`: sin animacion de llenado, el anillo aparece ya en su valor.

Crea `tests/anillo.test.ts` validando el calculo del offset y el clamp al 100%.

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build`. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G6. Catalogo de logros con estetica de sellos (definicion + evaluacion)

**commit:** `feat(progress): catalogo de logros y evaluacion (logica pura + tests)`

Contexto: PWA de chino. El `PerfilUsuario` tiene `sellosGanados: string[]`. Vas a crear el sistema de logros (sellos 印章), separando definicion/evaluacion (puro) de la presentacion.

Crea `src/modules/progress/logros.ts` con:
- Tipo `Logro = { id: string; titulo: string; descripcion: string; hanzi: string; condicion: (ctx: ContextoLogros) => boolean }`.
- `ContextoLogros` = { rachaActual, rachaMaxima, totalReviews, tarjetasMaduras, diagnosticoHecho, chengyuDominados, reviewsHoy, metaCumplidaHoy }.
- Un array `LOGROS` con al menos 10 logros reales y bien tematizados: p.ej. 'Primer trazo' (1 review), 'Reconexion' (diagnostico hecho), 'Siete dias' (racha 7), 'Tinta constante' (racha 30), 'Mil repasos' (1000 reviews), 'Maestro de chengyu' (10 chengyu dominados con stability>=21), 'Meta del dia', etc. Cada uno con su `hanzi` para el sello.
- `evaluarLogros(ctx: ContextoLogros, yaGanados: string[]): Logro[]` -> devuelve los logros recien desbloqueados (cumplen condicion y no estaban en yaGanados).

Crea `tests/logros.test.ts` cubriendo desbloqueo (cruza varios contextos) y que no se re-desbloquean los ya ganados.

NO toques aun la UI ni la persistencia; eso va en el siguiente prompt. Mantenlo puro y exportable.

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build`. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G7. Galeria de sellos y desbloqueo en sesion

**commit:** `feat(progress): galeria de sellos y notificacion de desbloqueo`

Contexto: PWA de chino. Tienes `src/modules/progress/logros.ts` (LOGROS + evaluarLogros) y el motivo de sello en SVG. Vas a integrar logros en la app: persistencia, galeria y notificacion de desbloqueo.

1) Crea `src/ui/components/sello.ts` con `renderSello(hanzi: string, opts?: { ganado: boolean }): SVGElement`: cuadrado bermellon con esquinas `rx` pequenas y textura de borde sutil (feTurbulence + feDisplacementMap), hanzi en blanco (白文). Si `ganado=false`, render en gris (--ink-300) con opacidad reducida (sello sin estampar).
2) En `progress.view.ts` anade una seccion 'Sellos' con una rejilla de todos los LOGROS; los ganados a color, los pendientes apagados, cada uno con `<title>`/tooltip de descripcion.
3) Crea `src/modules/progress/logros.service.ts` con `comprobarYGuardarLogros()`: construye el `ContextoLogros` desde storage, llama a `evaluarLogros`, persiste los nuevos en `PerfilUsuario.sellosGanados`, y devuelve los recien ganados.
4) Crea `src/ui/components/sello-toast.ts` que muestre una animacion de sello que cae (WAAPI con `cubic-bezier(.34,1.56,.64,1)`, micro-shake) cuando se desbloquea un logro; respeta `prefers-reduced-motion` (solo fade).
5) Llama a `comprobarYGuardarLogros()` al finalizar una sesion de repaso (en el flujo de vocab/diagnostico, donde se cierran reviews) y dispara el toast por cada logro nuevo.

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build`; en dev fuerza un logro y comprueba el toast. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G8. Modulo de Ajustes: shell, ruta y persistencia

**commit:** `feat(settings): modulo de ajustes con sheet, ruta y persistencia base`

Contexto: PWA de chino. `Settings` se persiste en localStorage (capa en `src/core/` o `storage.ts`). Vas a crear el modulo de Ajustes como hoja modal accesible desde la barra/cabecera.

Crea `src/modules/settings/settings.view.ts` con `mount(el)` que renderiza un formulario de ajustes leyendo los valores actuales de `Settings` y guardando cada cambio inmediatamente (debounce 200ms para los sliders). Estructura en secciones con cabeceras: Apariencia, Lectura, Audio, Datos. De momento incluye solo placeholders de cada control (los implementaremos en prompts siguientes) salvo `mostrarPinyinSiempre` (toggle) que ya debe funcionar y persistir.

Crea `src/modules/settings/settings.css` usando tokens. Registra la ruta `#/ajustes` en `routes.ts` con lazy import. Presenta la vista como sheet que sube desde abajo (`translateY(100%)->0`, --ease-brush, ~300ms), con grabber arriba, respetando `--safe-bottom`, cierre por swipe-down o tap en backdrop. Respeta `prefers-reduced-motion`.

Crea `src/core/settings.ts` (si no existe) con `getSettings()`, `updateSettings(partial)` y `DEFAULT_SETTINGS`, emitiendo un evento via el bus (`src/core/events.ts`) `settings:changed` al actualizar, para que otras vistas reaccionen.

Crea `tests/settings.test.ts` validando merge de defaults y persistencia (mock de localStorage).

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build`. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G9. Ajuste de tema claro/oscuro con toggle

**commit:** `feat(settings): toggle de tema auto/claro/oscuro con theme-color`

Contexto: PWA de chino. `tokens.css` ya define tokens para claro y `@media (prefers-color-scheme: dark)` y soporta override con `[data-theme]`. Vas a anadir control de tema en Ajustes.

1) Anade a `Settings` el campo `tema: 'auto' | 'light' | 'dark'` (default 'auto').
2) Asegura que `tokens.css` tiene bloques completos `[data-theme="light"]` y `[data-theme="dark"]` con TODOS los tokens semanticos (no solo color-scheme). Corrige cualquier placeholder pendiente (p.ej. el valor de --gold oscuro debe ser #cdaa6a).
3) Crea `src/core/theme.ts` con `aplicarTema(tema)` que: si 'auto' elimina `data-theme` del `<html>` (deja decidir al sistema), si no, lo fija; y actualiza el `<meta name="theme-color">` activo (#f6efe1 claro / #16150f oscuro). Llama a `aplicarTema` en el arranque (`main.ts`) leyendo Settings, y suscribete a `settings:changed`.
4) En `settings.view.ts` anade un control segmentado (Auto / Claro / Oscuro) con `role="radiogroup"` y `aria-checked`, que actualice Settings.

Verifica: `npm run typecheck && npm run lint && npm run build`; en dev alterna los tres modos y confirma que persiste tras recargar y que el theme-color cambia. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G10. Ajuste de tamano de fuente global

**commit:** `feat(settings): control de tamano de fuente global`

Contexto: PWA de chino. La tipografia usa `rem` con base 17px y `--fs-*` en `src/styles/typography.css`. Vas a permitir que la usuaria ajuste el tamano global (util si esta leyendo textos densos).

1) Anade a `Settings` `escalaFuente: number` con valores discretos permitidos { 0.9, 1.0, 1.1, 1.25 } (default 1.0).
2) En `src/core/theme.ts` (o un nuevo `src/core/typography-scale.ts`) crea `aplicarEscalaFuente(escala)` que fija `document.documentElement.style.fontSize = (17 * escala) + 'px'`, de modo que todo lo definido en `rem` escale proporcionalmente. Llamala al arrancar y al cambiar Settings.
3) En `settings.view.ts`, seccion Lectura, anade un control con 4 botones (Pequena / Normal / Grande / Muy grande) marcando el activo con `aria-pressed`. Muestra una linea de previsualizacion con hanzi+pinyin que reaccione en vivo.
4) Verifica que la barra de navegacion y los controles tactiles siguen >=48px tras escalar (no deben romperse en 1.25).

Verifica: `npm run typecheck && npm run lint && npm run build`; en dev prueba las 4 escalas y recarga para confirmar persistencia. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G11. Ajuste de voz TTS y velocidad

**commit:** `feat(settings): seleccion de voz TTS y velocidad con prueba`

Contexto: PWA de chino. `src/core/audio.ts` usa Web Speech API (synthesis) con voz zh-CN (Ting-Ting en iOS). `Settings` tiene `ttsRate` y `voz`. Vas a exponer su configuracion.

1) En `src/core/audio.ts` asegura/expon: `listarVocesChinas(): SpeechSynthesisVoice[]` (filtra `voice.lang` que empiece por 'zh'), y que `hablar(texto)` use `Settings.ttsRate` y la voz cuyo `voiceURI`/`name` coincida con `Settings.voz` (fallback a la primera zh disponible). Ojo: `getVoices()` puede estar vacio hasta el evento `voiceschanged`; maneja ambos casos con una promesa.
2) En `settings.view.ts`, seccion Audio: un `<select>` poblado con las voces chinas disponibles (etiqueta nombre + lang), un slider de velocidad (0.7 a 1.2, paso 0.05) que actualice `ttsRate`, y un boton 'Probar voz' que pronuncie una frase de ejemplo ('你好，我们一起练习中文吧') con los ajustes actuales. Recuerda la politica de autoplay de iOS: la reproduccion debe nacer de ese tap.
3) Si no hay voces zh disponibles (algunos navegadores), muestra un aviso amable en espanol y deshabilita el select.

Crea `tests/audio.test.ts` mockeando `window.speechSynthesis` y `SpeechSynthesisUtterance` (en `tests/setup.ts`) para verificar `listarVocesChinas` y que `hablar` aplica rate/voz.

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build`. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G12. Ajuste de reduce-motion (override manual)

**commit:** `feat(settings): override manual de reduce-motion`

Contexto: PWA de chino. Las animaciones respetan `@media (prefers-reduced-motion: reduce)` en `src/styles/animations.css`. Vas a permitir un override manual desde Ajustes (independiente del sistema).

1) Anade a `Settings` `reducirMovimiento: 'auto' | 'on' | 'off'` (default 'auto').
2) En `src/styles/animations.css` (o base.css) anade un selector que tambien neutralice animaciones cuando exista `html[data-motion="reduce"]`, replicando el bloque de reduce-motion existente. Documenta que 'auto' delega en el media query del sistema.
3) Crea/expande `src/core/motion.ts` con `aplicarMovimiento(modo)`: 'on' -> set `data-motion="reduce"`, 'off' -> set `data-motion="full"` (y un selector que fuerce animaciones aunque el sistema pida reduce, con cuidado), 'auto' -> elimina el atributo. Y `prefiereReducir(): boolean` que combine Settings + media query para que el codigo JS (splash, toasts, WAAPI) decida si animar.
4) Refactoriza splash y `sello-toast.ts` para consultar `prefiereReducir()` en vez de leer el media query directamente.
5) En `settings.view.ts` anade el control segmentado (Auto / Reducir / Completo) con ARIA.

Verifica: `npm run typecheck && npm run lint && npm run build`; en dev confirma que 'Reducir' desactiva el flip de tarjetas y el toast de sello. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G13. Backup/exportar e importar datos (JSON)

**commit:** `feat(settings): backup export/import de datos en JSON`

Contexto: PWA de chino. En iOS Safari, IndexedDB puede ser evictada tras ~7 dias de inactividad (ITP), asi que el backup manual es critico. Vas a implementar export/import de todo el estado del usuario.

Crea `src/core/backup.ts` con:
- `exportarDatos(): Promise<string>` -> lee de IndexedDB todas las `TarjetaUsuario`, `LogReview`, `ProgresoLectura` y de localStorage `PerfilUsuario` y `Settings`; devuelve un JSON serializado con `{ version: <dbVersion>, exportadoEn: <iso>, datos: {...} }`.
- `importarDatos(json: string): Promise<{ tarjetas: number; reviews: number }>` -> valida el shape (comprueba `version` y claves esperadas), y si es valido reemplaza el estado (con confirmacion previa que maneja el caller). Lanza error claro si el JSON es invalido o de version incompatible.

En `settings.view.ts`, seccion Datos:
- Boton 'Exportar copia de seguridad' -> genera el JSON, crea un Blob `application/json` y dispara descarga con nombre `chino-backup-YYYY-MM-DD.json` (usa un `<a download>` + `URL.createObjectURL`).
- Boton 'Importar copia' -> `<input type="file" accept="application/json">`; al elegir, lee el archivo, pide confirmacion ('Esto reemplazara tu progreso actual'), llama a `importarDatos`, y al terminar muestra un toast con el resumen y recarga la vista de progreso.

Crea `tests/backup.test.ts` (con `fake-indexeddb`) que verifique round-trip: exportar -> importar -> mismos datos, y rechazo de un JSON con version incompatible.

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build`. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G14. Reset de datos con doble confirmacion

**commit:** `feat(settings): reset de datos con doble confirmacion`

Contexto: PWA de chino. Tienes `src/core/backup.ts` y la seccion Datos de Ajustes. Vas a anadir un reset completo seguro.

1) En `src/core/storage.ts` (o `backup.ts`) anade `borrarTodo(): Promise<void>` que vacie todos los object stores de IndexedDB y elimine las claves `PerfilUsuario` y `Settings` de localStorage (deja intacto el flag de splash de sessionStorage). Tras borrar, restablece `Settings` a `DEFAULT_SETTINGS`.
2) En `settings.view.ts`, seccion Datos, anade un boton 'Restablecer todo' en color `--error`, claramente separado. Al pulsarlo abre un dialogo de doble confirmacion: primero un sheet que recomienda exportar antes (con boton directo a exportar), y solo si la usuaria confirma de nuevo escribiendo o pulsando 'Si, borrar todo' se ejecuta `borrarTodo()`.
3) Tras el reset, redirige a `#/onboarding` o `#/diagnostico` (segun exista) y muestra un toast 'Datos restablecidos'.
4) El dialogo debe ser accesible: `role="alertdialog"`, foco atrapado dentro, cierre con Escape, y foco devuelto al boton al cerrar.

Crea `tests/storage-reset.test.ts` (`fake-indexeddb`) verificando que `borrarTodo` vacia stores y resetea Settings.

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build`. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G15. Onboarding: flujo de bienvenida con pasos

**commit:** `feat(onboarding): flujo de bienvenida en 4 pasos con swipe`

Contexto: PWA de chino. La usuaria es hispanohablante de nivel alto pero oxidada; el onboarding debe ser bonito y NO tratarla como principiante. `PerfilUsuario.diagnosticoHecho` y un nuevo flag de onboarding deciden si mostrarlo.

Crea `src/modules/onboarding/onboarding.view.ts` con `mount(el)` que renderiza un carrusel de 3-4 pasos a pantalla completa con estetica 水墨 (papel arroz, marca de agua de un hanzi grande por paso, trazo de pincel bermellon de acento):
- Paso 1: Bienvenida. Microcopy calido en espanol del estilo 'Tu chino no se ha ido, solo esta dormido. Vamos a despertarlo.' Hanzi hero 醒 o 学.
- Paso 2: Como funciona. Breve explicacion de diagnostico + reactivacion (repaso espaciado FSRS) sin jerga, una frase por idea.
- Paso 3: Que vas a practicar. Iconos-hanzi de los modulos (词 读 听 写).
- Paso final: CTA grande 'Empezar diagnostico' -> navega a `#/diagnostico`; y un enlace secundario 'Explorar primero' -> `#/` home.

Navegacion: puntos indicadores, swipe horizontal (Pointer Events + transform, con resistencia elastica) y botones Anterior/Siguiente. Respeta `prefers-reduced-motion` (sin transiciones de deslizamiento, cambio directo). Foco gestionado: al cambiar de paso, mover foco al encabezado del paso.

Anade `onboardingHecho: boolean` al `PerfilUsuario`. Registra la ruta `#/onboarding`. En `main.ts`/`app.ts`, si `!onboardingHecho`, redirige a `#/onboarding` al arrancar; al pulsar el CTA o 'Explorar', marca `onboardingHecho=true`.

Crea `src/modules/onboarding/onboarding.css` con tokens.

Verifica: `npm run typecheck && npm run lint && npm run build`; en dev recorre los pasos y confirma redireccion en primer arranque. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G16. Onboarding: tarjeta de instalacion en iPhone

**commit:** `feat(onboarding): guia de instalacion en iPhone y banner contextual`

Contexto: PWA de chino, repo publico desplegado en GitHub Pages, instalable en iPhone via Safari -> Compartir -> Anadir a pantalla de inicio. iOS NO dispara `beforeinstallprompt`, asi que hay que dar instrucciones manuales. Vas a anadir esto al onboarding y como banner contextual.

1) Crea `src/ui/components/install-hint.ts` con `esStandalone(): boolean` (comprueba `navigator.standalone === true` y `matchMedia('(display-mode: standalone)').matches`) y `esIOSSafari(): boolean` (heuristica por userAgent: iPhone/iPad y no Chrome/Firefox).
2) Crea un paso/seccion 'Instalala en tu iPhone' en el onboarding que, si `esIOSSafari() && !esStandalone()`, muestre instrucciones ilustradas paso a paso: (1) toca el icono Compartir (dibuja el SVG del icono share de iOS), (2) elige 'Anadir a pantalla de inicio', (3) confirma. Texto en espanol, calido. Si ya esta en standalone, muestra 'Ya la tienes instalada' con un sello jade.
3) Anade un banner discreto y descartable en la home (`src/app.ts`) que aparezca solo en iOS Safari fuera de standalone, con un boton 'Como instalar' que abra el mismo contenido en un sheet. Guarda en localStorage `installHintDescartado` para no repetir.

Verifica: `npm run typecheck && npm run lint && npm run build`; en dev fuerza `esIOSSafari` para ver ambas variantes. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G17. Accesibilidad: foco visible, skip-link y navegacion por teclado

**commit:** `a11y: foco visible, skip-link y focus-trap en sheets/dialogos`

Contexto: PWA de chino. Vas a hacer una pasada de accesibilidad de teclado y foco en toda la app, sin alterar el diseno visual mas alla de lo necesario.

1) En `src/styles/base.css` define un `:focus-visible` consistente: anillo de 2px `--focus-ring` con `outline-offset: 2px` en todos los elementos interactivos; elimina cualquier `outline:none` sin reemplazo. Asegura contraste del anillo en claro y oscuro.
2) Anade un skip-link 'Saltar al contenido' al principio de `index.html`/`app.ts`, oculto hasta recibir foco, que enfoque el `<main id="contenido">`.
3) Revisa la barra de navegacion inferior: cada pestana debe ser un `<a>`/`<button>` enfocable, con `aria-current="page"` en la activa, y orden de tabulacion logico.
4) En componentes con teclas: tarjetas SRS deben responder a flechas/espacio donde aplique; sheets y dialogos deben atrapar el foco (focus trap), cerrar con Escape y devolver el foco al disparador. Crea un helper reutilizable `src/ui/focus-trap.ts` (`atrapar(el): () => void`) y usalo en los sheets de Ajustes, detalle de palabra y dialogos de reset.
5) Asegura `touch-action` no rompe el foco por teclado.

Crea `tests/focus-trap.test.ts` (jsdom) verificando que el trap mantiene el foco dentro y lo restaura al liberar.

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build`; navega toda la app solo con Tab/Shift+Tab/Escape en dev. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G18. Accesibilidad: ARIA, roles y contraste

**commit:** `a11y: roles ARIA, lang zh-CN y contraste AA`

Contexto: PWA de chino. Vas a auditar y corregir semantica ARIA y contraste para cumplir WCAG AA.

1) Estructura semantica: un unico `<main>`, `<nav>` para la barra inferior, encabezados jerarquicos correctos (un `<h1>` por vista). Anade `lang="es"` al `<html>` y marca el contenido chino con `lang="zh-CN"` (en glosas, tarjetas y textos) para que lectores de pantalla y TTS lo traten bien.
2) Estados dinamicos: usa `aria-live="polite"` para feedback de acierto/error en ejercicios y para toasts; `aria-pressed`/`aria-checked` en toggles y segmentados; `aria-label` en botones que solo tienen icono (incluidos los iconos-hanzi de la tabbar, con etiqueta en espanol).
3) Imagenes/SVG decorativos (marcas de agua, motivos) -> `aria-hidden="true"`; SVG informativos (radar, heatmap, anillo, sellos) -> `role="img"` + `aria-label` (ya anadidos en prompts previos; verificalos).
4) Contraste: revisa que `--text` sobre `--bg` y los estados de error/exito cumplan AA en ambos temas; NO uses bermellon para texto body pequeno sobre papel (no cumple) — reservalo para texto grande/iconos. Ajusta tokens si algun par falla, documentando el ratio.
5) Audio: el boton de reproducir TTS debe tener `aria-label` claro ('Escuchar pronunciacion').

Verifica: `npm run typecheck && npm run lint && npm run build`. Si hay configurado axe o similar en tests, anade `tests/a11y.smoke.test.ts` que monte 2-3 vistas en jsdom y corra axe-core sin violaciones criticas; si no, deja el chequeo manual documentado en el commit body. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G19. Rendimiento: lazy loading, subset de fuentes y presupuesto

**commit:** `perf: subset de fuentes, lazy-loading y presupuesto de bundle`

Contexto: PWA de chino. Las fuentes CJK son enormes; el objetivo es un primer pintado rapido y un bundle controlado. Vas a optimizar carga.

1) Fuentes: asegura que las `.woff2` en `public/fonts/` estan subseteadas a los caracteres realmente usados. Crea/ajusta un script `scripts/subset-fonts.mjs` que recorra los JSON de `public/data/` (vocab, textos, chengyu) + caracteres de UI, extraiga el set de hanzi unico, y use `fonttools`/`subset-font` para generar los subsets (documenta el comando si requiere binario externo). Configura `@font-face` con `font-display: swap` y `unicode-range`. Precarga solo Ma Shan Zheng (splash) e Inter en `<head>`; WenKai/Noto Serif SC en carga diferida.
2) Code-splitting: confirma que cada ruta usa `import()` dinamico y que hanzi-writer solo se importa en el modulo de escritura (y en el splash solo si ya esta). Revisa que ts-fsrs no infla rutas que no lo necesitan.
3) Imagenes: iconos y motivos en SVG/CSS, cero raster pesado.
4) Presupuesto: anade a `vite.config.ts` un aviso de `build.chunkSizeWarningLimit` razonable y verifica con `npm run build` que el chunk inicial (entry) se mantiene pequeno; reporta tamanos en el commit body.

Verifica: `npm run build` y revisa el desglose de chunks; `npm run typecheck && npm run lint`. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G20. Auditoria PWA: manifest, iconos iOS y service worker

**commit:** `build(pwa): auditoria de manifest, iconos iOS y precache offline`

Contexto: PWA de chino con `vite-plugin-pwa`. Vas a asegurar que la app es plenamente instalable y offline-first, y que pasa la categoria PWA de Lighthouse.

1) Verifica `manifest.webmanifest` (via plugin): `name`, `short_name`, `start_url: '.'`, `scope: '.'`, `display: standalone`, `background_color` papel (#f6efe1), `theme_color` (#c8492c), e iconos 192, 512 y maskable-512 (purpose 'maskable' con 20% safe zone). Genera/regenera los PNG desde `public/icon-master.svg` con un script `scripts/gen-icons.mjs` usando `sharp` (180 apple-touch, 192, 512, maskable). El icono debe ser opaco, sin transparencia.
2) En `index.html` confirma las meta iOS: `apple-touch-icon`, `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `theme-color` por esquema claro/oscuro, y `viewport` con `viewport-fit=cover`.
3) Workbox: `globPatterns` precachea html/js/css/woff2/svg/png/json (incluye `public/data/**.json` para offline real), `navigateFallback: index.html`, `cleanupOutdatedCaches: true`, `registerType: 'prompt'`.
4) Prompt de actualizacion: en `src/pwa/register-sw.ts` muestra un toast 水墨 ('Hay una version nueva — Actualizar') que llame a `updateSW()`.
5) Verifica offline: `npm run build && npm run preview`, carga, pon el navegador offline y comprueba que la app y los datos siguen funcionando.

Verifica: `npm run typecheck && npm run lint && npm run build`. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G21. Presupuesto Lighthouse en CI

**commit:** `ci: presupuesto Lighthouse PWA/a11y/perf con base raiz`

Contexto: PWA de chino con CI en GitHub Actions. Ya existe (o debe existir) `lighthouserc.json`. Vas a endurecer el presupuesto y asegurar que corre bien con el `base` de GitHub Pages.

1) Ajusta `lighthouserc.json`: `collect.staticDistDir: ./dist`, `numberOfRuns: 1`; `assert.assertions` con `categories:pwa >= 0.9` (error), `categories:accessibility >= 0.9` (error), `categories:performance >= 0.85` (warn), e `installable-manifest`, `service-worker`, `apple-touch-icon`, `viewport`, `color-contrast`, `tap-targets` como error.
2) Como Lighthouse sirve `dist` desde la raiz y la app usa `base: '/practicas-de-chino/'`, evita falsos negativos: parametriza `vite.config.ts` para aceptar `base` por variable de entorno (`process.env.VITE_BASE ?? '/practicas-de-chino/'`) y en el job de Lighthouse haz un build con `VITE_BASE=/` antes de auditar. Documenta esto en un comentario en el workflow.
3) Anade/confirma el job `lighthouse` en `.github/workflows/ci.yml` que depende de `quality`, hace `npm ci`, build con `VITE_BASE=/`, y `npx @lhci/cli autorun`.
4) Asegura presupuestos de tamano (opcional): un `budgets` en lighthouserc para el peso total del primer load.

Verifica: `npm run build` localmente y, si tienes lhci instalado, `VITE_BASE=/ npm run build && npx @lhci/cli autorun` para confirmar que pasa los umbrales. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G22. Pruebas e2e basicas con Playwright

**commit:** `test(e2e): flujos basicos de onboarding, ajustes, progreso y backup`

Contexto: PWA de chino. Vas a anadir pruebas e2e ligeras que cubran los flujos criticos, integradas en CI.

1) Instala y configura Playwright: `playwright.config.ts` con `webServer` que levante `npm run preview` (tras build) sobre el `base` correcto, proyecto de un solo navegador (chromium) para mantener CI rapido, y `use.baseURL`.
2) Crea `e2e/` con specs:
- `onboarding.spec.ts`: primer arranque muestra onboarding; pulsar 'Empezar diagnostico' navega a `#/diagnostico`; marca onboardingHecho (recarga no vuelve a mostrarlo).
- `settings.spec.ts`: cambiar tema a Oscuro aplica `data-theme="dark"` y persiste tras recarga; cambiar tamano de fuente cambia el `font-size` de `html`.
- `progress.spec.ts`: la vista `#/progreso` renderiza anillo, heatmap (SVG) y radar; con datos sembrados via `localStorage`/IndexedDB en `addInitScript`.
- `backup.spec.ts`: exportar genera una descarga (intercepta el evento download) y reset pide doble confirmacion.
3) Anade script `"e2e": "playwright test"` en package.json.
4) En `.github/workflows/ci.yml` anade un job `e2e` que dependa de `quality`, instale navegadores (`npx playwright install --with-deps chromium`), haga build y corra `npm run e2e`.

Verifica: `npm run build && npm run e2e` localmente en verde; `npm run typecheck && npm run lint`. Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G23. Documentacion para la novia: como instalarla en el iPhone

**commit:** `docs: guia de instalacion en iPhone para la usuaria`

Contexto: PWA de chino, repo publico, desplegada en GitHub Pages en `https://<usuario>.github.io/practicas-de-chino/`. Vas a escribir documentacion clara y carinosa para la usuaria final (no tecnica).

1) Crea `docs/INSTALACION.md` en espanol, tono calido y sencillo, con:
- Que es la app (una frase) y el enlace para abrirla.
- Paso a paso con iPhone: abrir el enlace en Safari (no Chrome), tocar Compartir, 'Anadir a pantalla de inicio', confirmar; capturas o descripciones del icono Compartir.
- Como hacer una copia de seguridad y por que (Safari puede borrar datos tras tiempo sin usar): ir a Ajustes -> Datos -> Exportar, y como reimportar.
- Notas: funciona sin internet una vez instalada; el audio puede pedir un primer toque; como cambiar tema/voz/tamano de letra.
- Una seccion 'Empezar': haz el diagnostico primero, luego repasa cada dia un poco.
2) Actualiza `README.md` del repo: anade una seccion 'Para la usuaria' enlazando a `docs/INSTALACION.md` y el link de la app en vivo; manten el resto tecnico (stack, scripts, CI).
3) Si tienes capturas, guardalas en `docs/img/` y referencialas con rutas relativas.

Verifica: `npm run typecheck && npm run lint && npm run build` siguen en verde (los .md no deben romper nada; revisa que `format:check`/prettier acepta el markdown o ajusta `.prettierignore`). Recuerda: commit granular, esperar CI verde, JAMAS Claude como co-author.

### G24. Pulido final y despliegue a GitHub Pages

**commit:** `ci: despliegue final a GitHub Pages tras CI verde`

Contexto: PWA de chino. Es el ultimo paso: pulido global y despliegue a produccion en GitHub Pages.

1) Pulido: revisa que todas las vistas tienen estados de carga/vacio/error coherentes, que el splash solo corre en arranque frio (flag en sessionStorage) y respeta reduce-motion, que las transiciones de pagina usan View Transitions con fallback, y que no quedan `console.log` ni TODO en src. Corre `npm run lint -- --max-warnings 0`.
2) Confirma el `base: '/practicas-de-chino/'` en `vite.config.ts` (coincide con el nombre del repo, sensible a mayusculas) y que `start_url`/`scope` del manifest son relativos. Anade un `public/404.html` que sea copia de `index.html` como red de seguridad para rutas.
3) Despliegue: asegura `.github/workflows/deploy.yml` con `permissions` (pages: write, id-token: write), `concurrency: pages`, que corre en push a `main`, hace `npm ci`, build (con el base de produccion), `upload-pages-artifact` y `deploy-pages`. Encadena el deploy para que solo ocurra tras los checks verdes (job `quality`/`e2e`/`lighthouse` como `needs`, o via `workflow_run`).
4) En GitHub: documenta en el README que Settings -> Pages debe estar en 'GitHub Actions' y que `main` esta protegido exigiendo CI verde.
5) Verifica el resultado: tras el merge a main y CI verde, abre la URL publica en iPhone, instala la PWA, prueba offline, audio TTS, diagnostico, un repaso, y exporta/importa un backup.

Verifica: `npm run typecheck && npm run lint && npm run test && npm run build && npm run e2e` en verde antes del merge. Recuerda: commit granular, esperar CI verde, y JAMAS poner a Claude como co-author en ningun commit.

---

## Prompts de refuerzo (QA)

### R1. Diagnostico transversal multi-skill

**commit:** `feat(diagnostico): diagnostico transversal multi-skill que siembra reactivacion por habilidad`

Crea un modulo de diagnostico ADAPTATIVO TRANSVERSAL que extienda D20-D23 mas alla del vocabulario. Anade un banco de items y un evaluador para 4 dimensiones: (1) reconocimiento de vocabulario/chengyu (ya en D20-D23), (2) velocidad y comprension lectora (reusa textos de E2/E3 con micro-preguntas y cronometro de E11), (3) comprension auditiva y discriminacion de tonos (reusa items de F5/F11), (4) reconocimiento/produccion de hanzi (reusa lecciones de E19). El algoritmo debe parar pronto en cada dimension (la usuaria es avanzada) y producir un perfil por skill {vocab, lectura, escucha, escritura} con nivel estimado. Al terminar, llama al modo reactivacion (D12/D23) para sembrar stability alta POR SKILL, no solo en vocab. UI en espanol, hanzi+pinyin, estetica tinta coherente con B9-B12. No reimplementes el SRS ni la persistencia: reusa D6/D8/C1. Tests unitarios del evaluador (sin DOM) para cada dimension. RECUERDA: commit granular (solo este diagnostico transversal), esperar CI VERDE antes de seguir, y NO anadir a Claude como co-author en el commit.

### R2. Plan de reactivacion diario mixto

**commit:** `feat(reactivacion): plan diario mixto y progreso de nivel estimado por skill`

Implementa un 'Plan de Reactivacion' que materialice el camino de repaso para una usuaria avanzada pero oxidada. A partir del perfil por skill del diagnostico transversal, genera una sesion diaria MIXTA que combine: tarjetas SRS prioritarias (D13), un texto corto de repaso (E9), un ejercicio de escucha/tonos (F12/F13) y 1-2 caracteres de escritura (E23), dosificados segun el skill mas oxidado. Anade una vista de 'progreso de reactivacion' que muestre el nivel estimado inicial vs actual por skill (linea temporal simple, estetica tinta, reusa SVG de G4). No dupliques los schedulers de cada modulo: orquesta los existentes (D13, E6, F-logica, E24). i18n en espanol (reusa C3). Tests de la logica de composicion de la sesion mixta (sin DOM). RECUERDA: commit granular (solo el plan de reactivacion y su vista), esperar CI VERDE antes de seguir, y NO poner a Claude como co-author.

### R3. Hardening de repo publico y CI de seguridad

**commit:** `ci(security): npm audit + dependabot + CSP + guardarrail anti-PII/secretos`

Endurece el proyecto por ser un repo PUBLICO en GitHub. (1) Anade un job de seguridad al workflow de CI (junto a A13) que corra 'npm audit --audit-level=high' y falle ante vulnerabilidades altas/criticas; configura Dependabot (.github/dependabot.yml) para npm y github-actions. (2) Anade una meta Content-Security-Policy razonable para una PWA estatica en index.html (self + data: para iconos/fuentes self-host; sin inline scripts) y cabeceras de seguridad compatibles con GitHub Pages. (3) Anade un check (script de test o lint) que verifique que NO se commitea PII de la usuaria ni secretos: prohibe patrones de email/telefono en /src y contenido semilla, y verifica que no hay .env ni claves. Documenta en README que el contenido es generico y sin datos personales. RECUERDA: commit granular (solo hardening de seguridad/CI), esperar CI VERDE, y NO anadir a Claude como co-author.

### R4. Disponibilidad de voz zh-CN y precache offline

**commit:** `feat(offline): deteccion de voz zh-CN con guia iOS y precache de contenido/trazos/fuentes`

Asegura el audio y el funcionamiento offline reales. (1) Extiende F2/F16: detecta si existe una voz zh-CN instalada (no solo si la Web Speech API existe). Si la API esta pero NO hay voz zh-CN (caso comun en iOS sin la voz descargada), muestra un aviso en espanol con instrucciones (Ajustes > Accesibilidad > Contenido hablado > Voces > Chino) y un fallback visual sin romper el ejercicio. (2) Configura el service worker (sobre A10/C11) para PRECACHEAR el JSON de contenido semilla (D3/D4/E2/E3/F5), los datos de trazos de hanzi-writer usados (E18/E19) y las fuentes subset (B4), de modo que tras instalar la PWA funcione 100% offline salvo el TTS. Test de la deteccion de voz (mock de speechSynthesis.getVoices). RECUERDA: commit granular, esperar CI VERDE, y NO poner a Claude como co-author.

### R5. Versionado y migracion de IndexedDB

**commit:** `feat(persistencia): versionado y migracion de IndexedDB conservando progreso`

Anade versionado y migraciones a la capa de persistencia (sobre C1/D8). Define una version de esquema en IndexedDB y un mecanismo de migracion idempotente que se ejecute en onupgradeneeded sin perder el progreso (tarjetas SRS, reviews, progreso de lectura/escucha/escritura) al actualizar la PWA. Anade tambien versionado del contenido semilla: si el contenido cambia en una release, reconcilia (anade nuevos lexemas/textos sin duplicar ni borrar el progreso existente, casando por id estable). Maneja QuotaExceededError mostrando un aviso en espanol que sugiera exportar backup (reusa G13). Tests con fake-indexeddb (reusa setup de D9) que verifiquen una migracion v1->v2 conservando datos. RECUERDA: commit granular, esperar CI VERDE, y NO anadir a Claude como co-author.

### R6. Recordatorio de backup anti-eviction iOS

**commit:** `feat(backup): recordatorio anti-eviction y solicitud de almacenamiento persistente`

Mitiga la perdida de datos por eviction de PWAs en iOS (Safari puede borrar datos de webapps sin uso ~7 dias). Sobre la capa de backup unificada (C15/G13): (1) registra la fecha del ultimo backup exportado; (2) si han pasado N dias (configurable, por defecto 7) sin backup, muestra un banner no intrusivo en el dashboard (C10) recordando exportar, con boton directo a exportar; (3) si esta disponible, solicita navigator.storage.persist() para reducir el riesgo y refleja el estado en Ajustes. Todo en espanol, estetica coherente. Tests de la logica 'debe recordar backup?' (sin DOM, con reloj inyectable). RECUERDA: commit granular (solo el recordatorio de backup), esperar CI VERDE, y NO poner a Claude como co-author.

### R7. Error boundary global y log local

**commit:** `feat(robustez): error boundary global y log local exportable para depuracion`

Anade robustez de errores al app shell (sobre C6/A18). (1) Captura window.onerror y unhandledrejection y muestra una pantalla/banner amable en espanol ('Algo fallo, tus datos estan a salvo') sin pantalla en blanco, con boton de recargar y de exportar backup. (2) Implementa un log local en memoria/IndexedDB (ultimas N entradas) y un boton en Ajustes para copiar/exportar el log, util para depurar en el iPhone de la usuaria sin consola. No envies nada a la red (repo/app sin backend, privacidad). Tests de la captura y del buffer de log (sin DOM). RECUERDA: commit granular, esperar CI VERDE, y NO anadir a Claude como co-author.

### R8. Unificar backup y consolidar duplicados de scaffolding

**commit:** `refactor(core): unifica capa de backup y elimina router/PWA duplicados`

Tarea de consolidacion para eliminar duplicacion del plan ANTES de implementar funcionalidades. (1) Backup: implementa UNA sola capa core de export/import (JSON con version de esquema) y expon su UI solo en Ajustes; haz que C15, G13 y la parte de mazos de D24 reusen esa capa en vez de reimplementarla. (2) Scaffolding: decide una unica pista para router+app shell+PWA+base path y elimina la redundante (mantener Grupo A: A10/A11/A12/A18 como fuente de verdad y que C5/C6/C11 solo extiendan, o viceversa) para evitar reescrituras y codigo muerto que el lint type-aware (A3) marcaria. Documenta la decision en README. Verifica que tras la consolidacion no quedan exports sin usar ni rutas duplicadas. RECUERDA: commit(s) granular(es) por consolidacion, esperar CI VERDE entre cada uno, y NO poner a Claude como co-author.

