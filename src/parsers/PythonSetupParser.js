const BaseParser = require('./BaseParser');

/**
 * Parser for Python setup.py files
 */
class PythonSetupParser extends BaseParser {
  parse(filePath, content) {
    return {
      _content: content,
      _fileType: 'setup.py',
      _filePath: filePath
    };
  }

  extractVersion(data) {
    const content = data._content;
    const versionMatch = content.match(/version\s*=\s*['"]([^'"]+)['"]/);
    if (!versionMatch) {
      throw new Error('Version not found in setup.py (looking for version="..." or version=\'...\')');
    }
    return versionMatch[1];
  }

  canHandle(filePath, content) {
    return (
      filePath.includes('setup.py') &&
      content.includes('setup(') &&
      /version\s*=\s*['"][^'"]+['"]/.test(content)
    );
  }

  getSupportedExtensions() {
    return ['.py'];
  }
}

module.exports = PythonSetupParser;