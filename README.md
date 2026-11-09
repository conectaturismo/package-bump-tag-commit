# Package Bump Tag Commit

A modern, extensible GitHub Action built with SOLID principles that reads version from package files, bumps it according to semantic versioning, and optionally creates tags and commits. Supports **JavaScript**, **Rust**, **PHP**, and **Python** projects with a clean architecture for easy language expansion.

## ✨ Features

- 🏗️ **SOLID Architecture**: Built with Clean Architecture principles for maintainability and extensibility
- 🌍 **Multi-language Support**: JavaScript, Rust, PHP, and Python with multiple file formats
- 🧪 **Comprehensive Testing**: 18+ integration tests ensuring reliability across all languages
- 🔧 **Easy Extension**: Add new languages by updating a single configuration file
- 📦 **Semantic Versioning**: Full semver compliance with major, minor, patch, and hotfix bumps
- 🚀 **Production Ready**: Optimized 1.4MB bundle with zero dependencies conflicts

## 📋 Usage

### Basic Examples

**JavaScript Project:**
```yaml
- name: Bump JavaScript version
  uses: conectaturismo/package-bump-tag-commit@v1
  with:
    bumpLvl: patch
    lang: js
    save: true
    githubToken: ${{ secrets.GITHUB_TOKEN }}
    path: ./package.json
```

**Python Project (modern):**
```yaml
- name: Bump Python version
  uses: conectaturismo/package-bump-tag-commit@v1
  with:
    bumpLvl: minor
    lang: python
    save: true
    githubToken: ${{ secrets.GITHUB_TOKEN }}
    path: ./pyproject.toml
```

**Rust Project:**
```yaml
- name: Bump Rust version
  uses: conectaturismo/package-bump-tag-commit@v1
  with:
    bumpLvl: major
    lang: rust
    save: true
    githubToken: ${{ secrets.GITHUB_TOKEN }}
    path: ./Cargo.toml
```

## ⚙️ Inputs

| Input | Description | Default | Options |
|-------|-------------|---------|---------|
| `lang` | Programming language | `js` | `js`, `rust`, `php`, `python` |
| `bumpLvl` | Version bump type | `patch` | `major`, `minor`, `patch`, `hotfix` |
| `save` | Persist changes to file | `false` | `true`, `false` |
| `githubToken` | GitHub token for commits/tags | - | `${{ secrets.GITHUB_TOKEN }}` |
| `path` | Path to package file | *auto-detected* | Any valid file path |

### What gets committed with `save: true`

Only the version file (`path`, or the auto-detected package file) goes into the `CI: Publish new version` commit. Anything else in the workspace is left out, even if it is untracked, modified or already staged by a previous step: credential files such as the `gha-creds-*.json` written by `google-github-actions/auth`, generated `.env` files, build output, etc.

The commit is pushed first, and the tag/release is then created on that exact commit.

## 📤 Outputs

| Output | Description | Example |
|--------|-------------|---------|
| `version` | The new bumped version | `1.2.3` |

## 🌍 Supported Languages & File Formats

### JavaScript (`js`)
**Supported files:** `package.json`
```yaml
- name: Bump JS version
  uses: conectaturismo/package-bump-tag-commit@v1
  with:
    lang: js
    bumpLvl: patch
    path: ./package.json  # Optional - auto-detected
```

### Rust (`rust`)
**Supported files:** `Cargo.toml`
```yaml
- name: Bump Rust version
  uses: conectaturismo/package-bump-tag-commit@v1
  with:
    lang: rust
    bumpLvl: minor
    path: ./Cargo.toml  # Optional - auto-detected
```

### PHP (`php`)
**Supported files:** `composer.json`
```yaml
- name: Bump PHP version
  uses: conectaturismo/package-bump-tag-commit@v1
  with:
    lang: php
    bumpLvl: major
    path: ./composer.json  # Optional - auto-detected
```

### Python (`python`)
**Supported files:** `pyproject.toml`, `setup.py`, `__init__.py`

**Modern Python (recommended):**
```yaml
- name: Bump Python version (modern)
  uses: conectaturismo/package-bump-tag-commit@v1
  with:
    lang: python
    bumpLvl: patch
    path: ./pyproject.toml  # Optional - auto-detected
```

**Traditional setup:**
```yaml
- name: Bump Python version (traditional)
  uses: conectaturismo/package-bump-tag-commit@v1
  with:
    lang: python
    bumpLvl: minor
    path: ./setup.py  # Optional - auto-detected
```

