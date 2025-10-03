# 🚀 Release Scripts Documentation

Este proyecto incluye una serie de scripts automatizados para facilitar el proceso de releases y manejo de tags.

## 📋 Scripts Disponibles

### 🏷️ **Manejo de Tags**

```bash
# Ver versión actual
npm run tag:current

# Listar todos los tags
npm run tag:list

# Eliminar tag actual (útil para correcciones)
npm run tag:delete
```

### 📦 **Proceso de Release Manual**

```bash
# 1. Preparar release (build + commit dist/)
npm run release:prepare

# 2. Crear tag de versión específica
npm run release:tag

# 3. Actualizar tag v1 para apuntar a la última versión
npm run release:update-major

# 4. Proceso completo (1+2+3)
npm run release:full
```

### 🔄 **Bump de Versión + Release Automático**

```bash
# Bump patch (1.3.0 → 1.3.1) + release completo
npm run bump:patch

# Bump minor (1.3.0 → 1.4.0) + release completo  
npm run bump:minor

# Bump major (1.3.0 → 2.0.0) + release completo
npm run bump:major
```

### 📝 **Solo Bump de Versión (sin release)**

```bash
# Solo actualizar versión patch
npm run version:patch

# Solo actualizar versión minor  
npm run version:minor

# Solo actualizar versión major
npm run version:major
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

## ⚙️ **Qué Hace Cada Script**

| Script | Acción |
|--------|---------|
| `release:prepare` | Compila el proyecto y commitea `dist/` |
| `release:tag` | Crea tag `vX.Y.Z` y lo sube a GitHub |
| `release:update-major` | Actualiza tag `v1` para apuntar a la última versión |
| `bump:*` | Actualiza versión + release completo |
| `version:*` | Solo actualiza versión en package.json |

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