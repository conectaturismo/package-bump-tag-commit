# 🚀 Release Scripts Documentation

Este proyecto incluye una serie de scripts automatizados **multiplataforma** para facilitar el proceso de releases y manejo de tags.

> ✅ **Compatible con**: Windows, macOS, Linux

## 📋 Scripts Disponibles

### ✨ **Comandos Principales (Recomendados)**

```bash
# Ver versión actual
npm run version

# Release completo (build + tag + push)
npm run release

# Bump automático con release completo
npm run bump:patch   # 1.3.1 → 1.3.2 + release
npm run bump:minor   # 1.3.1 → 1.4.0 + release  
npm run bump:major   # 1.3.1 → 2.0.0 + release
```

### 🛠️ **Comandos Avanzados (Script Helper)**

Para casos especiales, puedes usar el script helper directamente:

```bash
# Gestión de versiones
node scripts/release-helper.js version current
node scripts/release-helper.js version patch|minor|major

# Gestión de tags  
node scripts/release-helper.js tag list
node scripts/release-helper.js tag push
node scripts/release-helper.js tag delete
node scripts/release-helper.js tag update-major

# Gestión de releases
node scripts/release-helper.js release prepare
node scripts/release-helper.js release tag  
node scripts/release-helper.js release update-major
node scripts/release-helper.js release full

# Bump automático
node scripts/release-helper.js bump patch|minor|major
```

## 🎯 **Casos de Uso Comunes**

### 🐛 **Hotfix/Patch Release**
```bash
# Para bugs menores, documentación, etc.
npm run bump:patch
```

### ✨ **Feature Release**
```bash
# Para nuevas características (como añadir Go support)
npm run bump:minor
```

### 💥 **Breaking Changes**
```bash
# Para cambios que rompen compatibilidad
npm run bump:major
```

### 🔧 **Release Manual con Versión Específica**
```bash
# 1. Editar package.json manualmente
# 2. Ejecutar release completo
npm run release:full
```

## ⚙️ **Arquitectura Simplificada**

### 🎯 **Scripts Principales**

| Script | Acción |
|--------|---------|
| `npm run version` | Muestra la versión actual |
| `npm run release` | Release completo (build + tag + push) |
| `npm run bump:patch` | Bump patch + release automático |
| `npm run bump:minor` | Bump minor + release automático |
| `npm run bump:major` | Bump major + release automático |

### 🛠️ **Arquitectura Multiplataforma**

**✨ Novedad**: Todos los scripts complejos se han trasladado a `scripts/release-helper.js`

- **📦 Package.json limpio**: Solo contiene los scripts esenciales
- **🔧 Script helper**: Toda la lógica compleja en un solo archivo
- **🌍 Multiplataforma**: Funciona en Windows, macOS y Linux
- **📚 Documentado**: Ayuda integrada con `node scripts/release-helper.js`

**Beneficios:**
- ✅ **Mantenimiento más fácil**: Un solo archivo para toda la lógica de release
- ✅ **Package.json limpio**: Menos ruido, más claridad  
- ✅ **Mejor documentación**: Ayuda integrada y README específico
- ✅ **Extensibilidad**: Fácil añadir nuevas funcionalidades

## 🔄 **Workflow Típico de Release**

1. **Desarrollar features** en branch
2. **Merge a master**
3. **Ejecutar bump apropriado**:
   - `npm run bump:patch` para fixes
   - `npm run bump:minor` para features  
   - `npm run bump:major` para breaking changes
4. **¡Listo!** El tag `v1` siempre apunta a la última versión

## 🎪 **Ejemplo Real**

```bash
# Acabamos de añadir soporte para Go (nueva feature)
npm run bump:minor

# Esto automáticamente:
# ✅ Actualiza version: 1.3.0 → 1.4.0
# ✅ Compila dist/
# ✅ Commitea cambios
# ✅ Crea tag v1.4.0
# ✅ Actualiza v1 → v1.4.0
# ✅ Sube todo a GitHub
```

---

**🔥 Pro Tip**: Los usuarios de GitHub Actions pueden usar `@v1` y siempre obtendrán la última versión estable!