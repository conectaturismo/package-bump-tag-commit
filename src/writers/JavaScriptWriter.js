const BaseWriter = require('./BaseWriter');
const fs = require('fs');

/**
 * Writer for JavaScript package.json files
 */
class JavaScriptWriter extends BaseWriter {
  write(filePath, data, newVersion) {
    const updatedData = this.updateVersion(data, newVersion);
    const jsonString = JSON.stringify(updatedData, null, 2);
    fs.writeFileSync(filePath, jsonString + '\n');
  }

  canHandle(filePath, data) {
    return filePath.includes('package.json') && typeof data === 'object' && !data._fileType;
  }

  updateVersion(data, newVersion) {
    return {
      ...data,
      version: newVersion
    };
  }
}

module.exports = JavaScriptWriter;