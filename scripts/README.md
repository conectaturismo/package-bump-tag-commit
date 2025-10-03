# Scripts Directory

Este directorio contiene scripts de utilidad para el proyecto.

## 📁 Archivos

### `release-helper.js`

Script multiplataforma para manejo de versiones, tags y releases.

**Compatibilidad:** ✅ Windows, macOS, Linux

**Uso directo:**
```bash
node scripts/release-helper.js <command> [subcommand]
```

**Comandos disponibles:**

#### 📊 Versiones
```bash
node scripts/release-helper.js version current
node scripts/release-helper.js version patch
node scripts/release-helper.js version minor  
node scripts/release-helper.js version major
```

#### 🏷️ Tags
```bash
node scripts/release-helper.js tag list
node scripts/release-helper.js tag push
node scripts/release-helper.js tag delete
node scripts/release-helper.js tag update-major
```

#### 🚀 Releases
```bash
node scripts/release-helper.js release prepare
node scripts/release-helper.js release tag
node scripts/release-helper.js release update-major
node scripts/release-helper.js release full
```

#### 🔼 Bump Automático
```bash
node scripts/release-helper.js bump patch
node scripts/release-helper.js bump minor
node scripts/release-helper.js bump major
```

## 🔗 Integración con package.json

Los scripts están integrados en `package.json` para facilitar su uso:

```json
{
  "scripts": {
    "version": "node scripts/release-helper.js version current",
    "release": "node scripts/release-helper.js release full", 
    "bump:patch": "node scripts/release-helper.js bump patch",
    "bump:minor": "node scripts/release-helper.js bump minor",
    "bump:major": "node scripts/release-helper.js bump major"
  }
}
```

**Uso desde npm:**
```bash
npm run version      # Ver versión actual
npm run release      # Release completo
npm run bump:patch   # Bump patch + release
npm run bump:minor   # Bump minor + release  
npm run bump:major   # Bump major + release
```

## 🛠️ Funcionalidades

- **✅ Multiplataforma**: Funciona en Windows, macOS y Linux
- **🔄 Automatización completa**: Desde bump hasta release
- **📦 Build integrado**: Compila automáticamente `dist/`
- **🏷️ Gestión de tags**: Crea y actualiza tags automáticamente
- **🚀 Push automático**: Sube código y tags a GitHub
- **🎯 Tag v1**: Mantiene `v1` apuntando a la última versión