**Package variable:**
```yaml
- name: Bump Python package version
  uses: conectaturismo/package-bump-tag-commit@v1
  with:
    lang: python
    bumpLvl: patch
    path: ./src/mypackage/__init__.py  # Must be explicit
```

## 🏗️ Architecture Overview

This action is built using **Clean Architecture** and **SOLID principles** for maximum maintainability and extensibility:

### Core Components

- **🎭 ActionOrchestrator**: Coordinates the entire workflow
- **📦 PackageVersion**: Handles version operations and file management
- **🔢 VersionBumper**: Semantic version calculation and bumping logic
- **⚙️ ConfigService**: Centralized configuration management
- **🏭 Factories**: Dynamic parser/writer creation (ParserFactory, WriterFactory)
- **🔧 Services**: Specialized services (InputService, OutputService, GitService, PathResolverService)
- **📖 Parsers**: Language-specific file parsers (JSParser, RustParser, PHPParser, PythonParser)
- **✍️ Writers**: Language-specific file writers (JSWriter, RustWriter, PHPWriter, PythonWriter)

### Benefits of This Architecture

- **🔄 Easy Extension**: Add new languages by updating only ConfigService
- **🧪 Testable**: Each component is independently testable
- **🛠️ Maintainable**: Clear separation of concerns
- **🔒 Reliable**: Comprehensive test coverage (18+ integration tests)
- **📈 Scalable**: Factory pattern handles dynamic language support

## 🔧 Adding a New Language (Easy!)

Thanks to the **ConfigService-driven architecture**, adding a new language is incredibly simple. All language configuration is centralized in one file!

### Step 1: Update ConfigService ⚙️

Edit `src/config/ConfigService.js` and add your new language:

```javascript
class ConfigService {
  static get SUPPORTED_LANGUAGES() {
    return ['js', 'rust', 'php', 'python', 'go']; // ← Add your language
  }

  static get DEFAULT_PACKAGE_FILES() {
    return {
      js: 'package.json',
      rust: 'Cargo.toml', 
      php: 'composer.json',
      python: 'pyproject.toml',
      go: 'go.mod' // ← Add default file
    };
  }

  static get LANGUAGE_FILE_PATTERNS() {
    return {
      js: ['package.json'],
      rust: ['Cargo.toml'],
      php: ['composer.json'],
      python: ['pyproject.toml', 'setup.py', '__init__.py'],
      go: ['go.mod'] // ← Add file patterns
    };
  }

  static get LANGUAGE_TEST_BUMPS() {
    return {
      js: ['patch', 'minor', 'major'],
      rust: ['patch', 'minor', 'major'],
      php: ['patch', 'minor', 'major', 'hotfix'],
      python: {
        'pyproject.toml': ['patch', 'minor', 'major'],
        'setup.py': ['patch', 'minor', 'major'],
        '__init__.py': ['patch', 'minor']
      },
      go: ['patch', 'minor', 'major'] // ← Add test configurations
    };
  }
}
```

### Step 2: Create Parser 📖

Create `src/parsers/GoParser.js`:

```javascript
const BaseParser = require('./BaseParser');

class GoParser extends BaseParser {
  parse(filePath, content) {
    // Parse go.mod content
    const lines = content.split('\n');
    const moduleLine = lines.find(line => line.startsWith('module '));
    return {
      module: moduleLine ? moduleLine.replace('module ', '').trim() : '',
      content: content,
      lines: lines
    };
  }
  
  extractVersion(data) {
    // Extract version from go.mod (usually in version tag format)
    const versionLine = data.lines.find(line => line.includes('// version:'));
    if (versionLine) {
      return versionLine.split('// version:')[1].trim();
    }
    return '0.1.0'; // default
  }
  
  canHandle(filePath) {
    return this.constructor.name === 'GoParser' && 
           ConfigService.isFileForLanguage('go', filePath);
  }
}

module.exports = GoParser;
```

### Step 3: Create Writer ✍️

Create `src/writers/GoWriter.js`:

