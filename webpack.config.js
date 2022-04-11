const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const ifdefOpts = {
  "ifdef-verbose": true, // add this for verbose output
  "ifdef-triple-slash": true, // add this to use double slash comment instead of default triple slash
  "ifdef-fill-with-blanks": true, // add this to remove code with blank spaces instead of "//" comments
};

module.exports = {
  mode: "development",
  entry: {
    latest: "./src/latest.js",
    "latest.webvitals": "./src/latest.webvitals.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    symlinks: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "src/index.html", to: "index.html" }],
    }),
  ],
  module: {
    rules: [
      {
        test: /latest.js/,
        use: {
          loader: "ifdef-loader",
          options: { ...ifdefOpts, webvitals: false },
        },
      },
      {
        test: /latest.webvitals.js/,
        use: {
          loader: "ifdef-loader",
          options: { ...ifdefOpts, webvitals: true },
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 1234,
    allowedHosts: "all",
  },
};
