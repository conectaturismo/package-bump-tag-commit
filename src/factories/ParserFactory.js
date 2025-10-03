const JavaScriptParser = require('../parsers/JavaScriptParser');
const RustParser = require('../parsers/RustParser');
const PhpParser = require('../parsers/PhpParser');
const PythonTomlParser = require('../parsers/PythonTomlParser');
const PythonSetupParser = require('../parsers/PythonSetupParser');
const PythonInitParser = require('../parsers/PythonInitParser');
const ConfigService = require('../config/ConfigService');

/**
 * Factory class for creating appropriate parsers
 */
class ParserFactory {
  constructor() {
    this.parsers = [
      new JavaScriptParser(),
      new RustParser(),
      new PhpParser(),
      new PythonTomlParser(),
      new PythonSetupParser(),
      new PythonInitParser()
    ];
  }

  /**
   * Find the appropriate parser for a file
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   * @returns {BaseParser} The appropriate parser
   * @throws {Error} If no suitable parser is found
   */
  getParser(filePath, content) {
    for (const parser of this.parsers) {
      if (parser.canHandle(filePath, content)) {
        return parser;
      }
    }
    
    throw new Error(`No parser found for file: ${filePath}`);
  }

  /**
   * Get parser by language name
   * @param {string} lang - Language identifier (js, rust, php, python)
   * @param {string} filePath - Path to the file (for Python disambiguation)
   * @param {string} content - File content (for Python disambiguation)  
   * @returns {BaseParser} The appropriate parser
   * @throws {Error} If language is not supported
   */
  getParserByLanguage(lang, filePath = '', content = '') {
    switch (lang) {
      case 'js':
        return new JavaScriptParser();
      case 'rust':
        return new RustParser();
      case 'php':
        return new PhpParser();
      case 'python':
        // For Python, we need to determine the specific format
        if (filePath.includes('.toml') || content.includes('[project]') || content.includes('[tool.poetry]')) {
          return new PythonTomlParser();
        } else if (filePath.includes('setup.py') || content.includes('setup(')) {
          return new PythonSetupParser();
        } else if (filePath.includes('__init__.py') || content.includes('__version__')) {
          return new PythonInitParser();
        } else {
          // Default to TOML for Python
          return new PythonTomlParser();
        }
      default:
        throw new Error(`Unsupported language: ${lang}`);
    }
  }

  /**
   * Get all supported languages
   * @returns {string[]} Array of supported language identifiers
   */
  getSupportedLanguages() {
    return ConfigService.SUPPORTED_LANGUAGES;
  }
}

module.exports = ParserFactory;