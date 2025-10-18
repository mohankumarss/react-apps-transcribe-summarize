const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

const deploymentMode = process.env.WEBPACK_DEPLOYMENT_MODE || 'microfrontend';
const isProduction = process.env.NODE_ENV === 'production';
const isMicrofrontend = deploymentMode === 'microfrontend';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    chunkFilename: isProduction ? '[name].[contenthash].js' : '[name].js',
    clean: true,
    publicPath: 'auto'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@shared': path.resolve(__dirname, '../../shared'),
      '@shared/components': path.resolve(__dirname, '../../shared/components'),
      '@shared/services': path.resolve(__dirname, '../../shared/services'),
      '@shared/utils': path.resolve(__dirname, '../../shared/utils'),
      '@shared/config': path.resolve(__dirname, '../../shared/config'),
      '@shared/styles': path.resolve(__dirname, '../../shared/styles'),
      // Map external CRM asset paths to local assets
      '/CWSLogon/resources/images/zb-champion-standard': path.resolve(__dirname, '../../shared/assets/images/zb-champion-standard')
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript'
              ]
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[hash][ext]'
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.WEBPACK_DEPLOYMENT_MODE': JSON.stringify(deploymentMode),
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || 'http://localhost:3001/api'),
      'process.env.ENABLE_LOGGING': JSON.stringify(process.env.ENABLE_LOGGING || 'true'),
      'process.env.ENABLE_OFFLINE': JSON.stringify(process.env.ENABLE_OFFLINE || 'false'),
      'process.env.ENABLE_TELEMETRY': JSON.stringify(process.env.ENABLE_TELEMETRY || 'false'),
      'process.env.ENABLE_THEME_SWITCHING': JSON.stringify(process.env.ENABLE_THEME_SWITCHING || 'false'),
      'process.env.THEME_MODE': JSON.stringify(process.env.THEME_MODE || 'mfe')
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true
    }),
    ...(isProduction ? [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css'
      })
    ] : []),
    // Always include ModuleFederationPlugin for pure Webpack 5 Module Federation
    new ModuleFederationPlugin({
      name: 'shell',
      filename: 'remoteEntry.js',
      remotes: {
        transcriptAndSummary: 'transcriptAndSummary@http://localhost:5176/remoteEntry.js',
        ifPartyMaster: 'ifPartyMaster@http://localhost:5174/remoteEntry.js'
      },
      shared: {
        react: {
          singleton: true,
          strictVersion: false,
          requiredVersion: '^18.0.0',
          eager: true
        },
        'react-dom': {
          singleton: true,
          strictVersion: false,
          requiredVersion: '^18.0.0',
          eager: true
        },
        'react-dom/client': {
          singleton: true,
          strictVersion: false,
          requiredVersion: '^18.0.0',
          eager: true
        },
        'react/jsx-runtime': {
          singleton: true,
          strictVersion: false,
          requiredVersion: '^18.0.0',
          eager: true
        },
        '@crm/shared': {
          singleton: true,
          strictVersion: false,
          eager: true
        }
      }
    })
  ],
  devServer: {
    port: 5175,
    open: true,
    hot: true,
    historyApiFallback: {
      index: '/index.html'
    },
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/'
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  optimization: {
    // Disable splitChunks for Module Federation to avoid conflicts
    splitChunks: false,
    // Preserve function names for better debugging in Module Federation
    minimize: isProduction,
    minimizer: isProduction ? undefined : [],
    // Keep function names in development for better debugging
    ...(isProduction ? {} : {
      usedExports: false,
      sideEffects: false
    })
  },
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  stats: {
    errorDetails: true
  }
};
