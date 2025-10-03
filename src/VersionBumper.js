const semver = require('semver');
const ConfigService = require('./config/ConfigService');

/**
 * Service for handling semantic version bumping operations
 */
class VersionBumper {
  /**
   * Supported bump levels (delegated to ConfigService)
   */
  static get BUMP_LEVELS() {
    return ConfigService.SUPPORTED_BUMP_LEVELS;
  }

  /**
   * Bump version according to semantic versioning
   * @param {string} currentVersion - Current version string
   * @param {string} bumpLevel - Bump level (major, minor, patch, hotfix, none)
   * @returns {string} New version string
   * @throws {Error} If version or bump level is invalid
   */
  static bump(currentVersion, bumpLevel) {
    if (!VersionBumper.BUMP_LEVELS.includes(bumpLevel)) {
      throw new Error(`Invalid bump level: ${bumpLevel}. Supported levels: ${VersionBumper.BUMP_LEVELS.join(', ')}`);
    }

    const version = semver.valid(currentVersion);
    if (!version) {
      throw new Error(`Invalid version: ${currentVersion}. Must be a valid semantic version.`);
    }

    if (bumpLevel === 'none') {
      return currentVersion;
    }

    const level = bumpLevel === 'hotfix' ? 'prerelease' : bumpLevel;
    const identifier = bumpLevel === 'hotfix' ? 'hotfix' : undefined;
    
    return semver.inc(currentVersion, level, identifier);
  }

  /**
   * Validate if a version string is valid semver
   * @param {string} version - Version string to validate
   * @returns {boolean} True if valid
   */
  static isValidVersion(version) {
    return semver.valid(version) !== null;
  }

  /**
   * Get the next version without applying it
   * @param {string} currentVersion - Current version string
   * @param {string} bumpLevel - Bump level
   * @returns {string} What the new version would be
   */
  static getNextVersion(currentVersion, bumpLevel) {
    return VersionBumper.bump(currentVersion, bumpLevel);
  }
}

module.exports = VersionBumper;