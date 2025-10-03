/**
 * Package Version Management Library
 * 
 * A modular, extensible library for managing versions across different
 * programming languages and package formats.
 */

// Main classes
const PackageVersion = require('./PackageVersion');
const VersionBumper = require('./VersionBumper');

// Factories
const ParserFactory = require('./factories/ParserFactory');
const WriterFactory = require('./factories/WriterFactory');

// Base classes (for extending)
const BaseParser = require('./parsers/BaseParser');
const BaseWriter = require('./writers/BaseWriter');

// Individual parsers (for advanced usage)
const JavaScriptParser = require('./parsers/JavaScriptParser');
const RustParser = require('./parsers/RustParser');
const PhpParser = require('./parsers/PhpParser');
const PythonTomlParser = require('./parsers/PythonTomlParser');
const PythonSetupParser = require('./parsers/PythonSetupParser');
const PythonInitParser = require('./parsers/PythonInitParser');
const GoParser = require('./parsers/GoParser');

// Individual writers (for advanced usage)
const JavaScriptWriter = require('./writers/JavaScriptWriter');
const RustWriter = require('./writers/RustWriter');
const PhpWriter = require('./writers/PhpWriter');
const PythonTomlWriter = require('./writers/PythonTomlWriter');
const PythonSetupWriter = require('./writers/PythonSetupWriter');
const PythonInitWriter = require('./writers/PythonInitWriter');
const GoWriter = require('./writers/GoWriter');

// Services
const InputService = require('./services/InputService');
const PathResolverService = require('./services/PathResolverService');
const GitService = require('./services/GitService');
const OutputService = require('./services/OutputService');

// Config
const ConfigService = require('./config/ConfigService');

// Action Orchestrator
const ActionOrchestrator = require('./ActionOrchestrator');

module.exports = {
  // Main API
  PackageVersion,
  VersionBumper,
  ActionOrchestrator,
  
  // Factories
  ParserFactory,
  WriterFactory,
  
  // Services
  services: {
    InputService,
    PathResolverService,
    GitService,
    OutputService
  },
  
  // Configuration
  config: {
    ConfigService
  },
  
  // Base classes for extension
  BaseParser,
  BaseWriter,
  
  // Parsers
  parsers: {
    JavaScriptParser,
    RustParser,
    PhpParser,
    PythonTomlParser,
    PythonSetupParser,
    PythonInitParser,
    GoParser
  },
  
  // Writers
  writers: {
    JavaScriptWriter,
    RustWriter,
    PhpWriter,
    PythonTomlWriter,
    PythonSetupWriter,
    PythonInitWriter,
    GoWriter
  }
};