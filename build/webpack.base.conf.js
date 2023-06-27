const path = require('path')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const ESLintPlugin = require('eslint-webpack-plugin')
const { getCurrentPath, getVueLoaderConfig, getAppConfig, getGlobalConfig } = require('./utils')

const appConfig = getAppConfig()
const envConfig = getGlobalConfig()

const framework = process.env.currentFramework

let rules = [
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

let plugins = [
  new WebpackBar(),
  new webpack.DefinePlugin({
    GLOBAL_CONFIG: envConfig,
  }),
  new ESLintPlugin({
    cache: true,
    context: path.resolve(process.cwd()),
    files: framework === 'vue'?
      ['src/*.js', 'src/*.vue', 'src/**/*.js', 'src/**/*.vue']:
      ['src/*.ts', 'src/*.tsx', 'src/**/*.ts', 'src/**/*.tsx'],
    overrideConfigFile: getCurrentPath('.eslintrc.js'),
    fix: true,
    extensions: ['js', 'vue', 'ts', 'tsx'],
    exclude: '/node_modules/',
    failOnWarning: true,
  })
]

if(framework === 'vue') {
  const { VueLoaderPlugin } = require('vue-loader')

  rules.push({
    test: /\.vue$/,
    loader: 'vue-loader',
    options: getVueLoaderConfig()
  })

  rules.push({
    test: /\.js$/,
    include: [
      getCurrentPath('src'),
    ],
    use: [
      {
        loader: 'babel-loader',
      }
    ]
  })

  plugins.push(new VueLoaderPlugin())
}else{
  rules.push({
    test: /\.(js|tsx?)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
      },
    ]
  })
}

module.exports = {
  context: __dirname,
  target: ['web', 'es5'],
  stats: 'errors-only',
  entry: {
    app: [getCurrentPath(`src/portal/index.${framework === 'vue'? 'js': 'tsx'}`)],
  },
  output: {
    publicPath: envConfig.PUBLIC_PATH,
    path: getCurrentPath('./dist'),
    filename: 'static/js/[name].[chunkhash].js',
    chunkFilename: 'static/js/[id].[chunkhash].js',
  },
  resolve: {
    extensions: ['.js', '.vue', '.ts', '.tsx'],
    alias: appConfig.alias,
  },
  module: {
    rules,
  },
  plugins,
}
