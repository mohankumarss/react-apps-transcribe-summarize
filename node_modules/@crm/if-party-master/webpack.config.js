const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

const deploymentMode = process.env.WEBPACK_DEPLOYMENT_MODE || 'microfrontend';
const isProduction = process.env.NODE_ENV === 'production';
const isMicrofrontend = deploymentMode === 'microfrontend';
const isWebResource = deploymentMode === 'web_resource';
const isStandalone = deploymentMode === 'standalone';

// Debug logging (can be enabled with WEBPACK_DEBUG=true)
if (process.env.WEBPACK_DEBUG === 'true') {
  console.log('🔧 Webpack Build Configuration:');
  console.log(`  Deployment Mode: ${deploymentMode}`);
  console.log(`  Is Production: ${isProduction}`);
  console.log(`  Is Microfrontend: ${isMicrofrontend}`);
  console.log(`  Is Web Resource: ${isWebResource}`);
  console.log(`  Is Standalone: ${isStandalone}`);
}

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/main.tsx',
  output: {
    path: isWebResource?path.resolve(__dirname, 'dist/webresource'):path.resolve(__dirname, 'dist'),
    filename: isWebResource ? 'app.js' : (isProduction ? '[name].[contenthash].js' : '[name].js'),
    chunkFilename: isWebResource ? '[name].js' : (isProduction ? '[name].[contenthash].js' : '[name].js'),
    clean: true,
    publicPath: isWebResource ? './' : 'auto'
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
      'process.env.ENABLE_THEME_SWITCHING': JSON.stringify(isWebResource ? 'false' : (process.env.ENABLE_THEME_SWITCHING || 'false')),
      'process.env.THEME_MODE': JSON.stringify(isWebResource ? 'crm' : (process.env.THEME_MODE || 'mfe')),
      // Define build-time constants to eliminate dead code
      '__WEBRESOURCE_BUILD__': JSON.stringify(isWebResource),
      '__MICROFRONTEND_BUILD__': JSON.stringify(isMicrofrontend),
      '__STANDALONE_BUILD__': JSON.stringify(!isWebResource && !isMicrofrontend),
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
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
        minifyURLs: true,
      } : false
    }),
    ...(isProduction ? [
      new MiniCssExtractPlugin({
        filename: isWebResource ? 'app.css' : '[name].[contenthash].css',
        chunkFilename: isWebResource ? '[name].css' : '[id].[contenthash].css',
        ignoreOrder: isWebResource, // Ignore CSS order warnings for webresource builds
      })
    ] : []),
    // Include ModuleFederationPlugin only for microfrontend builds
    ...(isMicrofrontend ? [
      new ModuleFederationPlugin({
        name: 'ifPartyMaster',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App.tsx'
        },
        dts: false, // Disable TypeScript generation to avoid warnings
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            eager: false  // Remote should not be eager - use host's React
          },
          'react-dom': {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            eager: false  // Remote should not be eager - use host's ReactDOM
          },
          'react-dom/client': {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            eager: false  // Remote should not be eager - use host's ReactDOM client
          },
          'react/jsx-runtime': {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            eager: false  // Remote should not be eager - use host's JSX runtime
          },
          '@crm/shared': {
            singleton: true,
            strictVersion: false,
            eager: false  // Remote should not be eager - use host's shared library
          }
        }
      })
    ] : []),

    // For webresource builds, replace bootstrap module to prevent dynamic imports
    ...(isWebResource ? [
      new webpack.NormalModuleReplacementPlugin(
        /^\.\/bootstrap$/,
        './bootstrap.webresource'
      ),

    ] : [])
  ],
  devServer: {
    port: 5174,
    open: false,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  optimization: {
    // Configure splitChunks based on deployment mode
    splitChunks: isWebResource ? false : (isMicrofrontend ? false : {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    }),
    // For webresource builds, ensure absolute single file output
    ...(isWebResource ? {
      runtimeChunk: false,
      sideEffects: false,
      usedExports: true,
      providedExports: true,
      innerGraph: true,
      mangleExports: true,
      // Prevent any dynamic imports from creating chunks
      concatenateModules: true,
      // Remove license comments and files
      minimizer: [
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false, // Prevent .LICENSE.txt files
        }),
      ],
    } : {}),
    // Preserve function names for better debugging in Module Federation
    minimize: isProduction,
    minimizer: isProduction && !isWebResource ? undefined : [],
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