```javascript
const BaseWriter = require('./BaseWriter');
const fs = require('fs');

class GoWriter extends BaseWriter {
  write(filePath, data, newVersion) {
    const updatedContent = this.updateVersion(data, newVersion);
    fs.writeFileSync(filePath, updatedContent);
  }

  updateVersion(data, newVersion) {
    const lines = data.lines;
    const versionLineIndex = lines.findIndex(line => line.includes('// version:'));
    
    if (versionLineIndex !== -1) {
      lines[versionLineIndex] = `// version: ${newVersion}`;
    } else {
      lines.push(`// version: ${newVersion}`);
    }
    
    return lines.join('\n');
  }

  canHandle(filePath) {
    return this.constructor.name === 'GoWriter' && 
           ConfigService.isFileForLanguage('go', filePath);
  }
}

module.exports = GoWriter;
```

### Step 4: Register in Factories 🏭

**Add to `src/factories/ParserFactory.js`:**

```javascript
const GoParser = require('../parsers/GoParser');

// Add to getParserByLanguage method:
getParserByLanguage(lang) {
  switch (lang) {
    // ... existing cases
    case 'go':
      return new GoParser();
    // ...
  }
}
```

**Add to `src/factories/WriterFactory.js`:**

```javascript
const GoWriter = require('../writers/GoWriter');

// Add to getWriterByLanguage method:
getWriterByLanguage(lang) {
  switch (lang) {
    // ... existing cases  
    case 'go':
      return new GoWriter();
    // ...
  }
}
```

### Step 5: Add Example & Test 🧪

Create `examples/go.mod`:

```go
module example.com/myproject

go 1.21

// version: 1.0.0
```

**That's it!** The testing framework will automatically:
- ✅ Detect the new language from `ConfigService`
- ✅ Run version bump tests
- ✅ Validate parser/writer functionality
- ✅ Ensure integration works end-to-end

### Why This Architecture Rocks 🚀

- **🎯 Single Point of Configuration**: Only update `ConfigService` for new languages
- **🔄 Auto-Discovery**: Factories automatically detect new parsers/writers  
- **🧪 Auto-Testing**: Test framework picks up new languages automatically
- **📦 Zero Duplication**: No hardcoded language lists scattered across files
- **🛠️ Maintainable**: Clean separation between configuration and implementation

The **ConfigService** pattern ensures that adding a new language requires minimal changes and prevents configuration drift across the codebase.

## 🧪 Testing & Quality Assurance

The action includes a comprehensive testing framework with **18+ integration tests** covering all languages and scenarios:

### Running Tests

```bash
# Run all tests (recommended)
npm test

# Run verbose tests with detailed output
npm run test:verbose

# Test specific languages
npm run test:js      # JavaScript only
npm run test:rust    # Rust only  
npm run test:php     # PHP only
npm run test:python  # Python only

# Git flow with save=true (local remote + fake GitHub API, no network)
npm run test:git     # source (index.js)
npm run test:dist    # published bundle (dist/index.js) — run after `npm run build`
```

### Test Coverage

- ✅ **Version Parsing**: All supported file formats
- ✅ **Version Bumping**: major, minor, patch, hotfix levels
- ✅ **File Writing**: Preserves formatting and structure
- ✅ **Error Handling**: Invalid versions, missing files, permission issues
- ✅ **Integration**: End-to-end workflow testing
- ✅ **Multi-format**: Python supports pyproject.toml, setup.py, __init__.py

### Test Results Example

```
🧪 Running Integration Tests for Package Bump Tag Commit

✅ JS: package.json patch bump (1.0.0 → 1.0.1)
✅ JS: package.json minor bump (1.0.1 → 1.1.0)
✅ JS: package.json major bump (1.1.0 → 2.0.0)
✅ Rust: Cargo.toml patch bump (0.1.0 → 0.1.1)
✅ Rust: Cargo.toml minor bump (0.1.1 → 0.2.0)
✅ Rust: Cargo.toml major bump (0.2.0 → 1.0.0)
✅ PHP: composer.json patch bump (1.0.0 → 1.0.1)
✅ PHP: composer.json minor bump (1.0.1 → 1.1.0)
✅ PHP: composer.json major bump (1.1.0 → 2.0.0)
✅ PHP: composer.json hotfix bump (2.0.0 → 2.0.1)
✅ Python: pyproject.toml patch bump (0.1.0 → 0.1.1)
✅ Python: pyproject.toml minor bump (0.1.1 → 0.2.0)
✅ Python: pyproject.toml major bump (0.2.0 → 1.0.0)
✅ Python: setup.py patch bump (1.0.0 → 1.0.1)
✅ Python: setup.py minor bump (1.0.1 → 1.1.0)
✅ Python: setup.py major bump (1.1.0 → 2.0.0)
✅ Python: __init__.py patch bump (0.1.0 → 0.1.1)
✅ Python: __init__.py minor bump (0.1.1 → 0.2.0)

