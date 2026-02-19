const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filePath) => {
    try {
      const fullPath = path.join(__dirname, '..', filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
});
