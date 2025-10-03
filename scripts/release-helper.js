#!/usr/bin/env node

/**
 * Cross-platform release and tag management script
 * Works on Windows, macOS, and Linux
 * 
 * Usage: node scripts/release-helper.js <command> [options]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = `v${packageJson.version}`;

// Utility functions
function exec(command, options = {}) {
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

function execQuiet(command) {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    return null;
  }
}

function generateReleaseNotes(version) {
  // Get the latest tag before current version
  const previousTag = execQuiet('git describe --tags --abbrev=0 HEAD~1') || 'HEAD~10';
  
  // Get commit messages since last tag
  const commits = execQuiet(`git log ${previousTag}..HEAD --pretty=format:"%s" --no-merges`);
  
  let releaseNotes = `## What's Changed in v${version}\n\n`;
  
  if (commits) {
    const commitLines = commits.split('\n').filter(line => line.trim());
    
    const features = commitLines.filter(commit => 
      commit.includes('feat:') || commit.includes('add:') || commit.includes('new:')
    );
    const fixes = commitLines.filter(commit => 
      commit.includes('fix:') || commit.includes('bug:') || commit.includes('patch:')
    );
    const improvements = commitLines.filter(commit => 
      commit.includes('refactor:') || commit.includes('improve:') || commit.includes('perf:')
    );
    const docs = commitLines.filter(commit => 
      commit.includes('docs:') || commit.includes('doc:')
    );
    
    if (features.length > 0) {
      releaseNotes += `### ✨ New Features\n`;
      features.forEach(commit => releaseNotes += `- ${commit}\n`);
      releaseNotes += '\n';
    }
    
    if (fixes.length > 0) {
      releaseNotes += `### 🐛 Bug Fixes\n`;
      fixes.forEach(commit => releaseNotes += `- ${commit}\n`);
      releaseNotes += '\n';
    }
    
    if (improvements.length > 0) {
      releaseNotes += `### 🔧 Improvements\n`;
      improvements.forEach(commit => releaseNotes += `- ${commit}\n`);
      releaseNotes += '\n';
    }
    
    if (docs.length > 0) {
      releaseNotes += `### 📚 Documentation\n`;
      docs.forEach(commit => releaseNotes += `- ${commit}\n`);
      releaseNotes += '\n';
    }
    
    // Other commits
    const otherCommits = commitLines.filter(commit => 
      !features.includes(commit) && 
      !fixes.includes(commit) && 
      !improvements.includes(commit) && 
      !docs.includes(commit)
    );
    
    if (otherCommits.length > 0) {
      releaseNotes += `### 🔄 Other Changes\n`;
      otherCommits.forEach(commit => releaseNotes += `- ${commit}\n`);
      releaseNotes += '\n';
    }
  }
  
  releaseNotes += `## 🚀 Usage\n\n`;
  releaseNotes += `\`\`\`yaml\n`;
  releaseNotes += `- name: Package version bump\n`;
  releaseNotes += `  uses: conectaturismo/package-bump-tag-commit@v${version}\n`;
  releaseNotes += `  with:\n`;
  releaseNotes += `    lang: js  # js, rust, php, python, go\n`;
  releaseNotes += `    bumpLvl: patch\n`;
  releaseNotes += `    save: true\n`;
  releaseNotes += `    githubToken: \${{ secrets.GITHUB_TOKEN }}\n`;
  releaseNotes += `\`\`\`\n\n`;
  releaseNotes += `**Full Changelog**: https://github.com/conectaturismo/package-bump-tag-commit/compare/${previousTag}...v${version}`;
  
  return releaseNotes;
}

// Get command from arguments
const command = process.argv[2];
const subCommand = process.argv[3];

switch (command) {
  case 'version':
    switch (subCommand) {
      case 'current':
        console.log(`Current version: ${packageJson.version}`);
        break;
      case 'patch':
        exec('npm version patch');
        break;
      case 'minor':
        exec('npm version minor');
        break;
      case 'major':
        exec('npm version major');
        break;
      default:
        console.log('Usage: node scripts/release-helper.js version [current|patch|minor|major]');
    }
    break;

  case 'tag':
    switch (subCommand) {
      case 'list':
        exec('git tag -l -n1');
        break;
      case 'push':
        console.log(`📤 Pushing tag ${version}...`);
        exec(`git push origin ${version}`);
        break;
      case 'delete':
        console.log(`🗑️ Deleting tag ${version}...`);
        try {
          exec(`git tag -d ${version}`);
          exec(`git push --delete origin ${version}`);
        } catch (error) {
          console.log('❌ Tag deletion failed (may not exist)');
        }
        break;
      case 'update-major':
        console.log(`🔄 Updating v1 tag to point to ${version}...`);
        exec('git tag -f v1');
        exec('git push -f origin v1');
        break;
      default:
        console.log('Usage: node scripts/release-helper.js tag [list|push|delete|update-major]');
    }
    break;

  case 'release':
    switch (subCommand) {
      case 'prepare':
        console.log('🏗️ Preparing release...');
        exec('npm run build');
        exec('git add dist/');
        
        // Check if there are staged changes
        const staged = execQuiet('git diff --staged --name-only');
        if (staged) {
          console.log('📦 Committing dist/ changes...');
          exec('git commit -m "build: update dist for release"');
        } else {
          console.log('✅ No dist/ changes to commit');
        }
        break;
      case 'tag':
        console.log(`📤 Pushing tag ${version}...`);
        exec(`git push origin ${version}`);
        break;
      case 'github':
        console.log(`🚀 Creating GitHub release ${version}...`);
        // Generate release notes
        const releaseNotes = generateReleaseNotes(packageJson.version);
        
        // Create temporary file for release notes
        fs.writeFileSync('temp-release-notes.md', releaseNotes);
        
        try {
          // Use GitHub CLI to create release
          exec(`gh release create ${version} --title "Release ${version}" --notes-file temp-release-notes.md --latest`);
          console.log('✅ GitHub release created successfully!');
        } catch (error) {
          console.log('❌ Failed to create GitHub release. Make sure you are authenticated with GitHub CLI.');
          console.log('� Run: gh auth login');
        } finally {
          // Clean up temp file
          if (fs.existsSync('temp-release-notes.md')) {
            fs.unlinkSync('temp-release-notes.md');
          }
        }
        break;
      case 'open':
        console.log('🌐 Opening GitHub repository in browser...');
        try {
          exec('gh repo view --web');
          console.log('✅ GitHub repository opened in browser!');
        } catch (error) {
          console.log('❌ Failed to open repository. Make sure you are authenticated with GitHub CLI.');
          console.log('💡 Run: gh auth login');
          console.log('🔗 Or visit manually: https://github.com/conectaturismo/package-bump-tag-commit');
        }
        break;
      case 'update-major':
        // Extract major version from current version (e.g., "v2.0.1" -> "2")
        const versionWithoutV = version.startsWith('v') ? version.slice(1) : version;
        const majorVersion = versionWithoutV.split('.')[0];
        const majorTag = `v${majorVersion}`;
        
        console.log(`🔄 Updating ${majorTag} tag to point to ${version}...`);
        exec(`git tag -f ${majorTag}`);
        exec(`git push -f origin ${majorTag}`);
        break;
      case 'full':
        console.log('🚀 Starting full release process...');
        exec('node scripts/release-helper.js release prepare');
        exec('node scripts/release-helper.js release tag');
        exec('node scripts/release-helper.js release github');
        exec('node scripts/release-helper.js release update-major');
        console.log('✅ Release completed!');
        break;
      default:
        console.log('Usage: node scripts/release-helper.js release [prepare|tag|github|open|update-major|full]');
    }
    break;

  case 'bump':
    switch (subCommand) {
      case 'patch':
      case 'minor':
      case 'major':
        console.log(`🔼 Bumping ${subCommand} version and releasing...`);
        exec(`node scripts/release-helper.js version ${subCommand}`);
        exec('git push origin master');
        exec('node scripts/release-helper.js release full');
        console.log(`✅ ${subCommand.toUpperCase()} bump and release completed!`);
        break;
      default:
        console.log('Usage: node scripts/release-helper.js bump [patch|minor|major]');
    }
    break;

  default:
    console.log(`
🚀 Release Helper - Cross-platform release and tag management

Usage: node scripts/release-helper.js <command> [subcommand]

Commands:
  version current           Show current version
  version patch|minor|major Bump version
  
  tag list                  List all tags
  tag push                  Push current version tag
  tag delete               Delete current version tag
  tag update-major         Update v1 to point to current version
  
  release prepare          Build and commit dist/
  release tag              Push current version tag
  release github           Create GitHub release (needs GITHUB_TOKEN)
  release open             Open GitHub release page in browser
  release update-major     Update v1 tag
  release full             Complete release process
  
  bump patch|minor|major   Version bump + full release

Examples:
  node scripts/release-helper.js version current
  node scripts/release-helper.js bump minor
  node scripts/release-helper.js release full
    `);
}