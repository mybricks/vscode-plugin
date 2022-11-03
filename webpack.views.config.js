const path = require("path");

const viewsPath = path.join(__dirname, "views");

module.exports = {
  entry: {
    explorerDevelop: path.join(viewsPath, "explorer/develop/index.tsx"),
    explorerSettings: path.join(viewsPath, "explorer/settings/index.tsx"),
    mybricksWelcome: path.join(viewsPath, "mybricks/welcome/index.tsx")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: "/node_modules/",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]-[hash:5]'
              }
            }
          },
          "less-loader",
        ],
      },
    ],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist", "views"),
  },
};
