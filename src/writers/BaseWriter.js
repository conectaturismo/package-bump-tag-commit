/**
 * Abstract base class for version file writers
 * Defines the interface that all language writers must implement
 */
class BaseWriter {
  /**
   * Write updated data back to file
   * @param {string} filePath - Path to the file
   * @param {object} data - Data to write
   * @param {string} newVersion - New version to set
   */
  write(filePath, data, newVersion) {
    throw new Error('write() method must be implemented by subclass');
  }

  /**
   * Check if this writer can handle the given file type
   * @param {string} filePath - Path to the file
   * @param {object} data - Parsed data
   * @returns {boolean} True if writer can handle the file
   */
  canHandle(filePath, data) {
    throw new Error('canHandle() method must be implemented by subclass');
  }

  /**
   * Update version in data structure (in memory)
   * @param {object} data - Data structure to update
   * @param {string} newVersion - New version to set
   * @returns {object} Updated data structure
   */
  updateVersion(data, newVersion) {
    throw new Error('updateVersion() method must be implemented by subclass');
  }
}

module.exports = BaseWriter;