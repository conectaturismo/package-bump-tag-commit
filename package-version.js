const fs = require('fs');
const TOML = require('@ltd/j-toml');
const semver = require('semver');

module.exports = class PackageVersion {
  constructor(file, version, lang, path) {
    this.version = version;
    this.file = file;
    this.lang = lang;
    this.path = path;
  }

  static fromFile(path, lang) {
    if (lang === 'js') {
      fs.accessSync(path);
      const versionFile = fs.readFileSync(path);
      const data = JSON.parse(versionFile);
      return new PackageVersion(data, data.version, lang, path);
    } else if (lang === 'rust') {
      fs.accessSync(path);
      const cargo = fs.readFileSync(path);
      const data = TOML.parse(cargo);
      return new PackageVersion(data, data.package.version, lang, path);
    } else if (lang === 'php') {
      fs.accessSync(path);
      const versionFile = fs.readFileSync(path);
      const data = JSON.parse(versionFile);
      return new PackageVersion(data, data.version, lang, path);
    } else if (lang === 'python') {
      fs.accessSync(path);
      const content = fs.readFileSync(path, 'utf8');
      let data, version;
      
      // Detect file type by content and name
      const isTomlFile = path.includes('.toml') || content.includes('[project]') || content.includes('[tool.poetry]');
      const isSetupPy = path.includes('setup.py') || content.includes('setup(');
      const isInitPy = path.includes('__init__.py') || content.includes('__version__');
      
      if (isTomlFile) {
        // pyproject.toml format
        data = TOML.parse(content);
        version = data.project?.version || data.tool?.poetry?.version;
      } else if (isSetupPy) {
        // Extract version from setup.py
        const versionMatch = content.match(/version\s*=\s*['"]([^'"]+)['"]/);
        if (!versionMatch) throw new Error('Version not found in setup.py');
        version = versionMatch[1];
        data = { version, _content: content, _fileType: 'setup.py' };
      } else if (isInitPy) {
        // Extract version from __init__.py
        const versionMatch = content.match(/__version__\s*=\s*['"]([^'"]+)['"]/);
        if (!versionMatch) throw new Error('__version__ not found in __init__.py');
        version = versionMatch[1];
        data = { version, _content: content, _fileType: '__init__.py' };
      } else {
        throw new Error(`Unsupported Python file format: ${path}`);
      }
      
      if (!version) throw new Error('Version not found in Python project file');
      return new PackageVersion(data, version, lang, path);
    } else {
      throw new Error(`Language ${lang} is not supported`);
    }
  }

  bump(rawLvl) {
    const lvl = rawLvl === 'hotfix' ? 'prerelease' : rawLvl;
    const version = semver.valid(this.version);
    if (!version) throw new Error(`Version ${version} is not valid semver`);
    if (rawLvl !== 'none') {
      this.version = semver.inc(this.version, lvl, 'hotfix');
    }
    return this;
  }

  save() {
    if (this.lang === 'js') {
      this.file.version = this.version;
      const file = JSON.stringify(this.file, null, 2);
      fs.writeFileSync(this.path, file + '\n');
    } else if (this.lang === 'rust') {
      this.file.package.version = this.version;
      const file = TOML.stringify(this.file, {
        newline: '\n',
        newlineAround: 'section',
      });
      fs.writeFileSync(this.path, file + '\n');
    } else if (this.lang === 'php') {
      this.file.version = this.version;
      const file = JSON.stringify(this.file, null, 2);
      fs.writeFileSync(this.path, file + '\n');
    } else if (this.lang === 'python') {
      const isTomlFile = this.path.includes('.toml') || !this.file._fileType;
      const isSetupPy = this.file._fileType === 'setup.py' || this.path.includes('setup.py');
      const isInitPy = this.file._fileType === '__init__.py' || this.path.includes('__init__.py');
      
      if (isTomlFile && !isSetupPy && !isInitPy) {
        // Update pyproject.toml
        if (this.file.project) {
          this.file.project.version = this.version;
        } else if (this.file.tool?.poetry) {
          this.file.tool.poetry.version = this.version;
        }
        const file = TOML.stringify(this.file, {
          newline: '\n',
          newlineAround: 'section',
        });
        fs.writeFileSync(this.path, file + '\n');
      } else if (isSetupPy) {
        // Update setup.py
        const updatedContent = this.file._content.replace(
          /version\s*=\s*['"][^'"]+['"]/,
          `version='${this.version}'`
        );
        fs.writeFileSync(this.path, updatedContent);
      } else if (isInitPy) {
        // Update __init__.py
        const updatedContent = this.file._content.replace(
          /__version__\s*=\s*['"][^'"]+['"]/,
          `__version__ = '${this.version}'`
        );
        fs.writeFileSync(this.path, updatedContent);
      }
    }
  }
};
