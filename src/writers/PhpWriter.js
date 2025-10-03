const BaseWriter = require('./BaseWriter');
const fs = require('fs');

/**
 * Writer for PHP composer.json files
 */
class PhpWriter extends BaseWriter {
  write(filePath, data, newVersion) {
    const updatedData = this.updateVersion(data, newVersion);
    const jsonString = JSON.stringify(updatedData, null, 2);
    fs.writeFileSync(filePath, jsonString + '\n');
  }

  canHandle(filePath, data) {
    return filePath.includes('composer.json') && typeof data === 'object' && !data._fileType;
  }

  updateVersion(data, newVersion) {
    return {
      ...data,
      version: newVersion
    };
  }
}

module.exports = PhpWriter;