const path = require('path')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const { VueLoaderPlugin } = require('vue-loader')
const ESLintPlugin = require('eslint-webpack-plugin')
const { getCurrentPath, getVueLoaderConfig, getAppConfig, getGlobalConfig } = require('./utils')

const appConfig = getAppConfig()
const envConfig = getGlobalConfig()

module.exports = {
  context: __dirname,
  stats: 'errors-only',
  entry: {
    app: [getCurrentPath('src/portal/single/index.js')],
  },
  output: {
    publicPath: envConfig.PUBLIC_PATH,
    path: getCurrentPath('./dist'),
    filename: 'static/js/[name].[chunkhash].js',
    chunkFilename: 'static/js/[id].[chunkhash].js',
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: appConfig.alias,
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: getVueLoaderConfig()
      },
      {
        test: /\.js$/,
        include: [
          getCurrentPath('src'),
        ],
        use: [
          {
            loader: 'babel-loader',
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'static/img/[hash][ext][query]'
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'static/media/[hash][ext][query]'
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'static/fonts/[hash][ext][query]'
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024
          }
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new WebpackBar(),
    new webpack.DefinePlugin({
      GLOBAL_CONFIG: envConfig,
    }),
    new ESLintPlugin({
      cache: true,
      context: path.resolve(process.cwd()),
      files: ['src/*.js', 'src/*.vue', 'src/**/*.js', 'src/**/*.vue'],
      overrideConfigFile: getCurrentPath('.eslintrc.js'),
      fix: true,
      extensions: ['js', 'vue'],
      exclude: '/node_modules/',
      failOnWarning: true,
    }),
  ],
}
