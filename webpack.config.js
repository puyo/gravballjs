var path = require("path");
var webpack = require("webpack");

module.exports = {
  // choose a dev tool to enhance debugging. "eval" means that each module will be executed with eval.
  // eval takes module and stringify it - build/rebuild speed very fast
  devtool: "inline-source-map",
  //devtool: 'eval',

  entry: [
    "webpack-dev-server/client?http://0.0.0.0:8080", //path to js files (client)
    "webpack/hot/only-dev-server", //path to js files (server) with our plugin it ll send pieces of changed code
    "./src/gravball-client.js"
  ],

  output: {
    path: path.resolve(__dirname, "build"), //the name of folder where bundle.js ll live
    filename: "bundle.js",
    publicPath: "/static/"
  },

  resolve: {
    extensions: ['.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        include: [path.resolve(__dirname, 'scripts')],
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["env"]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader?modules", "postcss-loader"]
      }
    ]
  },

  // add additional plugins to the compiler
  plugins: [
    new webpack.HotModuleReplacementPlugin(), //hot-module replacement. the updated module is replaced and via socket shown up on the page
    new webpack.NamedModulesPlugin() // prints more readable module names in the browser console on HMR updates
  ],

  stats: {
    colors: true
  },
  devServer: {
    hot: true
  }
};
