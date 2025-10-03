const BaseWriter = require('./BaseWriter');
const ConfigService = require('../config/ConfigService');
const fs = require('fs');

/**
 * Writer for Go go.mod files
 * Handles writing updated version information back to go.mod files
 */
class GoWriter extends BaseWriter {
  /**
   * Write updated version to go.mod file
   * @param {string} filePath - Path to the go.mod file
   * @param {Object} data - Parsed data from GoParser
   * @param {string} newVersion - New version to write
   */
  write(filePath, data, newVersion) {
    const updatedContent = this.updateVersion(data, newVersion);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
  }

  /**
   * Update version in the data structure
   * @param {Object} data - Parsed data from GoParser
   * @param {string} newVersion - New version string
   * @returns {string} Updated file content
   */
  updateVersion(data, newVersion) {
    const lines = [...data.lines];
    let versionLineIndex = -1;

    // Look for existing version comment
    versionLineIndex = lines.findIndex(line => 
      line.includes('// version:') || line.includes('//version:')
    );

    const versionComment = `// version: ${newVersion}`;

    if (versionLineIndex !== -1) {
      // Update existing version line
      lines[versionLineIndex] = versionComment;
    } else {
      // Add version comment after module declaration
      const moduleLineIndex = lines.findIndex(line => 
        line.trim().startsWith('module ')
      );

      if (moduleLineIndex !== -1) {
        // Insert after module line
        lines.splice(moduleLineIndex + 1, 0, versionComment);
      } else {
        // If no module line found, add at the beginning
        lines.unshift(versionComment);
      }
    }

    // Remove any trailing empty lines and ensure single trailing newline
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    
    return lines.join('\n') + '\n';
  }

  /**
   * Check if this writer can handle the given file and data
   * @param {string} filePath - File path to check
   * @param {Object} data - Parsed data (optional)
   * @returns {boolean} True if can handle
   */
  canHandle(filePath, data = null) {
    return this.constructor.name === 'GoWriter' && 
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

module.exports = GoWriter;