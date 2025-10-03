const BaseParser = require('./BaseParser');

/**
 * Parser for Python __init__.py files with __version__
 */
class PythonInitParser extends BaseParser {
  parse(filePath, content) {
    return {
      _content: content,
      _fileType: '__init__.py',
      _filePath: filePath
    };
  }

  extractVersion(data) {
    const content = data._content;
    const versionMatch = content.match(/__version__\s*=\s*['"]([^'"]+)['"]/);
    if (!versionMatch) {
      throw new Error('__version__ not found in __init__.py (looking for __version__ = "..." or __version__ = \'...\')');
    }
    return versionMatch[1];
  }

  canHandle(filePath, content) {
    return (
      filePath.includes('__init__.py') &&
      /__version__\s*=\s*['"][^'"]+['"]/.test(content)
    );
  }

  getSupportedExtensions() {
    return ['.py'];
  }
}

module.exports = PythonInitParser;