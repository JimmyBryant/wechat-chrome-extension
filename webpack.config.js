var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    background: path.resolve(__dirname, 'src', 'background.js'),
    popup: path.resolve(__dirname, 'src', 'popup.js')
  },
  output: {
    path: path.resolve(__dirname, 'app', 'js'),
    filename: '[name].js',
  },  
  resolve: {
    alias: {
        'vue': 'vue/dist/vue.js'
    },
    modules: [path.resolve(__dirname, 'node_modules'),'node_modules'],
    extensions: ['.js', '.css', '.vue']
  },  
  module: {
    rules: [ {
      test: /\.vue$/,
      loader: 'vue-loader'
    },{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      loader: 'url',
      query: {
        limit: 10000,
        name: '[name].[ext]?[hash]'
      }
    }]
  },
  externals: {
    'jquery': 'jQuery'
  },
  watch:true,
  watchOptions:{
    aggregateTimeout: 300,
    ignored: /node_modules/
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
}