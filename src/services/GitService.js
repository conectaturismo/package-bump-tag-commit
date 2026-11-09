const github = require('@actions/github');
const { exec } = require('@actions/exec');

/**
 * Service for handling Git operations (tagging and committing)
 */
class GitService {
  constructor(githubToken, tagPrefix = '') {
    this.octokit = github.getOctokit(githubToken);
    this.githubToken = githubToken;
    this.tagPrefix = tagPrefix;
  }

  /**
   * Create Git service instance from GitHub token
   * @param {string} githubToken - GitHub token for authentication
   * @param {string} tagPrefix - Prefix to add to tags
   * @returns {GitService} New GitService instance
   * @throws {Error} If token is missing
   */
  static fromToken(githubToken, tagPrefix = '') {
    if (!githubToken) {
      throw new Error('GitHub token is required for Git operations');
    }
    return new GitService(githubToken, tagPrefix);
  }

  /**
   * Create tag and commit for the new version
   *
   * El commit va PRIMERO y la etiqueta despues, apuntando al commit recien
   * subido. Al reves —como estaba hasta la 2.1.1— la etiqueta y su release se
   * creaban sobre la cabeza de la rama, o sea sobre el commit ANTERIOR al de la
   * version: `v0.0.98` llevaba dentro un `package.json` que decia `0.0.97`.
   * Medido en ct-twf-library, pasaba en las cinco ultimas versiones, tanto en
   * las publicaciones buenas como en las que fallaban.
   *
   * Y si el push fallaba (pasó el 2026-11-04, con GitHub devolviendo 500 en los
   * pushes), la etiqueta y la release ya existian sin paquete detras, asi que el
   * siguiente intento chocaba con ellas y habia que borrarlas a mano.
   *
   * @param {string} version - Version to tag
   * @param {string} filePath - Fichero de version: es lo UNICO que entra en el commit
   * @returns {Promise<void>}
   * @throws {Error} If Git operations fail
   */
  async createTagAndCommit(version, filePath) {
    try {
      const sha = await this._commit(filePath);
      await this._createTag(version, sha);
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
      // Sin commit no hay sha nuevo, asi que se etiqueta el commit sobre el que
      // corre el workflow. Omitir el destino lo dejaba en manos de GitHub, que
      // etiqueta la rama POR DEFECTO del repositorio: publicando desde `develop`
      // en un repo cuya rama por defecto es `main`, la etiqueta se iba a main.
      await this._createTag(version, github.context.sha);
    } catch (error) {
      throw new Error(`Tag creation failed: ${error.message}`);
    }
  }

  /**
   * Internal method to create a Git tag via GitHub API
   * @private
   * @param {string} version - Version to tag
   * @param {string} [targetCommitish] - Commit al que apunta la etiqueta. Sin
   *   el, GitHub la cuelga de la rama por defecto del repositorio, que no tiene
   *   por que ser la que publica.
   * @returns {Promise<void>}
   * @throws {Error} If tag creation fails
   */
  async _createTag(version, targetCommitish) {
    const tagRsp = await this.octokit.rest.repos.createRelease({
      ...github.context.repo,
      tag_name: `${this.tagPrefix}v${version}`,
      ...(targetCommitish ? { target_commitish: targetCommitish } : {}),
    });

    if (tagRsp.status !== 201) {
      throw new Error(`Failed to create tag: ${JSON.stringify(tagRsp)}`);
    }
  }

  /**
   * Internal method to commit changes
   *
   * Solo entra en el commit el fichero de version. Antes se hacia `git add -A`
   * y el commit se llevaba todo lo que hubiera en el workspace: ficheros de
   * credenciales como el `gha-creds-*.json` que deja
   * google-github-actions/auth, `.env` generados en el build o cambios de
   * pasos anteriores. `commit -- <fichero>` ademas deja fuera lo que otro paso
   * hubiera preparado ya en el indice.
   *
   * @private
   * @param {string} filePath - Fichero de version
   * @returns {Promise<string>} SHA del commit recien subido, para etiquetarlo
   * @throws {Error} If commit fails
   */
  async _commit(filePath) {
    if (!filePath) {
      // Sin fichero no se hace commit: nunca volver a un `git add` de todo.
      throw new Error('Version file path is required to commit');
    }
    const branch = github.context.ref.split('/').slice(2).join('/');

    await exec('git', ['add', '--', filePath]);
    await exec('git', ['config', '--local', 'user.name', 'Conecta Turismo CI']);
    await exec('git', ['config', '--local', 'user.email', 'sergio.garcia.seo@gmail.com']);
    await exec('git', ['commit', '--no-verify', '-m', 'CI: Publish new version', '--', filePath]);
    await exec('git', ['push', 'origin', branch]);

    // Se lee DESPUES del push: si el push falla no se llega aqui y no se crea
    // ninguna etiqueta, que es justo lo que se busca.
    let sha = '';
    await exec('git', ['rev-parse', 'HEAD'], {
      listeners: { stdout: data => { sha += data.toString(); } },
    });
    return sha.trim();
  }

  /**
   * Commit changes only (without tagging)
   * @param {string} filePath - Fichero de version
   * @returns {Promise<void>}
   * @throws {Error} If commit fails
   */
  async commit(filePath) {
    try {
      await this._commit(filePath);
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