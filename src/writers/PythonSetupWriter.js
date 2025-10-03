const BaseWriter = require('./BaseWriter');
const fs = require('fs');

/**
 * Writer for Python setup.py files
 */
class PythonSetupWriter extends BaseWriter {
  write(filePath, data, newVersion) {
    const updatedContent = this.updateVersionInContent(data._content, newVersion);
    fs.writeFileSync(filePath, updatedContent);
  }

  canHandle(filePath, data) {
    return data._fileType === 'setup.py';
  }

  updateVersion(data, newVersion) {
    return {
      ...data,
      version: newVersion,
      _content: this.updateVersionInContent(data._content, newVersion)
    };
  }

  updateVersionInContent(content, newVersion) {
    return content.replace(
      /version\s*=\s*['"][^'"]+['"]/,
      `version='${newVersion}'`
    );
  }
}

module.exports = PythonSetupWriter;