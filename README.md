# Package Bump Tag Commit

A GitHub Action that reads version from package files, bumps it according to semantic versioning, and optionally creates tags and commits. Now supports **JavaScript**, **Rust**, **PHP**, and **Python** projects!

## Inputs

### `bumpLvl`

The bumped semver version type. Default `"patch"`.
options: `major | minor | patch | hotfix | none`

### `lang`

The type of programing language. Supported languages:
- `js` - JavaScript (package.json)
- `rust` - Rust (Cargo.toml)  
- `php` - PHP (composer.json)
- `python` - Python (pyproject.toml, setup.py, or __init__.py)

### `save`

Boolean to indicate if persist the bumped version. Default `"false"`.

### `githubToken`

The github secret, required to commit changes

### `path`

The path to the package file, Default `"./"`.

## Outputs

### `version`

The bumped version

## Example usage

```yaml
- name: Read version and bump
  uses: sergioggdev/package-bump-tag-commit@feature/test
  id: bump
  with:
    bumpLvl: patch # major | minor | patch | hotfix
    lang: 'js' # js | rust | php | python
    save: true # boolean
    githubToken: ${{ secrets.GITHUB_TOKEN }}
    path: ./package.json
```

## Language-specific file examples

### JavaScript
```yaml
lang: 'js'
path: ./package.json
```

### Rust  
```yaml
lang: 'rust'
path: ./Cargo.toml
```

### PHP
```yaml
lang: 'php'
path: ./composer.json
```

### Python
```yaml
# Using pyproject.toml
lang: 'python'
path: ./pyproject.toml

# Using setup.py
lang: 'python' 
path: ./setup.py

# Using __init__.py
lang: 'python'
path: ./src/mypackage/__init__.py
```

## Features

✅ **Multi-language support**: JavaScript, Rust, PHP, Python  
✅ **Semantic versioning**: major, minor, patch, hotfix bumps  
✅ **Auto-detection**: Automatically finds Python project files  
✅ **Safe operations**: Read-only mode by default  
✅ **Git integration**: Automatic tagging and committing  
✅ **Format preservation**: Maintains original file formatting

## Supported File Formats

| Language | File Types | Auto-detection |
|----------|------------|----------------|
| JavaScript | `package.json` | ❌ |
| Rust | `Cargo.toml` | ❌ |
| PHP | `composer.json` | ❌ |
| Python | `pyproject.toml`, `setup.py`, `__init__.py` | ✅ |

For more examples, see [EXAMPLES.md](EXAMPLES.md)
