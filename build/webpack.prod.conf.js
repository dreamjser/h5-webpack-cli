import { merge } from 'webpack-merge'
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import { styleLoaders } from './utils.js'
import baseWebpackConfig from './webpack.base.conf.js'
import BundleAnalyzerPlugin from 'webpack-bundle-analyzer'

const prodWebpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: styleLoaders({
      sourceMap: false,
      extract: true,
      usePostCSS: true
    })
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          filename: 'static/js/vendor.[chunkhash].js',
        },
      },
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
    }),
    // copy custom static assets
    // new CopyWebpackPlugin([
    //   {
    //     from: getCurrentPath('./static'),
    //     to: getCurrentPath('./dist'),
    //     // ignore: ['.*']
    //   }
    // ])
  ]
});

export default prodWebpackConfig
