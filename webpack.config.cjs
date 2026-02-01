const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    background: './src/background.js',
    offscreen: './src/offscreen.js',
    content: './src/content.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname),
  },
  resolve: {
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    },
  },
};
