const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add alias for monaco-editor to resolve y-monaco import issue
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'monaco-editor/esm/vs/editor/editor.api.js': path.resolve(
          __dirname,
          'node_modules/monaco-editor/esm/vs/editor/editor.api.js'
        ),
        'monaco-editor': path.resolve(__dirname, 'node_modules/monaco-editor')
      };

      // Ensure proper module resolution
      webpackConfig.resolve.extensions = [
        ...webpackConfig.resolve.extensions,
        '.js',
        '.json'
      ];

      // Suppress source map warnings from Monaco Editor
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /source-map-loader/
      ];

      return webpackConfig;
    }
  }
};
