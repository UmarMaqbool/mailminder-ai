const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    // Add the components path that surely be render in you extension
    contentScript: './contentScript.ts',
    background: './background.ts',
    react: './public/index.tsx',
    iframe: './public/iframe.tsx',
    infoModel: './public/infoModel.tsx',
    tabInfoModel: './public/tabInfoModel.tsx',
    auth: './public/auth.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  plugins: [
    // Add the html file path that as chrome only runs the html file in dist
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
    new Dotenv(),
  ],
  module: {
    rules: [
      //Set rules for css files or the image file if you are using
      {
        test: /.(ts|tsx)$/,
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
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
};
