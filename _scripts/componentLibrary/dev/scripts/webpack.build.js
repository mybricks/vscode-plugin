const path = require("path");
const fse = require("fs-extra");
const WebpackBar = require("webpackbar");

const publishplugin = require("./publishplugin");
const { tempPubPath } = require("../../../const");

const { filename } = process.env;
const jsonconfig = fse.readJSONSync(path.resolve(tempPubPath, `./${filename}`));
const { entry, docPath, configName } = jsonconfig;
const config = fse.readJSONSync(docPath + "/" + configName);
const { externals } = config;

const externalsMap = {
  "react": "React",
  "react-dom": "ReactDOM"
};

if (Array.isArray(externals)) {
  externals.forEach(({ name, library, urls }) => {
    if (name && library && Array.isArray(urls)) {
      externalsMap[name] = library;
    }
  });
}

module.exports = {
  mode: "production",
  entry,
  output: {
    path: path.resolve(docPath, './dist'),
    filename: "[name].js",
    libraryTarget: "umd",
    library: "MybricksComDef",
    chunkFilename: 'chunk_[name]_[contenthash:4].js'
  },
  resolve: {
    alias: {},
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  externals: [externalsMap],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react"
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", { "loose": true }]
              ],
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.(ts|tsx)?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react"
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", { "loose": true }]
              ],
              cacheDirectory: true
            }
          },
          {
            loader: "ts-loader",
            options: {
                silent: true,
                transpileOnly: true,
            },
          },
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: "style-loader",
            options: { attributes: { title: "less" } }
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]-[hash:5]"
              }
            }
          },
          "less-loader"
        ]
      },
      {
        test: /\.(gif|png|jpe?g|webp|svg|woff|woff2|eot|ttf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024 * 2,
              name: 'img_[name]_[contenthash:4].[ext]'
            }
          }
        ]
      },
      {
        test: /\.d.ts$/i,
        use: [{ loader: 'raw-loader' }]
      },
      {
        test: /\.(xml|txt|html|cjs|theme)$/i,
        use: [{ loader: 'raw-loader' }]
      }
    ]
  },
  plugins: [
    new WebpackBar(),
    new publishplugin({ docPath })
  ]
};
