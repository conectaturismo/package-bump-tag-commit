const BaseWriter = require('./BaseWriter');
const fs = require('fs');
const TOML = require('@ltd/j-toml');

/**
 * Writer for Python pyproject.toml files
 */
class PythonTomlWriter extends BaseWriter {
  write(filePath, data, newVersion) {
    const updatedData = this.updateVersion(data, newVersion);
    const tomlString = TOML.stringify(updatedData, {
      newline: '\n',
      newlineAround: 'section',
    });
    fs.writeFileSync(filePath, tomlString + '\n');
  }

  canHandle(filePath, data) {
    return (
      (filePath.includes('pyproject.toml') || filePath.includes('.toml')) &&
      (data.project || data.tool?.poetry) &&
      !data._fileType
    );
  }

  updateVersion(data, newVersion) {
    const updatedData = { ...data };
    
    if (updatedData.project) {
      updatedData.project = {
        ...updatedData.project,
        version: newVersion
      };
    } else if (updatedData.tool?.poetry) {
      updatedData.tool = {
        ...updatedData.tool,
        poetry: {
          ...updatedData.tool.poetry,
          version: newVersion
        }
      };
    }
    
    return updatedData;
  }
}

module.exports = PythonTomlWriter;