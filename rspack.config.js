/**
 * Rspack configuration for all processes
 * Bundles main, preload, and renderer processes
 */

const path = require('path');

/**
 * @type {import('@rspack/core').Configuration[]}
 */
module.exports = [
  // Main process
  {
    name: 'main',
    mode: 'production',
    entry: path.join(__dirname, 'src/main/main.ts'),
    output: {
      path: path.join(__dirname, 'dist/main'),
      filename: 'main.js',
      clean: true,
      library: {
        type: 'commonjs2',
      },
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                  },
                  target: 'es2022',
                },
              },
            },
          ],
          type: 'javascript/auto',
        },
      ],
    },
    target: 'node',
    externals: {
      electron: 'commonjs electron',
    },
    devtool: 'source-map',
    optimization: {
      minimize: false,
    },
  },

  // Preload script
  {
    name: 'preload',
    mode: 'production',
    entry: path.join(__dirname, 'src/preload/index.ts'),
    output: {
      path: path.join(__dirname, 'dist/preload'),
      filename: 'index.js',
      clean: true,
      library: {
        type: 'commonjs2',
      },
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                  },
                  target: 'es2022',
                },
              },
            },
          ],
          type: 'javascript/auto',
        },
      ],
    },
    target: 'node',
    externals: {
      electron: 'commonjs electron',
    },
    devtool: 'source-map',
    optimization: {
      minimize: false,
    },
  },

  // Renderer process
  {
    name: 'renderer',
    mode: 'production',
    entry: path.join(__dirname, 'src/renderer/index.ts'),
    output: {
      path: path.join(__dirname, 'dist/renderer'),
      filename: 'index.js',
      clean: true,
      iife: true,
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                  },
                  target: 'es2022',
                },
              },
            },
          ],
          type: 'javascript/auto',
        },
      ],
    },
    target: 'web',
    devtool: 'source-map',
    optimization: {
      minimize: false,
    },
  },
];
