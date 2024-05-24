const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    contentScript: './contentScript.ts',
    background: './background.ts',
    react: './index.tsx',
    iframe: './iframe.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      template: './iframe.html',
      filename: 'iframe.html',
      inject: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve('manifest.json'),
          to: path.resolve('dist'),
        },
        {
          from: path.resolve('icons'),
          to: path.resolve('dist/icons'),
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
};
