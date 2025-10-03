/**
 * Configuration service for GitHub Actions inputs and environment
 */
class ConfigService {
  /**
   * Supported programming languages
   */
  static get SUPPORTED_LANGUAGES() {
    return ['js', 'rust', 'php', 'python', 'go'];
  }

  /**
   * Default package files for each language
   */
  static get DEFAULT_PACKAGE_FILES() {
    return {
      js: 'package.json',
      rust: 'Cargo.toml', 
      php: 'composer.json',
      python: 'pyproject.toml',
      go: 'go.mod'
    };
  }

  /**
   * File patterns for language detection
   */
  static get LANGUAGE_FILE_PATTERNS() {
    return {
      js: ['package.json'],
      rust: ['Cargo.toml'],
      php: ['composer.json'],
      python: ['pyproject.toml', 'setup.py', '__init__.py'],
      go: ['go.mod']
    };
  }

  /**
   * Test bump levels for each language (for testing purposes)
   */
  static get LANGUAGE_TEST_BUMPS() {
    return {
      js: ['patch', 'minor', 'major'],
      rust: ['patch', 'minor', 'major'],
      php: ['patch', 'minor', 'major', 'hotfix'],
      python: {
        'pyproject.toml': ['patch', 'minor', 'major'],
        'setup.py': ['patch', 'minor', 'major'],
        '__init__.py': ['patch', 'minor']
      },
      go: ['patch', 'minor', 'major']
    };
  }

  /**
   * Supported bump levels
   */
  static get SUPPORTED_BUMP_LEVELS() {
    return ['major', 'minor', 'patch', 'hotfix', 'none'];
  }

  /**
   * Python file candidates for auto-detection
   */
  static get PYTHON_FILE_CANDIDATES() {
    return ['pyproject.toml', 'setup.py', 'src/__init__.py', '__init__.py'];
  }

  /**
   * Validate if a language is supported
   * @param {string} lang - Language identifier
   * @returns {boolean} True if supported
   */
  static isLanguageSupported(lang) {
    return ConfigService.SUPPORTED_LANGUAGES.includes(lang);
  }

  /**
   * Validate if a bump level is supported
   * @param {string} bumpLevel - Bump level
   * @returns {boolean} True if supported
   */
  static isBumpLevelSupported(bumpLevel) {
    return ConfigService.SUPPORTED_BUMP_LEVELS.includes(bumpLevel);
  }

  /**
   * Get default package file for a language
   * @param {string} lang - Language identifier
   * @returns {string} Default package file name
   */
  static getDefaultPackageFile(lang) {
    return ConfigService.DEFAULT_PACKAGE_FILES[lang];
  }

  /**
   * Get file patterns for language detection
   * @param {string} lang - Language identifier
   * @returns {string[]} Array of file patterns
   */
  static getLanguageFilePatterns(lang) {
    return ConfigService.LANGUAGE_FILE_PATTERNS[lang] || [];
  }

  /**
   * Get test bump levels for a language/file combination
   * @param {string} lang - Language identifier
   * @param {string} fileName - Optional file name for Python disambiguation
   * @returns {string[]} Array of bump levels to test
   */
  static getTestBumps(lang, fileName = '') {
    const testBumps = ConfigService.LANGUAGE_TEST_BUMPS[lang];
    
    if (lang === 'python' && typeof testBumps === 'object') {
      // Handle Python's multiple format support
      for (const [pattern, bumps] of Object.entries(testBumps)) {
        if (fileName.includes(pattern)) {
          return bumps;
        }
      }
      return testBumps['pyproject.toml']; // Default
    }
    
    return testBumps || [];
  }

  /**
   * Check if a file path matches a language pattern
   * @param {string} filePath - File path to check
   * @param {string} lang - Language to check against
   * @returns {boolean} True if file matches language
   */
  static isFileForLanguage(filePath, lang) {
    const patterns = ConfigService.getLanguageFilePatterns(lang);
    return patterns.some(pattern => filePath.includes(pattern));
  }
}

module.exports = ConfigService;