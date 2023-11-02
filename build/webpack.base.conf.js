const path = require('path')
const webpack = require('webpack')
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
  new ESLintPlugin({
    cache: true,
    context: path.resolve(process.cwd()),
    files: framework === 'vue'?
      ['src/**/*.js', 'src/**/*.vue']:
      ['src/**/*.ts', 'src/**/*.tsx'],
    overrideConfigFile: getCurrentPath('.eslintrc.js'),
    fix: true,
    extensions: ['js', 'vue', 'ts', 'tsx'],
    exclude: '/node_modules/',
    failOnWarning: true,
  }),
  new webpack.DefinePlugin({
    GLOBAL_CONFIG: envConfig,
  }),

]

if(framework === 'vue') {
  const { VueLoaderPlugin } = require('vue-loader')

  rules.push({
    test: /\.vue$/,
    loader: 'vue-loader',
    options: getVueLoaderConfig()
  })

  rules.push({
    test: /\.tsx?$/,
    use: [{
      loader: 'swc-loader',
    },{
      loader: "ts-loader",
      options: {
        appendTsSuffixTo: [/\.vue$/],
      },

    }],
    include: [
      getCurrentPath('src'),
    ],
  })

  rules.push({
    test: /\.js$/,
    loader: 'swc-loader',
    include: [
      getCurrentPath('src'),
    ],
  })

  plugins.push(new VueLoaderPlugin())
}else{
  rules.push({
    test: /\.(js|tsx?)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'swc-loader',
      },
    ]
  })
}

module.exports = {
  context: __dirname,
  target: ['web', 'es5'],
  stats: 'minimal',
  entry: {
    app: [getCurrentPath(`src/portal/index.${framework === 'vue'? 'ts': 'tsx'}`)],
  },
  output: {
    publicPath: envConfig.PUBLIC_PATH,
    path: getCurrentPath(appConfig.outputPath || 'dist'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[id].[chunkhash].js',
  },
  resolve: {
    extensions: ['.js', '.vue', '.ts', '.tsx', '.mjs', '.cjs'],
    alias: appConfig.alias,
  },
  module: {
    rules,
  },
  plugins,
}
