const path = require('path');

module.exports = {
  watchFolders: [
    path.resolve(__dirname, '../../src')
  ],
  resolver: {
    // This is optional if you want to force extensions
    sourceExts: ['tsx', 'ts', 'js', 'jsx', 'json', 'native.tsx', 'native.js'],
  },
};
