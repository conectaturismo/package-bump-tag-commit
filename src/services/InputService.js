const core = require('@actions/core');
const ConfigService = require('../config/ConfigService');

/**
 * Service for handling GitHub Actions inputs and validation
 */
class InputService {
  constructor() {
    this.inputs = null;
  }

  /**
   * Parse and validate all GitHub Actions inputs
   * @returns {object} Validated inputs object
   * @throws {Error} If any input is invalid
   */
  parseInputs() {
    if (this.inputs) {
      return this.inputs; // Cache parsed inputs
    }

    const lang = core.getInput('lang') || 'js';
    const bumpLvl = core.getInput('bumpLvl') || 'patch';
    const path = core.getInput('path');
    const save = core.getBooleanInput('save') || false;
    const githubToken = core.getInput('githubToken');
    const workspacePath = process.env.GITHUB_WORKSPACE || './';

    // Validate inputs
    this._validateLanguage(lang);
    this._validateBumpLevel(bumpLvl);
    this._validateWorkspacePath(workspacePath);
    this._validateSaveOperation(save, githubToken);

    this.inputs = {
      lang,
      bumpLvl,
      path,
      save,
      githubToken,
      workspacePath
    };

    return this.inputs;
  }

  /**
   * Get workspace path
   * @returns {string} Workspace path
   */
  getWorkspacePath() {
    return process.env.GITHUB_WORKSPACE || './';
  }

  /**
   * Get language with fallback to default
   * @returns {string} Language identifier
   */
  getLanguage() {
    return core.getInput('lang') || 'js';
  }

  /**
   * Get bump level with fallback to default
   * @returns {string} Bump level
   */
  getBumpLevel() {
    return core.getInput('bumpLvl') || 'patch';
  }

  /**
   * Get custom path if specified
   * @returns {string|null} Custom path or null
   */
  getCustomPath() {
    const path = core.getInput('path');
    return path || null;
  }

  /**
   * Check if save operation is requested
   * @returns {boolean} True if save is requested
   */
  shouldSave() {
    return core.getBooleanInput('save') || false;
  }

  /**
   * Get GitHub token
   * @returns {string|null} GitHub token or null
   */
  getGitHubToken() {
    return core.getInput('githubToken') || null;
  }

  /**
   * Validate language input
   * @private
   * @param {string} lang - Language to validate
   * @throws {Error} If language is not supported
   */
  _validateLanguage(lang) {
    if (!ConfigService.isLanguageSupported(lang)) {
      const supported = ConfigService.SUPPORTED_LANGUAGES.join(', ');
      throw new Error(`Language '${lang}' is not supported. Supported languages: ${supported}`);
    }
  }

  /**
   * Validate bump level input
   * @private
   * @param {string} bumpLvl - Bump level to validate
   * @throws {Error} If bump level is not supported
   */
  _validateBumpLevel(bumpLvl) {
    if (!ConfigService.isBumpLevelSupported(bumpLvl)) {
      const supported = ConfigService.SUPPORTED_BUMP_LEVELS.join(', ');
      throw new Error(`Bump level '${bumpLvl}' is not supported. Supported levels: ${supported}`);
    }
  }

  /**
   * Validate workspace path
   * @private
   * @param {string} workspacePath - Workspace path to validate
   * @throws {Error} If workspace path is not set
   */
  _validateWorkspacePath(workspacePath) {
    if (!workspacePath || workspacePath === './') {
      // Only warn for local development, don't throw error
      core.warning('GITHUB_WORKSPACE environment variable is not set. Using current directory.');
    }
  }

  /**
   * Validate save operation requirements
   * @private
   * @param {boolean} save - Whether save is requested
   * @param {string} githubToken - GitHub token
   * @throws {Error} If save is requested but token is missing
   */
  _validateSaveOperation(save, githubToken) {
    if (save && !githubToken) {
      throw new Error('githubToken is required when save=true');
    }
  }
}

module.exports = InputService;