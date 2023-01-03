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
};

/**
 * // 生成组件库代码
 * node ./_scripts/generateCodePublish.js docPath=/Users/liuzhigang/kshou/code/fangzhou/workflow configName=mybricks.json
 * 
 * // 打包组件库代码
 * ./node_modules/.bin/webpack  --config ./_scripts/componentLibrary/dev/scripts/webpack.build-node.js
 * 
 */
if (Array.isArray(externals)) {
  externals.forEach(({name, library, urls}) => {
    if (name && library && Array.isArray(urls)) {
      externalsMap[name] = library;
    }
  });
}

module.exports = {
  mode: "production",
  target: 'node',
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
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", {"loose": true}]
              ],
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", {"loose": true}]
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
    new publishplugin({docPath})
  ]
};
