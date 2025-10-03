const PackageVersion = require('./PackageVersion');
const InputService = require('./services/InputService');
const PathResolverService = require('./services/PathResolverService');
const GitService = require('./services/GitService');
const OutputService = require('./services/OutputService');

/**
 * Main action orchestrator class
 * Coordinates all services to perform version bumping operations
 */
class ActionOrchestrator {
  constructor() {
    this.inputService = new InputService();
  }

  /**
   * Execute the main action workflow
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      // Parse and validate inputs
      const inputs = this.inputService.parseInputs();
      
      OutputService.logDebug(`Inputs parsed: ${JSON.stringify(inputs, null, 2)}`);

      // Resolve target file path
      const filePath = PathResolverService.resolveFilePath(
        inputs.lang, 
        inputs.workspacePath, 
        inputs.path
      );

      OutputService.logFileOperation(filePath, 'Reading');

      // Load and bump version
      const packageVersion = PackageVersion.fromFile(filePath, inputs.lang);
      const oldVersion = packageVersion.getCurrentVersion();
      
      packageVersion.bump(inputs.bumpLvl);
      const newVersion = packageVersion.getCurrentVersion();

      OutputService.logVersionBump(oldVersion, newVersion, inputs.bumpLvl);

      // Handle save operations
      if (inputs.save) {
        await this._handleSaveOperations(packageVersion, inputs, filePath);
      } else {
        OutputService.logDryRun(oldVersion, newVersion, inputs.bumpLvl);
      }

      // Set outputs
      OutputService.setVersionOutput(newVersion);
      OutputService.logSuccess(newVersion, filePath);

    } catch (error) {
      OutputService.setFailed(error);
      throw error; // Re-throw for testing purposes
    }
  }

  /**
   * Handle save operations (file save + git operations)
   * @private
   * @param {PackageVersion} packageVersion - Package version instance
   * @param {object} inputs - Validated inputs
   * @param {string} filePath - Absolute file path
   * @returns {Promise<void>}
   */
  async _handleSaveOperations(packageVersion, inputs, filePath) {
    try {
      // Save file changes
      packageVersion.save();
      OutputService.logFileOperation(filePath, 'Saved');

      // Handle Git operations if token provided
      if (inputs.githubToken) {
        const gitService = GitService.fromToken(inputs.githubToken);
        await gitService.createTagAndCommit(packageVersion.getCurrentVersion());
        OutputService.logGitOperations(
          packageVersion.getCurrentVersion(), 
          true, // tagged
          true  // committed
        );
      } else {
        OutputService.logWarning('No GitHub token provided - skipping Git operations');
      }

    } catch (error) {
      throw new Error(`Save operations failed: ${error.message}`);
    }
  }

  /**
   * Execute with custom inputs (for testing)
   * @param {object} customInputs - Custom input values
   * @returns {Promise<void>}
   */
  async executeWithInputs(customInputs) {
    // Override environment variables for testing
    const originalEnv = { ...process.env };
    
    try {
      if (customInputs.workspacePath) {
        process.env.GITHUB_WORKSPACE = customInputs.workspacePath;
      }

      // Mock core inputs
      const originalGetInput = require('@actions/core').getInput;
      const originalGetBooleanInput = require('@actions/core').getBooleanInput;
      
      require('@actions/core').getInput = (name) => customInputs[name] || '';
      require('@actions/core').getBooleanInput = (name) => customInputs[name] || false;

      await this.execute();

      // Restore original functions
      require('@actions/core').getInput = originalGetInput;
      require('@actions/core').getBooleanInput = originalGetBooleanInput;

    } finally {
      // Restore environment
      process.env = originalEnv;
    }
  }

  /**
   * Get dry run results without executing save operations
   * @param {object} customInputs - Custom input values
   * @returns {Promise<object>} Dry run results
   */
  async getDryRunResults(customInputs = {}) {
    const inputs = customInputs.workspacePath ? 
      customInputs : 
      this.inputService.parseInputs();

    const filePath = PathResolverService.resolveFilePath(
      inputs.lang || 'js', 
      inputs.workspacePath || './', 
      inputs.path
    );

    const packageVersion = PackageVersion.fromFile(filePath, inputs.lang || 'js');
    const oldVersion = packageVersion.getCurrentVersion();
    const nextVersion = packageVersion.getNextVersion(inputs.bumpLvl || 'patch');

    return {
      filePath,
      currentVersion: oldVersion,
      nextVersion,
      bumpLevel: inputs.bumpLvl || 'patch',
      language: inputs.lang || 'js'
    };
  }
}

module.exports = ActionOrchestrator;