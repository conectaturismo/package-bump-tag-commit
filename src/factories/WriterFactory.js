const JavaScriptWriter = require('../writers/JavaScriptWriter');
const RustWriter = require('../writers/RustWriter');
const PhpWriter = require('../writers/PhpWriter');
const PythonTomlWriter = require('../writers/PythonTomlWriter');
const PythonSetupWriter = require('../writers/PythonSetupWriter');
const PythonInitWriter = require('../writers/PythonInitWriter');

/**
 * Factory class for creating appropriate writers
 */
class WriterFactory {
  constructor() {
    this.writers = [
      new JavaScriptWriter(),
      new RustWriter(),
      new PhpWriter(),
      new PythonTomlWriter(),
      new PythonSetupWriter(),
      new PythonInitWriter()
    ];
  }

  /**
   * Find the appropriate writer for a file and data
   * @param {string} filePath - Path to the file
   * @param {object} data - Parsed data
   * @returns {BaseWriter} The appropriate writer
   * @throws {Error} If no suitable writer is found
   */
  getWriter(filePath, data) {
    for (const writer of this.writers) {
      if (writer.canHandle(filePath, data)) {
        return writer;
      }
    }
    
    throw new Error(`No writer found for file: ${filePath}`);
  }
}

module.exports = WriterFactory;