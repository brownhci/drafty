const path = require("path");

module.exports = {
  context: path.resolve(__dirname),
  entry: {
    form: "./form.ts",
    main: "./main.ts",
    navbar: "./navbar.ts",
    sheet: "./sheet.ts"
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ],
  },
  output: {
    filename: "[name].js",
    path: path.join(process.cwd(), "dist", "public", "js", "bundles"),
  },
};
