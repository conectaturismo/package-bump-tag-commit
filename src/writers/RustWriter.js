const BaseWriter = require('./BaseWriter');
const fs = require('fs');
const TOML = require('@ltd/j-toml');

/**
 * Writer for Rust Cargo.toml files
 */
class RustWriter extends BaseWriter {
  write(filePath, data, newVersion) {
    const updatedData = this.updateVersion(data, newVersion);
    const tomlString = TOML.stringify(updatedData, {
      newline: '\n',
      newlineAround: 'section',
    });
    fs.writeFileSync(filePath, tomlString + '\n');
  }

  canHandle(filePath, data) {
    return filePath.includes('Cargo.toml') && data.package;
  }

  updateVersion(data, newVersion) {
    return {
      ...data,
      package: {
        ...data.package,
        version: newVersion
      }
    };
  }
}

module.exports = RustWriter;