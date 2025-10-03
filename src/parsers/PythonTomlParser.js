const BaseParser = require('./BaseParser');
const TOML = require('@ltd/j-toml');

/**
 * Parser for Python pyproject.toml files
 */
class PythonTomlParser extends BaseParser {
  parse(filePath, content) {
    try {
      return TOML.parse(content);
    } catch (error) {
      throw new Error(`Invalid TOML in ${filePath}: ${error.message}`);
    }
  }

  extractVersion(data) {
    const version = data.project?.version || data.tool?.poetry?.version;
    if (!version) {
      throw new Error('No version field found in pyproject.toml (checked project.version and tool.poetry.version)');
    }
    return version;
  }

  canHandle(filePath, content) {
    return (
      (filePath.includes('pyproject.toml') || filePath.includes('.toml')) &&
      (content.includes('[project]') || content.includes('[tool.poetry]'))
    );
  }

  getSupportedExtensions() {
    return ['.toml'];
  }
}

module.exports = PythonTomlParser;