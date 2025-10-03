/**
 * Abstract base class for version file parsers
 * Defines the interface that all language parsers must implement
 */
class BaseParser {
  /**
   * Parse version from file content
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   * @returns {object} Parsed data with version information
   */
  parse(filePath, content) {
    throw new Error('parse() method must be implemented by subclass');
  }

  /**
   * Extract version from parsed data
   * @param {object} data - Parsed file data
   * @returns {string} Version string
   */
  extractVersion(data) {
    throw new Error('extractVersion() method must be implemented by subclass');
  }

  /**
   * Check if this parser can handle the given file
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   * @returns {boolean} True if parser can handle the file
   */
  canHandle(filePath, content) {
    throw new Error('canHandle() method must be implemented by subclass');
  }

  /**
   * Get file extensions supported by this parser
   * @returns {string[]} Array of supported extensions
   */
  getSupportedExtensions() {
    throw new Error('getSupportedExtensions() method must be implemented by subclass');
  }
}

module.exports = BaseParser;