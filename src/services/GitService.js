const github = require('@actions/github');
const { exec } = require('@actions/exec');

/**
 * Service for handling Git operations (tagging and committing)
 */
class GitService {
  constructor(githubToken) {
    this.octokit = github.getOctokit(githubToken);
    this.githubToken = githubToken;
  }

  /**
   * Create Git service instance from GitHub token
   * @param {string} githubToken - GitHub token for authentication
   * @returns {GitService} New GitService instance
   * @throws {Error} If token is missing
   */
  static fromToken(githubToken) {
    if (!githubToken) {
      throw new Error('GitHub token is required for Git operations');
    }
    return new GitService(githubToken);
  }

  /**
   * Create tag and commit for the new version
   * @param {string} version - Version to tag
   * @returns {Promise<void>}
   * @throws {Error} If Git operations fail
   */
  async createTagAndCommit(version) {
    try {
      await this._createTag(version);
      await this._commit();
    } catch (error) {
      throw new Error(`Git operations failed: ${error.message}`);
    }
  }

  /**
   * Create tag only (without commit)
   * @param {string} version - Version to tag
   * @returns {Promise<void>}
   * @throws {Error} If tag creation fails
   */
  async createTag(version) {
    try {
      await this._createTag(version);
    } catch (error) {
      throw new Error(`Tag creation failed: ${error.message}`);
    }
  }

  /**
   * Internal method to create a Git tag via GitHub API
   * @private
   * @param {string} version - Version to tag
   * @returns {Promise<void>}
   * @throws {Error} If tag creation fails
   */
  async _createTag(version) {
    const tagRsp = await this.octokit.rest.repos.createRelease({
      ...github.context.repo,
      tag_name: `v${version}`,
    });

    if (tagRsp.status !== 201) {
      throw new Error(`Failed to create tag: ${JSON.stringify(tagRsp)}`);
    }
  }

  /**
   * Internal method to commit changes
   * @private
   * @returns {Promise<void>}
   * @throws {Error} If commit fails
   */
  async _commit() {
    const branch = github.context.ref.split('/').slice(2).join('/');
    
    await exec('git', ['add', '-A']);
    await exec('git', ['config', '--local', 'user.name', 'Conecta Turismo CI']);
    await exec('git', ['config', '--local', 'user.email', 'sergio.garcia.seo@gmail.com']);
    await exec('git', ['commit', '--no-verify', '-m', 'CI: Publish new version']);
    await exec('git', ['push', 'origin', branch]);
  }

  /**
   * Commit changes only (without tagging)
   * @returns {Promise<void>}
   * @throws {Error} If commit fails
   */
  async commit() {
    try {
      await this._commit();
    } catch (error) {
      throw new Error(`Commit failed: ${error.message}`);
    }
  }

  /**
   * Check if GitHub token is valid
   * @returns {boolean} True if token exists
   */
  hasValidToken() {
    return !!this.githubToken;
  }
}

module.exports = GitService;