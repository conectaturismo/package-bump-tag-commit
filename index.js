const core = require('@actions/core');
const semver = require('semver');
const github = require('@actions/github');
const { join } = require('path');
const { existsSync } = require('fs');

const PackageVersion = require('./package-version');
const GitCmd = require('./git-cmd');

const enabledLangs = ['rust', 'js', 'php', 'python'];
const defaultPAckages = { 
  js: 'package.json', 
  rust: 'Cargo.toml', 
  php: 'composer.json', 
  python: 'pyproject.toml' 
};
const enabledbumpLvls = ['major', 'minor', 'patch', 'hotfix', 'none'];

const run = async () => {
  try {
    const lang = core.getInput('lang') || 'js';
    const workspacePath = process.env.GITHUB_WORKSPACE || './';
    const bumpLvl = core.getInput('bumpLvl') || 'patch';

    let inputPath = core.getInput('path') || defaultPAckages[lang];
    
    // For Python, if no path is specified, try to find the most appropriate file
    if (lang === 'python' && !core.getInput('path')) {
      const candidatePaths = ['pyproject.toml', 'setup.py', 'src/__init__.py', '__init__.py'];
      for (const candidate of candidatePaths) {
        const fullPath = join(workspacePath, candidate);
        if (existsSync(fullPath)) {
          inputPath = candidate;
          break;
        }
      }
    }
    const saveOper = core.getBooleanInput('save') || false;
    const ghToken = core.getInput('githubToken');

    if (!enabledLangs.includes(lang)) throw new Error(`Language ${lang} is not supported`);
    if (!workspacePath) throw new Error('GITHUB_WORKSPACE env variable is not set.');
    if (!enabledbumpLvls.includes(bumpLvl))
      throw new Error(`Bump level ${bumpLvl} is not supported`);

    const path = join(workspacePath, inputPath);
    const packageFile = PackageVersion.fromFile(path, lang).bump(bumpLvl);

    if (saveOper) {
      if (!ghToken) throw new Error('githubToken is required for save operation');
      const gitCmd = GitCmd.fromGhToken(ghToken);
      packageFile.save();
      await gitCmd.createTag(packageFile.version);
      await gitCmd.commit();
    }

    core.info(`New version: ${packageFile.version}`);
    core.setOutput('version', packageFile.version);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
module.exports = run;
