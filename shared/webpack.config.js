const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const deploymentMode = process.env.WEBPACK_DEPLOYMENT_MODE || 'standalone';
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: {
    index: './index.ts',
    components: './components/index.ts',
    services: './services/index.ts',
    utils: './utils/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      name: '@crm/shared',
      type: 'umd'
    },
    globalObject: 'this',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@shared': path.resolve(__dirname, '.'),
      '@shared/components': path.resolve(__dirname, 'components'),
      '@shared/services': path.resolve(__dirname, 'services'),
      '@shared/utils': path.resolve(__dirname, 'utils'),
      '@shared/config': path.resolve(__dirname, 'config'),
      '@shared/styles': path.resolve(__dirname, 'styles'),
      // Map external CRM asset paths to local assets
      '/CWSLogon/resources/images/zb-champion-standard': path.resolve(__dirname, 'assets/images/zb-champion-standard')
    }
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM'
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
              transpileOnly: false,
              compilerOptions: {
                declaration: true,
                declarationMap: true,
                outDir: './dist'
              }
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
    ...(isProduction ? [
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      })
    ] : [])
  ],
  optimization: {
    splitChunks: false, // Don't split chunks for library build
    minimize: isProduction
  },
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  stats: {
    errorDetails: true
  }
};
