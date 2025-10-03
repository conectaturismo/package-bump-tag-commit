const BaseParser = require('./BaseParser');
const ConfigService = require('../config/ConfigService');

/**
 * Parser for Go go.mod files
 * Handles parsing of Go module files and version extraction
 */
class GoParser extends BaseParser {
  /**
   * Parse go.mod file content
   * @param {string} filePath - Path to the go.mod file
   * @param {string} content - File content
   * @returns {Object} Parsed data structure
   */
  parse(filePath, content) {
    const lines = content.split('\n');
    const data = {
      module: '',
      goVersion: '',
      version: '0.1.0', // Default version
      dependencies: [],
      lines: lines,
      originalContent: content
    };

    // Parse module declaration
    const moduleLine = lines.find(line => line.trim().startsWith('module '));
    if (moduleLine) {
      data.module = moduleLine.replace(/^module\s+/, '').trim();
    }

    // Parse go version
    const goVersionLine = lines.find(line => line.trim().startsWith('go '));
    if (goVersionLine) {
      data.goVersion = goVersionLine.replace(/^go\s+/, '').trim();
    }

    // Look for version comment (our convention)
    const versionLine = lines.find(line => 
      line.includes('// version:') || line.includes('//version:')
    );
    if (versionLine) {
      const versionMatch = versionLine.match(/\/\/\s*version:\s*(.+)/);
      if (versionMatch) {
        data.version = versionMatch[1].trim();
      }
    }

    return data;
  }

  /**
   * Extract version from parsed data
   * @param {Object} data - Parsed data from parse()
   * @returns {string} Version string
   */
  extractVersion(data) {
    return data.version || '0.1.0';
  }

  /**
   * Check if this parser can handle the given file
   * @param {string} filePath - File path to check
   * @returns {boolean} True if can handle
   */
  canHandle(filePath) {
    return this.constructor.name === 'GoParser' && 
           ConfigService.isFileForLanguage('go', filePath);
  }

  /**
   * Get supported file extensions for Go
   * @returns {Array<string>} Array of supported extensions
   */
  getSupportedExtensions() {
    return ['.mod'];
  }

  /**
   * Get supported file names for Go
   * @returns {Array<string>} Array of supported file names
   */
  getSupportedFileNames() {
    return ['go.mod'];
  }
}

module.exports = GoParser;