// filepath: /c:/Users/MattiasBälter/my-first-extension/webpack.config.js
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');
const isDevelopment = process.env.NODE_ENV !== 'production';

const plugins = [
  new CopyWebpackPlugin({
    patterns: [
      { from: "**/*.html", context: "src" }
    ]
  })
];

if (isDevelopment) {
  const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
  plugins.push(new ReactRefreshWebpackPlugin());
}

module.exports = {
  devtool: "inline-source-map",
  devServer: {
    server: 'https',
    port: 3000,
    open: false,
    hot: true,
    static: {
      directory: path.join(__dirname, "./"), // Serve files from the 'dist' directory
    },
  },
  entry: {
    index: './src/index.ts',

  },
  output: {
    publicPath: "/dist/",
    filename: '[name].js', // Ensure this matches the script tag in your HTML
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript'
              ],
              plugins: [isDevelopment && 'react-refresh/babel'].filter(Boolean),
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [isDevelopment && 'react-refresh/babel'].filter(Boolean),
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: plugins,
  mode: isDevelopment ? 'development' : 'production',
};