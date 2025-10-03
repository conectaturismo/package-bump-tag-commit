# Compatibilidad con PHP y Python - Resumen de Cambios

## Nuevas funcionalidades añadidas

### Lenguajes soportados
Se ha añadido compatibilidad completa para:

#### PHP
- **Archivo soportado**: `composer.json`
- **Formato**: JSON estándar de Composer
- **Versión**: Propiedad `version` en el root del JSON

#### Python
- **pyproject.toml**: Formato moderno de Python (PEP 518)
  - Ubicación de la versión: `project.version` o `tool.poetry.version`
- **setup.py**: Archivo tradicional de setup
  - Busca la línea con `version="..."` o `version='...'`
- **__init__.py**: Archivos de paquete Python
  - Busca la línea con `__version__ = "..."` o `__version__ = '...'`

### Archivos modificados

#### 1. `index.js`
- Añadidos `'php'` y `'python'` a `enabledLangs`
- Agregados archivos por defecto para cada lenguaje
- Implementada lógica de detección automática de archivos Python
- Detección inteligente: busca `pyproject.toml`, `setup.py`, `src/__init__.py`, `__init__.py`

#### 2. `package-version.js`
- **Método `fromFile()`**: Añadida lógica para PHP y Python
  - PHP: Parseo JSON igual que JavaScript
  - Python: Soporte para múltiples formatos (TOML, setup.py, __init__.py)
- **Método `save()`**: Implementado guardado para cada formato
  - PHP: Serialización JSON
  - Python TOML: Serialización TOML con formato apropiado
  - Python setup.py: Reemplazo de línea de versión con regex
  - Python __init__.py: Reemplazo de línea `__version__` con regex

#### 3. `action.yml`
- Actualizada la descripción del parámetro `lang` para incluir los nuevos lenguajes

#### 4. `README.md`
- Documentación completa de los nuevos lenguajes
- Ejemplos de uso para cada tipo de archivo
- Explicación de formatos soportados

#### 5. `package.json`
- Versión actualizada de `1.1.0` a `1.2.0`
- Añadida dependencia de desarrollo `@vercel/ncc`

### Archivos de ejemplo creados
Se crearon archivos de ejemplo en la carpeta `examples/`:
- `composer.json` - Ejemplo PHP
- `pyproject.toml` - Ejemplo Python moderno
- `setup.py` - Ejemplo Python tradicional
- `__init__.py` - Ejemplo de paquete Python

### Funcionamiento verificado
✅ Parseo de versiones correcto para todos los formatos
✅ Bump de versiones funcional (major, minor, patch, hotfix, none)
✅ Guardado de archivos preservando formato original
✅ Build exitoso con ncc
✅ Tests de funcionalidad completos

## Uso

### PHP
```yaml
- uses: owner/package-bump-tag-commit@v1.2.0
  with:
    lang: 'php'
    path: './composer.json'
    bumpLvl: 'patch'
```

### Python
```yaml
# pyproject.toml
- uses: owner/package-bump-tag-commit@v1.2.0
  with:
    lang: 'python'
    path: './pyproject.toml'
    bumpLvl: 'minor'

# setup.py  
- uses: owner/package-bump-tag-commit@v1.2.0
  with:
    lang: 'python'
    path: './setup.py'
    bumpLvl: 'patch'

# __init__.py
- uses: owner/package-bump-tag-commit@v1.2.0
  with:
    lang: 'python'
    path: './src/mypackage/__init__.py'
    bumpLvl: 'major'
```

La implementación está completa y lista para usar en producción.