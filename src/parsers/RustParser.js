const BaseParser = require('./BaseParser');
const ConfigService = require('../config/ConfigService');
const TOML = require('@ltd/j-toml');

/**
 * Parser for Rust Cargo.toml files
 */
class RustParser extends BaseParser {
  parse(filePath, content) {
    try {
      return TOML.parse(content);
    } catch (error) {
      throw new Error(`Invalid TOML in ${filePath}: ${error.message}`);
    }
  }

  extractVersion(data) {
    if (!data.package?.version) {
      throw new Error('No version field found in [package] section of Cargo.toml');
    }
    return data.package.version;
  }

  canHandle(filePath, content) {
    return ConfigService.isFileForLanguage(filePath, 'rust') && content.includes('[package]');
  }

  getSupportedExtensions() {
    return ['.toml'];
  }
}

module.exports = RustParser;