const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      popup: './src/popup.tsx',
      background: './src/background/index.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: (pathData) => {
        // Use simple name for background script (required by manifest v3)
        return pathData.chunk.name === 'background' ? '[name].js' : '[name].[contenthash:8].js';
      },
      chunkFilename: '[name].[contenthash:8].chunk.js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: 'esnext'
              }
            }
          },
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/popup/index.html',
        filename: 'popup.html',
        chunks: ['popup'],
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        } : false,
        inject: true
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'manifest.json',
            to: 'manifest.json'
          },
          {
            from: 'icons',
            to: 'icons'
          }
        ]
      })
    ],
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: (chunk) => {
          // Don't split chunks for background script
          return chunk.name !== 'background';
        },
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 20
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 30
          },
          pdfjs: {
            test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
            name: 'pdfjs',
            priority: 30
          },
          docx: {
            test: /[\\/]node_modules[\\/](docx|mammoth)[\\/]/,
            name: 'docx',
            priority: 30
          },
          common: {
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: {
        name: (entrypoint) => {
          // Background script shouldn't have runtime chunk
          return entrypoint.name === 'background' ? false : 'runtime';
        }
      },
      usedExports: true,
      sideEffects: false
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};
