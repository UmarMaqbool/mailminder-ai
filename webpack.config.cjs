const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    contentScript: './contentScript.ts',
    background: './background.ts',
    react: './public/index.tsx',
    iframe: './public/iframe.tsx',
    infoModel: './public/infoModel.tsx',
    tabInfoModel: './public/tabInfoModel.tsx',
    auth: './public/auth.tsx',
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      template: './public/iframe.html',
      filename: 'iframe.html',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      template: './public/infoModel.html',
      filename: 'infoModel.html',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      template: './public/tabInfoModel.html',
      filename: 'tabInfoModel.html',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      template: './public/auth.html',
      filename: 'auth.html',
      inject: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve('manifest.json'),
          to: path.resolve('dist'),
        },
        {
          from: path.resolve('styles'),
          to: path.resolve('dist/styles'),
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
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
};
