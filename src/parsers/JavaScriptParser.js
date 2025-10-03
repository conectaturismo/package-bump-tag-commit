const BaseParser = require('./BaseParser');
const ConfigService = require('../config/ConfigService');

/**
 * Parser for JavaScript package.json files
 */
class JavaScriptParser extends BaseParser {
  parse(filePath, content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
    }
  }

  extractVersion(data) {
    if (!data.version) {
      throw new Error('No version field found in package.json');
    }
    return data.version;
  }

  canHandle(filePath, content) {
    return ConfigService.isFileForLanguage(filePath, 'js') && this._isValidJSON(content);
  }

  getSupportedExtensions() {
    return ['.json'];
  }

  _isValidJSON(content) {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = JavaScriptParser;