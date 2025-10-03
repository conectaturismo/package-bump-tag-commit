const { join } = require('path');
const { existsSync } = require('fs');
const ConfigService = require('../config/ConfigService');

/**
 * Service for resolving file paths based on language and user input
 */
class PathResolverService {
  /**
   * Resolve the target file path
   * @param {string} lang - Programming language
   * @param {string} workspacePath - Workspace root path
   * @param {string|null} customPath - User-provided custom path
   * @returns {string} Resolved absolute file path
   * @throws {Error} If file cannot be resolved or doesn't exist
   */
  static resolveFilePath(lang, workspacePath, customPath = null) {
    let relativePath;

    if (customPath) {
      // User provided explicit path
      relativePath = customPath;
    } else if (lang === 'python') {
      // Python requires special auto-detection
      relativePath = PathResolverService._resolvePythonFile(workspacePath);
    } else {
      // Use default file for other languages
      relativePath = ConfigService.getDefaultPackageFile(lang);
    }

    const absolutePath = join(workspacePath, relativePath);

    // Validate file exists
    if (!existsSync(absolutePath)) {
      throw new Error(`Package file not found: ${absolutePath}`);
    }

    return absolutePath;
  }

  /**
   * Auto-detect Python project file
   * @private
   * @param {string} workspacePath - Workspace root path
   * @returns {string} Relative path to Python file
   * @throws {Error} If no Python file is found
   */
  static _resolvePythonFile(workspacePath) {
    const candidates = ConfigService.PYTHON_FILE_CANDIDATES;
    
    for (const candidate of candidates) {
      const fullPath = join(workspacePath, candidate);
      if (existsSync(fullPath)) {
        return candidate;
      }
    }

    // If no files found, return default and let the error handling deal with it
    return ConfigService.getDefaultPackageFile('python');
  }

  /**
   * Get relative path from absolute path
   * @param {string} absolutePath - Absolute file path
   * @param {string} workspacePath - Workspace root path
   * @returns {string} Relative path from workspace
   */
  static getRelativePath(absolutePath, workspacePath) {
    return absolutePath.replace(workspacePath, '').replace(/^[\/\\]/, '');
  }

  /**
   * Check if a file exists
   * @param {string} filePath - Path to check
   * @returns {boolean} True if file exists
   */
  static fileExists(filePath) {
    return existsSync(filePath);
  }

  /**
   * Get available Python files in workspace
   * @param {string} workspacePath - Workspace root path
   * @returns {string[]} Array of found Python files
   */
  static getAvailablePythonFiles(workspacePath) {
    const candidates = ConfigService.PYTHON_FILE_CANDIDATES;
    const found = [];
    
    for (const candidate of candidates) {
      const fullPath = join(workspacePath, candidate);
      if (existsSync(fullPath)) {
        found.push(candidate);
      }
    }
    
    return found;
  }
}

module.exports = PathResolverService;