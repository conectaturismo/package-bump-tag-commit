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
      case 'update-major':
        console.log(`🔄 Updating v1 tag to point to ${version}...`);
        exec('git tag -f v1');
        exec('git push -f origin v1');
        break;
      case 'full':
        console.log('🚀 Starting full release process...');
        exec('node scripts/release-helper.js release prepare');
        exec('node scripts/release-helper.js release tag');
        exec('node scripts/release-helper.js release update-major');
        console.log('✅ Release completed!');
        break;
      default:
        console.log('Usage: node scripts/release-helper.js release [prepare|tag|update-major|full]');
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
  release update-major     Update v1 tag
  release full             Complete release process
  
  bump patch|minor|major   Version bump + full release

Examples:
  node scripts/release-helper.js version current
  node scripts/release-helper.js bump minor
  node scripts/release-helper.js release full
    `);
}