# Integration Test Suite

Este archivo contiene el test de integración completa para `package-bump-tag-commit`. Se mantiene en el repositorio para pruebas continuas y para validar nuevos lenguajes que se añadan en el futuro.

## Uso

### Comandos NPM (Recomendado)

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con salida detallada
npm run test:verbose

# Probar solo un lenguaje específico
npm run test:js       # Solo JavaScript
npm run test:rust     # Solo Rust
npm run test:php      # Solo PHP
npm run test:python   # Solo Python
```

### Ejecución Directa

```bash
# Ejecutar todos los tests
node test-integration.js

# Opciones disponibles
node test-integration.js --help
node test-integration.js --lang=php
node test-integration.js --verbose
node test-integration.js --lang=python --verbose
```

## Qué se prueba

### 1. Validación de estructura de archivos
- ✅ Verifica que existan todos los archivos requeridos
- ✅ Valida la estructura del directorio `examples/`

### 2. Tests del módulo PackageVersion
- ✅ Lectura correcta de versiones desde archivos
- ✅ Funcionamiento del bump de versiones
- ✅ Compatibilidad con todos los formatos soportados

### 3. Tests de ejecución de la acción
- ✅ Simulación del entorno de GitHub Actions
- ✅ Prueba de todos los niveles de bump (`patch`, `minor`, `major`, `hotfix`)
- ✅ Validación de salida y códigos de exit

### 4. Tests específicos
- ✅ Auto-detección de archivos Python
- ✅ Manejo de archivos temporales
- ✅ Preservación de formato original

## Lenguajes soportados actualmente

| Lenguaje | Archivo | Archivo de Ejemplo | Auto-detección | Status |
|----------|---------|-------------------|----------------|---------|
| JavaScript | `package.json` | `examples/package.json` | ❌ | ✅ |
| Rust | `Cargo.toml` | `examples/Cargo.toml` | ❌ | ✅ |
| PHP | `composer.json` | `examples/composer.json` | ❌ | ✅ |
| Python | `pyproject.toml` | `examples/pyproject.toml` | ✅ | ✅ |
| Python | `setup.py` | `examples/setup.py` | ✅ | ✅ |
| Python | `__init__.py` | `examples/__init__.py` | ✅ | ✅ |

## Añadir un nuevo lenguaje

Cuando se añada soporte para un nuevo lenguaje, seguir estos pasos:

### 1. Actualizar el test

Editar `test-integration.js`:

```javascript
// Añadir el nuevo lenguaje
const SUPPORTED_LANGUAGES = ['js', 'rust', 'php', 'python', 'nuevo-lenguaje'];

// Añadir casos de test
const TEST_CASES = [
  // ... casos existentes ...
  {
    name: 'Nuevo Lenguaje (archivo.ext)',
    lang: 'nuevo-lenguaje',
    file: 'examples/archivo.ext',
    expectedVersion: '1.0.0',
    testBumps: ['patch', 'minor', 'major']
  }
];
```

### 2. Crear archivos de ejemplo

```bash
# Crear archivo de ejemplo en examples/
echo '{"version": "1.0.0"}' > examples/archivo.ext
```

### 3. Ejecutar el test

```bash
# Probar el nuevo lenguaje
node test-integration.js --lang=nuevo-lenguaje --verbose

# Si pasa, probar todos
npm test
```

## Solución de problemas

### Error: "Required file missing"
- Verificar que todos los archivos principales estén presentes
- Ejecutar `npm run build` si falta el archivo compilado

### Error: "No test cases found for language"
- Verificar que el lenguaje esté en `SUPPORTED_LANGUAGES`
- Verificar que existan casos de test para ese lenguaje

### Timeouts
- Los tests tienen timeout de 5 segundos por defecto
- Usar `--verbose` para ver más detalles de ejecución

### Tests fallando
```bash
# Debug con salida detallada
npm run test:verbose

# Probar lenguajes individualmente
npm run test:js
npm run test:php
npm run test:python
```

## Salida del test

### Exitosa
```
🚀 Starting Integration Test Suite
✅ File structure validation passed
✅ JavaScript (package.json): Module test passed
✅ PHP (composer.json) (patch): 1.0.1
📊 INTEGRATION TEST SUMMARY
Total tests: 15
✅ Passed: 15
📈 Success rate: 100.0%
🎉 All tests passed! Integration is working correctly.
```

### Con errores
```
❌ PHP (composer.json) (patch): Failed (exit 1)
📊 INTEGRATION TEST SUMMARY
❌ Failed: 1
❌ Errors:
  • PHP (composer.json) (patch): Exit code 1
```

## Automatización en CI/CD

Para usar en GitHub Actions:

```yaml
name: Integration Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
```