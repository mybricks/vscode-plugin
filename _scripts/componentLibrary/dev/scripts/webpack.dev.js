const path = require("path");
const fse = require("fs-extra");
const WebpackBar = require("webpackbar");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MybricksPluginConnectComlibApp = require("mybricks-plugin-connect-comlib-app");

const { mybricksJsonPath, docPath } = process.env;
const outputPath = path.resolve(__dirname, "../../public");
const config = fse.readJSONSync(mybricksJsonPath);
const { externals, proxy = [] } = config;
const externalsMap = {
  "react": "React",
  "react-dom": "ReactDOM"
};
const defaultExternals = [
  {
    "name": "@ant-design/icons",
    "library": "icons",
    "urls": ["assets/1690444248634.ant-design-icons_4.7.0_min.js"]
  },
  {
    "name": "antd",
    "library": "antd",
    "urls": [
      "assets/4.21.6.antd.min.css",
      "assets/1690443543399.2.29.4_moment.min.js",
      "assets/1690444184854.4.21.6_antd.min.js",
      "assets/antd-4.21.6-locale-zh_CN.js",
      "assets/moment-2.29.4-locale_zh-cn.js"
    ]
  }
];

let htmlLink = "";
let htmlScript = "";

function externalUrlsHandle (urls) {
  urls.forEach((url) => {
    if (url.endsWith('.js')) {
      htmlScript = htmlScript + `<script src="${url}"></script>\n`;
    } else if (url.endsWith('.css')) {
      htmlLink = htmlLink + `<link rel="stylesheet" href="${url}">\n`;
    }
  });
}

if (Array.isArray(externals)) {
  externals.forEach(({name, library, urls}) => {
    if (name && library && Array.isArray(urls) && !externalsMap[name]) {
      externalsMap[name] = library;
      externalUrlsHandle(urls);
    }
  });
}

defaultExternals.forEach(({name, library, urls}) => {
  if (!externalsMap[name]) {
    externalsMap[name] = library;
    externalUrlsHandle(urls);
  }
});

switch (config.tags) {
  case 'vue':
  case 'vue2':
    htmlScript = htmlScript + `<script src="assets/vue2.min.js"></script>
    <script>
      window.Vue ? (window.vue = window.Vue) : null;
    </script>
    <script src="assets/polyfill.vue2.js"></script>`;
    break;
  case 'vue3':
    htmlScript = htmlScript + `<script src="assets/vue3.min.js"></script>
    <script>
      window.Vue ? (window.vue = window.Vue) : null;
    </script>
    <script src="assets/polyfill.vue3.js"></script>`;
    break;
  default:
    break;
}

let webpackMergeConfig = getWebpackMergeConfig();

function getWebpackMergeConfig () {
  let webpackMergeConfig;

  const { webpackConfig } = config;

  if (webpackConfig) {
    const typeWebpackConfig = Object.prototype.toString.call(webpackConfig);
    if (typeWebpackConfig === '[object String]') {
      try {
        webpackMergeConfig = require(path.resolve(docPath, webpackConfig));
      } catch {}
    } else if (typeWebpackConfig === '[object Object]') {
      try {
        webpackMergeConfig = require(path.resolve(docPath, webpackConfig.dev));
      } catch {}
    }
  }

  if (!webpackMergeConfig) {
    for (const webpackConfigFileName of ['webpack.config.dev.js', 'webpack.config.js']) {
      try {
        webpackMergeConfig = require(path.resolve(docPath, webpackConfigFileName));
        break;
      } catch {}
    }
  }
  return webpackMergeConfig || {};
}

module.exports = {
  mode: "development",
  entry: {
    bundle: path.resolve(__dirname, "../../src/index.tsx"),
    preview: path.resolve(__dirname, "../../src/preview/index.tsx")
  },
  output: {
    path: outputPath,
    filename: "[name].js",
    libraryTarget: "umd",
    library: "[name]"
  },
  stats: {
    colors: true,
    preset: 'normal'
  },
  resolve: {
    alias: {},
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  externals: [externalsMap],
  devtool: "cheap-source-map",
  devServer: {
    open: true,
    hot: true,
    allowedHosts: "all",
    static: {
      directory: outputPath,
    },
    client: {
      logging: "warn"
    },
    proxy,
    setupMiddlewares: function (middlewares, devServer) {
      devServer && devServer.app.get('/check-dev-server', function (req, res) {
        res.json({ status: 'success', message: 'Dev server is running!', config });
      });

      return middlewares;
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react"
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
                "@babel/preset-env",
                "@babel/preset-react"
              ],
              cacheDirectory: true
            }
          },
          {
            loader: 'ts-loader',
            options: {
              silent: true,
              transpileOnly: true
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.lazy.less$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: "lazyStyleTag",
              insert: function insertIntoTarget(element, options) {
                (options.target || document.head).appendChild(element)
              },
            },
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
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              }
            }
          }
        ]
      },
      {
        test: /^(?!.*\.lazy\.less$).*\.less$/i,
        use: [
          {
            loader: "style-loader",
            options: {attributes: {title: "less"}}
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]-[hash:5]"
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
  optimization: {
    concatenateModules: false
  },
  cache: {
    type: 'filesystem',
    name: 'comlib'
  },
  plugins: [
    new WebpackBar(),
    new HtmlWebpackPlugin({
      inject: false,
      template: path.resolve(__dirname, "../../public/index.ejs"),
      templateParameters: {
        title: "MyBricks-设计器（SPA版）Demo",
        link: htmlLink,
        script: htmlScript + "<script src=\"./bundle.js\" defer></script>"
      }
    }),
    new HtmlWebpackPlugin({
      inject: false,
      filename: "preview.html",
      template: path.resolve(__dirname, "../../public/index.ejs"),
      templateParameters: {
        title: "MyBricks-设计器（SPA版）Demo",
        link: htmlLink,
        script: htmlScript + "<script src=\"./preview.js\" defer></script>"
      }
    }),
    new webpack.DefinePlugin({
      'MYBRICKS_JSON': JSON.stringify(config),
    }),
    new MybricksPluginConnectComlibApp({
      mybricksJsonPath,
      webpackConfig: webpackMergeConfig
    })
  ]
};
