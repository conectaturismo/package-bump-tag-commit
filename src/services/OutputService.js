const core = require('@actions/core');

/**
 * Service for handling GitHub Actions outputs and logging
 */
class OutputService {
  /**
   * Set the version output for GitHub Actions
   * @param {string} version - Version to output
   */
  static setVersionOutput(version) {
    core.setOutput('version', version);
  }

  /**
   * Log success message with version
   * @param {string} version - Version that was set
   * @param {string} filePath - Path to the file that was updated
   */
  static logSuccess(version, filePath) {
    core.info(`✅ Version updated successfully!`);
    core.info(`📦 New version: ${version}`);
    core.info(`📄 File: ${filePath}`);
  }

  /**
   * Log version bump information
   * @param {string} oldVersion - Previous version
   * @param {string} newVersion - New version
   * @param {string} bumpLevel - Bump level used
   */
  static logVersionBump(oldVersion, newVersion, bumpLevel) {
    core.info(`🔄 Version bump: ${oldVersion} → ${newVersion} (${bumpLevel})`);
  }

  /**
   * Log file operation information
   * @param {string} filePath - Path to the file
   * @param {string} operation - Operation performed (read/write)
   */
  static logFileOperation(filePath, operation) {
    core.info(`📁 ${operation}: ${filePath}`);
  }

  /**
   * Log Git operations
   * @param {string} version - Version for Git operations
   * @param {boolean} tagged - Whether tag was created
   * @param {boolean} committed - Whether commit was made
   */
  static logGitOperations(version, tagged, committed) {
    if (tagged) {
      core.info(`🏷️  Tag created: v${version}`);
    }
    if (committed) {
      core.info(`📝 Changes committed`);
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   */
  static logWarning(message) {
    core.warning(`⚠️  ${message}`);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   */
  static logInfo(message) {
    core.info(`ℹ️  ${message}`);
  }

  /**
   * Log debug message (only in debug mode)
   * @param {string} message - Debug message
   */
  static logDebug(message) {
    core.debug(`🔍 ${message}`);
  }

  /**
   * Set failed status and error message
   * @param {string|Error} error - Error message or Error object
   */
  static setFailed(error) {
    const message = error instanceof Error ? error.message : error;
    core.setFailed(`❌ ${message}`);
  }

  /**
   * Log dry run information
   * @param {string} currentVersion - Current version
   * @param {string} nextVersion - What the next version would be
   * @param {string} bumpLevel - Bump level
   */
  static logDryRun(currentVersion, nextVersion, bumpLevel) {
    core.info(`🔮 Dry run mode - no changes will be saved`);
    core.info(`📊 Current version: ${currentVersion}`);
    core.info(`📈 Next version would be: ${nextVersion} (${bumpLevel})`);
  }
}

module.exports = OutputService;