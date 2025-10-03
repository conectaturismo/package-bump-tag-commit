# Examples Directory

Este directorio contiene archivos de ejemplo para todos los lenguajes soportados por `package-bump-tag-commit`. Estos archivos se utilizan para el testing de integración y como referencia para usuarios.

## Archivos incluidos

### JavaScript
- **`package.json`** - Archivo estándar de npm con versión 1.0.0
- Contiene dependencias típicas y configuración completa

### Rust  
- **`Cargo.toml`** - Archivo de configuración de Cargo con versión 1.0.0
- Incluye dependencias comunes y configuración de binario

### PHP
- **`composer.json`** - Archivo de configuración de Composer con versión 1.0.0
- Configuración básica de paquete PHP con autoload PSR-4

### Python

#### `pyproject.toml`
- Formato moderno de Python (PEP 518) con versión 1.0.0
- Configuración estándar con sección `[project]`

#### `setup.py`
- Formato tradicional de Python con versión 1.0.0
- Script de setup con configuración básica

#### `__init__.py`
- Archivo de inicialización de paquete Python
- Contiene `__version__ = '1.0.0'` para versionado

## Uso en tests

Estos archivos son utilizados automáticamente por `test-integration.js`:

```bash
# Probar todos los ejemplos
npm test

# Probar un lenguaje específico
npm run test:js
npm run test:rust  
npm run test:php
npm run test:python
```

## Modificar archivos de ejemplo

⚠️ **Importante**: Mantener siempre la versión `1.0.0` en todos los archivos de ejemplo, ya que los tests esperan esta versión inicial.

Si necesitas modificar algún archivo:
1. Mantén la versión como `1.0.0`
2. Ejecuta los tests para verificar que siguen funcionando:
   ```bash
   npm test
   ```

## Añadir nuevo lenguaje

Para añadir soporte a un nuevo lenguaje:

1. **Crear archivo de ejemplo** en este directorio
2. **Actualizar `test-integration.js`** con el nuevo caso de test
3. **Ejecutar tests** para validar funcionalidad

Ejemplo para un nuevo lenguaje "Go":
```bash
# 1. Crear go.mod de ejemplo
echo 'module example-go-package

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
)' > examples/go.mod

# 2. Actualizar test-integration.js (ver documentación)

# 3. Probar
npm test
```