const path = require("path");

module.exports = {
  devtool: "source-map",
  entry: {
    main: "./build-tsc/Main.js"
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./dist/wolves-frontend/")
  },
  mode: "development"
};
