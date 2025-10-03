#!/usr/bin/env node

/**
 * Integration Test Suite for Package Bump Tag Commit Action
 * 
 * This test suite validates the complete functionality of the action
 * for all supported languages: JavaScript, Rust, PHP, and Python.
 * 
 * Usage:
 *   node test-integration.js
 *   node test-integration.js --lang=php
 *   node test-integration.js --verbose
 * 
 * When adding new language support:
 * 1. Add the new language to SUPPORTED_LANGUAGES
 * 2. Create example files in examples/ directory
 * 3. Add test cases to TEST_CASES array
 * 4. Run this test to validate the implementation
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
// Using new modular API instead of legacy wrapper
const { PackageVersion, config: { ConfigService } } = require('./src');

// Configuration from ConfigService (single source of truth)
const SUPPORTED_LANGUAGES = ConfigService.SUPPORTED_LANGUAGES;
const BUMP_LEVELS = ConfigService.SUPPORTED_BUMP_LEVELS;

// Test cases configuration
// Generate test cases from ConfigService configuration
const TEST_CASES = [];

// Generate test cases dynamically from ConfigService
SUPPORTED_LANGUAGES.forEach(lang => {
  const patterns = ConfigService.getLanguageFilePatterns(lang);
  
  patterns.forEach(pattern => {
    const fileName = `examples/${ConfigService.getDefaultPackageFile(lang)}`;
    const testBumps = ConfigService.getTestBumps(lang, pattern);
    
    // Handle multiple Python file formats
    if (lang === 'python' && patterns.length > 1) {
      const specificFile = pattern === 'pyproject.toml' ? 'examples/pyproject.toml' :
                          pattern === 'setup.py' ? 'examples/setup.py' :
                          pattern === '__init__.py' ? 'examples/__init__.py' : fileName;
      
      TEST_CASES.push({
        name: `Python (${pattern})`,
        lang: lang,
        file: specificFile,
        expectedVersion: '1.0.0',
        testBumps: ConfigService.getTestBumps(lang, pattern)
      });
    } else if (lang !== 'python') {
      // For non-Python languages, create one test case
      TEST_CASES.push({
        name: `${lang.charAt(0).toUpperCase() + lang.slice(1)} (${ConfigService.getDefaultPackageFile(lang)})`,
        lang: lang,
        file: fileName,
        expectedVersion: '1.0.0',
        testBumps: testBumps
      });
    }
  });
});

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  lang: args.find(arg => arg.startsWith('--lang='))?.split('=')[1],
  help: args.includes('--help') || args.includes('-h')
};

class IntegrationTester {
  constructor(options = {}) {
    this.options = options;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString().substring(11, 19);
    const prefix = {
      info: '📝',
      success: '✅',
      error: '❌', 
      warn: '⚠️',
      debug: '🔍'
    }[level] || '📝';
    
    if (level !== 'debug' || this.options.verbose) {
      console.log(`[${timestamp}] ${prefix} ${message}`);
    }
  }

  async validateFileStructure() {
    this.log('Validating file structure...', 'debug');
    
    const requiredFiles = [
      'index.js',
      'package.json',
      'action.yml',
      'src/index.js'  // Validating new modular system
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    // Validate examples directory
    if (!fs.existsSync('examples')) {
      throw new Error('Examples directory missing');
    }

    this.log('File structure validation passed', 'success');
  }

  async testPackageVersionModule() {
    this.log('Testing PackageVersion module...', 'debug');
    
    for (const testCase of TEST_CASES) {
      const filePath = path.join(__dirname, testCase.file);
      
      if (!fs.existsSync(filePath)) {
        this.log(`Skipping ${testCase.name} - file not found: ${testCase.file}`, 'warn');
        continue;
      }

      try {
        // Test reading version
        const packageFile = PackageVersion.fromFile(filePath, testCase.lang);
        
        if (packageFile.version !== testCase.expectedVersion) {
          throw new Error(`Version mismatch. Expected: ${testCase.expectedVersion}, Got: ${packageFile.version}`);
        }

        // Test bumping (without saving)
        for (const bumpLevel of testCase.testBumps) {
          const testPackage = PackageVersion.fromFile(filePath, testCase.lang);
          const originalVersion = testPackage.version;
          testPackage.bump(bumpLevel);
          
          if (bumpLevel !== 'none' && testPackage.version === originalVersion) {
            throw new Error(`Version not bumped for ${bumpLevel} level`);
          }
        }

        this.log(`${testCase.name}: Module test passed`, 'success');
        
      } catch (error) {
        this.log(`${testCase.name}: Module test failed - ${error.message}`, 'error');
        this.results.errors.push(`${testCase.name}: ${error.message}`);
      }
    }
  }

  async testActionExecution(testCase, bumpLevel) {
    return new Promise((resolve) => {
      this.results.total++;
      
      // Setup environment variables
      const env = { ...process.env };
      env.GITHUB_WORKSPACE = __dirname;
      env.INPUT_LANG = testCase.lang;
      env.INPUT_BUMPLVL = bumpLevel;
      env.INPUT_SAVE = 'false'; // Don't save to avoid modifying files
      
      if (testCase.file !== 'package.json') {
        env.INPUT_PATH = testCase.file;
      }

      this.log(`Testing ${testCase.name} with ${bumpLevel} bump...`, 'debug');

      const child = spawn('node', ['index.js'], {
        env,
        stdio: 'pipe',
        cwd: __dirname
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      let resolved = false;
      
      child.on('close', (code) => {
        if (resolved) return;
        resolved = true;
        
        if (code === 0) {
          // Extract version from output
          const versionMatch = output.match(/New version: ([^\n\r]+)/);
          if (versionMatch) {
            this.log(`${testCase.name} (${bumpLevel}): ${versionMatch[1]}`, 'success');
            this.results.passed++;
            resolve({ success: true, version: versionMatch[1], output });
          } else {
            this.log(`${testCase.name} (${bumpLevel}): No version in output`, 'error');
            this.results.failed++;
            this.results.errors.push(`${testCase.name} (${bumpLevel}): No version output`);
            resolve({ success: false, error: 'No version in output' });
          }
        } else {
          this.log(`${testCase.name} (${bumpLevel}): Failed (exit ${code})`, 'error');
          if (error) {
            this.log(`Error: ${error.trim()}`, 'debug');
          }
          this.results.failed++;
          this.results.errors.push(`${testCase.name} (${bumpLevel}): Exit code ${code}`);
          resolve({ success: false, error });
        }
      });

      // Timeout after 5 seconds
      const timeout = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        
        // Kill process gracefully, then forcefully if needed
        child.kill();
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 1000);
        
        this.log(`${testCase.name} (${bumpLevel}): Timeout`, 'error');
        this.results.failed++;
        this.results.errors.push(`${testCase.name} (${bumpLevel}): Timeout`);
        resolve({ success: false, error: 'Timeout' });
      }, 5000);
      
      // Clear timeout when process exits
      child.on('exit', () => {
        clearTimeout(timeout);
      });
    });
  }

  async testPythonAutoDetection() {
    this.log('Testing Python auto-detection...', 'debug');
    
    const env = { ...process.env };
    env.GITHUB_WORKSPACE = __dirname;
    env.INPUT_LANG = 'python';
    env.INPUT_BUMPLVL = 'patch';
    env.INPUT_SAVE = 'false';
    // Don't set INPUT_PATH to test auto-detection

    return new Promise((resolve) => {
      let resolved = false;
      
      const child = spawn('node', ['index.js'], {
        env,
        stdio: 'pipe',
        cwd: __dirname
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (resolved) return;
        resolved = true;
        
        if (code === 0) {
          this.log('Python auto-detection: Passed', 'success');
          resolve({ success: true });
        } else {
          this.log('Python auto-detection: Failed', 'error');
          if (this.options.verbose && error) {
            this.log(`Auto-detection error: ${error.trim()}`, 'debug');
          }
          resolve({ success: false, error });
        }
      });
      
      // Timeout for auto-detection test
      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        
        child.kill('SIGTERM');
        this.log('Python auto-detection: Timeout', 'error');
        resolve({ success: false, error: 'Timeout' });
      }, 5000);
    });
  }

  async runAllTests() {
    try {
      this.log('🚀 Starting Integration Test Suite', 'info');
      this.log(`Testing languages: ${this.options.lang || 'all'}`, 'info');
      this.log('', 'info');

      // Validate structure
      await this.validateFileStructure();

      // Test module functionality
      await this.testPackageVersionModule();

      // Filter test cases by language if specified
      let testCases = TEST_CASES;
      if (this.options.lang) {
        testCases = TEST_CASES.filter(tc => tc.lang === this.options.lang);
        if (testCases.length === 0) {
          throw new Error(`No test cases found for language: ${this.options.lang}`);
        }
      }

      // Test action execution for each case
      this.log('Testing action execution...', 'info');
      for (const testCase of testCases) {
        if (!fs.existsSync(path.join(__dirname, testCase.file))) {
          this.log(`Skipping ${testCase.name} - file not found`, 'warn');
          continue;
        }

        for (const bumpLevel of testCase.testBumps) {
          await this.testActionExecution(testCase, bumpLevel);
        }
      }

      // Test Python auto-detection
      if (!this.options.lang || this.options.lang === 'python') {
        await this.testPythonAutoDetection();
      }

      // Print summary
      this.printSummary();

    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    
    if (this.results.total > 0) {
      const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
      console.log(`📈 Success rate: ${successRate}%`);
    }

    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed === 0) {
      console.log('🎉 All tests passed! Integration is working correctly.');
      console.log('✅ Ready for production use.');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
      process.exit(1);
    }
  }
}

// Help message
function showHelp() {
  console.log(`
Package Bump Tag Commit - Integration Test Suite

Usage:
  node test-integration.js [options]

Options:
  --lang=LANG     Test only specific language (${SUPPORTED_LANGUAGES.join(', ')})
  --verbose, -v   Show detailed debug information
  --help, -h      Show this help message

Examples:
  node test-integration.js                    # Test all languages
  node test-integration.js --lang=python     # Test only Python
  node test-integration.js --verbose         # Show debug output

Supported Languages:
${SUPPORTED_LANGUAGES.map(lang => `  • ${lang}`).join('\n')}

When adding a new language:
1. Add language to SUPPORTED_LANGUAGES array
2. Create example files in examples/ directory  
3. Add test case to TEST_CASES array
4. Run this test to validate implementation
`);
}

// Main execution
if (options.help) {
  showHelp();
  process.exit(0);
}

const tester = new IntegrationTester(options);
tester.runAllTests().catch(error => {
  console.error('Test suite crashed:', error);
  process.exit(1);
});