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
  axios: "axios",
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

const baseConfig = {
  mode: "production",
  // target: 'node',
  // entry,
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
      },
    ]
  },
  plugins: [
    new WebpackBar(),
    new publishplugin({docPath})
  ]
};

// 逻辑编排的组件，edit中不需要runtime
const changeEditEntry = (filePath) => {
  let content = fse.readFileSync(filePath).toString();
  content = content.replace(/comDef\.runtime.*\.default\;/g, 'comDef.runtime = () => {};');
  fse.writeFileSync(filePath, content);
};

changeEditEntry(entry.edit);
const editJsConfig = {
  ...baseConfig,
  target: 'web',
  entry: { edit: entry.edit}
};

const rtJsConfig = {
  ...baseConfig,
  target: 'node',
  entry: {rt: entry.rt}
};

module.exports = [editJsConfig,rtJsConfig];
