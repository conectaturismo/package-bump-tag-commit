const JavaScriptWriter = require('../writers/JavaScriptWriter');
const RustWriter = require('../writers/RustWriter');
const PhpWriter = require('../writers/PhpWriter');
const PythonTomlWriter = require('../writers/PythonTomlWriter');
const PythonSetupWriter = require('../writers/PythonSetupWriter');
const PythonInitWriter = require('../writers/PythonInitWriter');
const GoWriter = require('../writers/GoWriter');

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
      new PythonInitWriter(),
      new GoWriter()
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

  /**
   * Get writer by language name
   * @param {string} lang - Language identifier (js, rust, php, python, go)
   * @param {string} filePath - Path to the file (for Python disambiguation)
   * @param {Object} data - Parsed data (for Python disambiguation)
   * @returns {BaseWriter} The appropriate writer
   * @throws {Error} If language is not supported
   */
  getWriterByLanguage(lang, filePath = '', data = null) {
    switch (lang) {
      case 'js':
        return new JavaScriptWriter();
      case 'rust':
        return new RustWriter();
      case 'php':
        return new PhpWriter();
      case 'python':
        // For Python, we need to determine the specific format
        if (filePath.includes('.toml') || (data && (data.content && data.content.includes('[project]') || data.content && data.content.includes('[tool.poetry]')))) {
          return new PythonTomlWriter();
        } else if (filePath.includes('setup.py') || (data && data.content && data.content.includes('setup('))) {
          return new PythonSetupWriter();
        } else if (filePath.includes('__init__.py') || (data && data.content && data.content.includes('__version__'))) {
          return new PythonInitWriter();
        } else {
          // Default to TOML for Python
          return new PythonTomlWriter();
        }
      case 'go':
        return new GoWriter();
      default:
        throw new Error(`Unsupported language: ${lang}`);
    }
  }
}

module.exports = WriterFactory;