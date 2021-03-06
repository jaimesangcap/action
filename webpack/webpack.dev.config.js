const resolve = require('./webpackResolve')
const path = require('path')
const webpack = require('webpack')
const npmPackage = require('../package.json')
// const vendors = require('../dll/vendors.json')
const pluginObjectRestSpread = require('@babel/plugin-proposal-object-rest-spread').default
const pluginClassProps = require('@babel/plugin-proposal-class-properties').default
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import').default
const pluginRelay = require('babel-plugin-relay')
const presetFlow = require('@babel/preset-flow').default
const presetReact = require('@babel/preset-react').default

const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    babelrc: false,
    plugins: [
      pluginObjectRestSpread,
      pluginClassProps,
      pluginDynamicImport,
      [pluginRelay, {artifactDirectory: './src/__generated__'}]
    ],
    presets: [presetFlow, [presetReact, {development: true}]]
  }
}

module.exports = {
  devtool: 'eval',
  mode: 'development',
  entry: {
    app: [path.join(__dirname, '../src/client/client.js')]
  },
  output: {
    path: path.join(__dirname, '../build/'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/static/'
  },
  resolve,
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(npmPackage.version),
      'process.env.NODE_ENV': JSON.stringify('development')
    })
    // new webpack.DllReferencePlugin({
    //   manifest: vendors
    // })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.join(__dirname, '../src/client'), path.join(__dirname, '../src/universal')],
        use: babelLoader
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {test: /\.flow$/, loader: 'ignore-loader'},
      {
        test: /\.tsx?$/,
        include: [
          path.join(__dirname, '../src/__generated__'),
          path.join(__dirname, '../src/client'),
          path.join(__dirname, '../src/universal'),
          path.join(__dirname, '../stories')
        ],
        use: [
          babelLoader,
          {
            loader: 'awesome-typescript-loader',
            options: {
              errorsAsWarnings: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.(eot|ttf|wav|mp3|woff|woff2|otf)$/,
        use: ['file-loader']
      }
    ]
  }
}
