const fs = require('fs');
const ParserFactory = require('./factories/ParserFactory');
const WriterFactory = require('./factories/WriterFactory');
const VersionBumper = require('./VersionBumper');

/**
 * Main class for handling package version operations
 * Orchestrates parsing, version bumping, and writing across different languages
 */
class PackageVersion {
  constructor(filePath, data, version, parser, writer) {
    this.filePath = filePath;
    this.data = data;
    this.version = version;
    this.parser = parser;
    this.writer = writer;
  }

  /**
   * Create PackageVersion instance from file
   * @param {string} filePath - Path to the package file
   * @param {string} lang - Language identifier (js, rust, php, python)
   * @returns {PackageVersion} New instance
   * @throws {Error} If file cannot be read or parsed
   */
  static fromFile(filePath, lang) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const parserFactory = new ParserFactory();
    const writerFactory = new WriterFactory();

    let parser;
    let writer;
    if (lang) {
      parser = parserFactory.getParserByLanguage(lang, filePath, content);
    } else {
      parser = parserFactory.getParser(filePath, content);
    }

    const data = parser.parse(filePath, content);
    const version = parser.extractVersion(data);
    
    if (lang) {
      writer = writerFactory.getWriterByLanguage(lang, filePath, data);
    } else {
      writer = writerFactory.getWriter(filePath, data);
    }

    return new PackageVersion(filePath, data, version, parser, writer);
  }

  /**
   * Create PackageVersion instance with auto-detection
   * @param {string} filePath - Path to the package file
   * @returns {PackageVersion} New instance
   * @throws {Error} If file cannot be read or parsed
   */
  static fromFileAuto(filePath) {
    return PackageVersion.fromFile(filePath);
  }

  /**
   * Bump the version
   * @param {string} bumpLevel - Bump level (major, minor, patch, hotfix, none)
   * @returns {PackageVersion} This instance for chaining
   * @throws {Error} If bump level is invalid
   */
  bump(bumpLevel) {
    const newVersion = VersionBumper.bump(this.version, bumpLevel);
    this.version = newVersion;
    this.data = this.writer.updateVersion(this.data, newVersion);
    return this;
  }

  /**
   * Get what the next version would be without applying it
   * @param {string} bumpLevel - Bump level
   * @returns {string} Next version string
   */
  getNextVersion(bumpLevel) {
    return VersionBumper.getNextVersion(this.version, bumpLevel);
  }

  /**
   * Save the updated version to file
   * @throws {Error} If file cannot be written
   */
  save() {
    this.writer.write(this.filePath, this.data, this.version);
  }

  /**
   * Get current version without bumping
   * @returns {string} Current version
   */
  getCurrentVersion() {
    return this.version;
  }

  /**
   * Get file path
   * @returns {string} File path
   */
  getFilePath() {
    return this.filePath;
  }

  /**
   * Get supported languages
   * @returns {string[]} Array of supported language identifiers
   */
  static getSupportedLanguages() {
    const factory = new ParserFactory();
    return factory.getSupportedLanguages();
  }

  /**
   * Check if a language is supported
   * @param {string} lang - Language identifier
   * @returns {boolean} True if supported
   */
  static isLanguageSupported(lang) {
    return PackageVersion.getSupportedLanguages().includes(lang);
  }
}

module.exports = PackageVersion;