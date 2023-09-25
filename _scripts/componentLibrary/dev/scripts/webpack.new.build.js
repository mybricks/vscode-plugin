const path = require("path");
const fse = require("fs-extra");
const WebpackBar = require("webpackbar");
const { VueLoaderPlugin } = require('vue-loader')
const { build } = require("../../../../utils");
const publishplugin = require("../publishplugin");
const babelPluginAutoCssModules = require('../babel-plugins/babel-plugin-auto-css-modules');
const { tempPubPath } = require("../../../../const");

function mybricksJsonTips (configName) {
  return `
请正确配置${configName}内comAry信息
例:
{
  "comAry": [
    "./src/button/com.json"
  ]
}`;
}

console.log("组件库编译中...");

const docPath = '--replace-docPath--';
const configName = '--replace-configName--';

const { id, rtJS, editJS, comlibPath, singleComs } = build(docPath, configName);

if (!editJS || !id) {
  console.error(mybricksJsonTips(configName));
  return;
}

console.log(`当前编译组件来自${configName}下${comlibPath}的配置`);

const docDistDirPath = path.join(docPath, 'dist');

if (!fse.existsSync(docDistDirPath)) {
  fse.mkdirSync(docDistDirPath);
}

const editJSPath = path.join(docDistDirPath, 'edit.js');

fse.writeFileSync(editJSPath, editJS);

// const rtJSPath = path.join(docDistDirPath, 'rt.js');

// fse.writeFileSync(rtJSPath, rtJS);

const entry = {
  edit: editJSPath,
  // rt: rtJSPath
};

const jsonconfig = {
  entry,
  docPath,
  configName
};

const config = fse.readJSONSync(docPath + "/" + configName);
console.log(config, 'config');
const { externals } = config;

const externalsMap = {
  'react': 'React',
  'react-dom': 'ReactDOM',
  'vue': 'vue',
};

if (Array.isArray(externals)) {
  externals.forEach(({name, library, urls}) => {
    if (name && library && Array.isArray(urls)) {
      externalsMap[name] = library;
    }
  });
}

module.exports = {
  mode: "production",
  entry: {
    edit: entry.edit
  },
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
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          hotReload: false,
        },
      },
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
                ["@babel/plugin-proposal-class-properties", {"loose": true}],
                [babelPluginAutoCssModules]
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
                "@babel/preset-react"
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", {"loose": true}],
                [babelPluginAutoCssModules]
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
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
        sideEffects: true
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: 'style-loader',
            options: {attributes: {title: 'less'}}
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]-[hash:5]'
              }
            }
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true
              },
            },
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: "style-loader",
            options: {attributes: {title: "less"}}
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]"
              }
            }
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true
              },
            },
          }
        ],
        include: /node_modules/
      },
      {
        // test: /\.(gif|png|jpe?g|webp|svg|woff|woff2|eot|ttf)$/i,
        test: /\.(gif|png|jpe?g|webp|woff|woff2|eot|ttf)$/i,
        type: 'asset',
        generator: {
          dataUrl: {
            encoding: 'base64',
          },
        },
      },
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: /url/,
        generator: {
          dataUrl: {
            encoding: 'base64',
          },
        },
      },
      // TODO: 局部开放webpack配置项
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: ['@svgr/webpack'],
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
    new VueLoaderPlugin(),
    new publishplugin({jsonconfig, config, type: 'edit'})
  ]
};
