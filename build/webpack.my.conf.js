let config={
  entry: {
    app: './src/main.js'
  },
  output: {
    // path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath:'/'
  },
}
module.exports =config