🎉 All 18 tests passed! ✨
```

## 🚀 Build & Deployment

The action is built using **@vercel/ncc** for optimal performance:

```bash
# Build optimized bundle
npm run build

# Output: dist/index.js (~1.4MB optimized)
```

### Build Features

- **📦 Single Bundle**: All dependencies included
- **🔄 Zero Dependencies**: No runtime dependency conflicts
- **⚡ Fast Startup**: Optimized bundle for quick GitHub Actions execution
- **📄 License Tracking**: Automatic license collection in `licenses.txt`

## 🔍 Troubleshooting

### Common Issues

**❌ "Unsupported language" error:**
```yaml
# ✅ Correct
lang: js  # lowercase

# ❌ Incorrect  
lang: JavaScript  # case sensitive
```

**❌ "No package file found" error:**
```yaml
# ✅ Explicit path
path: ./my-app/package.json

# ✅ Auto-detection (searches for default files)
# No path specified - will find package.json automatically
```

**❌ "Invalid version format" error:**
- Ensure your version follows semantic versioning (e.g., `1.0.0`)
- Check for extra spaces or characters in version strings

### Debug Mode

For detailed logging, check the GitHub Actions run logs. The action provides comprehensive error messages and step-by-step execution details.

## 📋 Migration from v1.x

If you're upgrading from v1.x, the new architecture is **100% backward compatible**. No changes needed to your workflows!

### What's New in v2.0

- 🏗️ **SOLID Architecture**: Complete rewrite with Clean Architecture
- 🌍 **Multi-language Support**: Added Rust, PHP, Python
- 🧪 **Comprehensive Testing**: 18+ integration tests
- ⚙️ **ConfigService**: Centralized configuration management
- 🏭 **Factory Pattern**: Dynamic parser/writer creation
- 📦 **Better Performance**: Optimized bundle size and startup time

## 📚 API Reference

### Core Classes

- **`ActionOrchestrator`**: Main workflow coordinator
- **`PackageVersion`**: Version management and file operations  
- **`VersionBumper`**: Semantic version calculations
- **`ConfigService`**: Centralized configuration and language support
- **`ParserFactory`**: Dynamic parser creation based on language
- **`WriterFactory`**: Dynamic writer creation based on language

### Services

- **`InputService`**: GitHub Actions input processing
- **`OutputService`**: GitHub Actions output management  
- **`GitService`**: Git operations (tags, commits)
- **`PathResolverService`**: File path resolution and detection

## 🤝 Contributing

We welcome contributions! The modular architecture makes it easy to add new features:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-language`
3. **Add your language support** following the guide above
4. **Run tests**: `npm test`
5. **Submit a pull request**

### Development Setup

```bash
# Clone repository
git clone https://github.com/conectaturismo/package-bump-tag-commit.git

# Install dependencies  
npm install

# Install GitHub CLI (required for releases)
# Windows: winget install --id GitHub.cli
# macOS: brew install gh
# Linux: Check https://github.com/cli/cli#installation

# Authenticate with GitHub
gh auth login

# Run tests
npm test

# Build bundle
npm run build
```

### Development Scripts

```bash
# Version management
npm run version              # Show current version
npm run bump:patch          # Bump patch + full release
npm run bump:minor          # Bump minor + full release  
npm run bump:major          # Bump major + full release

# Release management (requires GitHub CLI)
npm run release             # Full release process
npm run release:prepare     # Build and commit dist/
npm run release:tag         # Push current tag to GitHub
npm run release:github      # Create GitHub release
npm run release:open        # Open repository in browser
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ using:
- [@actions/core](https://github.com/actions/toolkit/tree/master/packages/core) - GitHub Actions toolkit
- [@actions/github](https://github.com/actions/toolkit/tree/master/packages/github) - GitHub API integration  
- [semver](https://github.com/npm/node-semver) - Semantic versioning utilities
- [@ltd/j-toml](https://github.com/LongTengDao/j-toml) - TOML parsing for Rust/Python
- [@vercel/ncc](https://github.com/vercel/ncc) - Bundle compilation

---

**Made with 🚀 by [Conecta Turismo](https://github.com/conectaturismo)**
