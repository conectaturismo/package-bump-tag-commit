# AGENTS.md

GitHub Action (JavaScript, Node 24) que lee la versión de un fichero de paquete, la sube según semver y, con `save: true`, hace commit, push y crea una release/etiqueta. La usan los workflows de despliegue de los repositorios de la organización.

## Estructura

- `action.yml`: inputs (`lang`, `bumpLvl`, `save`, `githubToken`, `path`, `tagPrefix`) y output `version`. Ejecuta `dist/index.js`.
- `index.js` → `src/ActionOrchestrator.js`: lee inputs, resuelve el fichero, sube la versión, guarda y llama a git.
- `src/services/`: `InputService` (inputs y validación), `PathResolverService` (ruta del fichero), `GitService` (commit, push, release), `OutputService` (logs y outputs).
- `src/parsers/` y `src/writers/`: uno por formato (js, rust, php, python toml/setup/init, go). Se eligen en `src/factories/`.
- `dist/`: bundle de `ncc`. **Es lo que ejecuta GitHub**: después de tocar `src/` hay que ejecutar `npm run build` y subir `dist/` en el mismo commit.

## Reglas de seguridad (no romper)

- **El commit de versión solo incluye el fichero de versión** (`git add -- <fichero>` y `git commit -- <fichero>` en `GitService._commit`). Nunca volver a `git add -A`/`git add .`: en los workflows, `google-github-actions/auth` deja `gha-creds-*.json` en el workspace y acababa subido al repo. Si falta la ruta, `_commit` lanza un error en lugar de subir todo.
- Orden: commit → push → etiqueta sobre el SHA del commit. Si el push falla, no se crea etiqueta.
- El repositorio es **público**: no poner en código, comentarios, commits ni PRs nombres de clientes, de cuentas de servicio, de proyectos de GCP ni detalles de incidentes.

## Tests

- `npm test`: `test-integration.js` (parseo y subida de versión de todos los lenguajes, sin guardar) + `test-git.js`.
- `test-git.js`: flujo completo con `save: true` contra un remoto git local y una API de GitHub falsa en `127.0.0.1` (sin red). Comprueba que el commit solo contiene el fichero de versión aunque haya ficheros de credenciales, `.env`, cambios o cosas ya preparadas en el índice, y que la etiqueta apunta a ese commit.
- `npm run test:dist`: el mismo test contra `dist/index.js`. Ejecutarlo tras `npm run build`.
- En Windows: `git config core.autocrlf false` en el clon, o los ficheros aparecen modificados (el repo guarda LF).

## Publicación

`scripts/release-helper.js` (`npm run release`) sube la versión, recompila, crea la etiqueta `vX.Y.Z` y mueve las etiquetas mayores (`v1`, `v2`) con force-push. Los repos consumidores deberían fijar la action por SHA completo, no por etiqueta.

## Convenciones

- Commits en español, en imperativo, con prefijo convencional (`fix:`, `feat:`, `refactor:`, `docs:`, `chore:`, `ci:`, `test:`, `perf:`). El cuerpo explica el porqué.
- Comentarios del código en español sin tildes (estilo existente).
