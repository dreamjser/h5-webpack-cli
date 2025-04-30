import path from 'path'
import webpack from 'webpack'
import ESLintPlugin from 'eslint-webpack-plugin'
import { getCurrentPath, getVueLoaderConfig, getAppConfig, getGlobalConfig } from './utils.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs'

const appConfig = await getAppConfig()
const envConfig = await getGlobalConfig()

const framework = process.env.currentFramework

const packageName = fs.readFileSync(getCurrentPath('package.json'), 'utf-8').name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    overrideConfigFile: getCurrentPath('.eslintrc.cjs'),
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
  const { VueLoaderPlugin } = (await import('vue-loader')).default

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

export default {
  context: __dirname,
  target: ['web', 'es5'],
  stats: 'minimal',
  entry: {
    app: [getCurrentPath(`src/portal/index.${framework === 'vue'? 'ts': 'tsx'}`)],
  },
  output: {
    publicPath: envConfig.PUBLIC_PATH,
    path: getCurrentPath(appConfig.outputPath || 'dist'),
    library: `${packageName}-[name]`,
    libraryTarget: 'umd',
    chunkLoadingGlobal: `webpackJsonp_${packageName}`,
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
