const BaseWriter = require('./BaseWriter');
const fs = require('fs');

/**
 * Writer for Python __init__.py files
 */
class PythonInitWriter extends BaseWriter {
  write(filePath, data, newVersion) {
    const updatedContent = this.updateVersionInContent(data._content, newVersion);
    fs.writeFileSync(filePath, updatedContent);
  }

  canHandle(filePath, data) {
    return data._fileType === '__init__.py';
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
      /__version__\s*=\s*['"][^'"]+['"]/,
      `__version__ = '${newVersion}'`
    );
  }
}

module.exports = PythonInitWriter;