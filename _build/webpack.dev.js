const fs = require('fs')
const path = require('../../src/path');

const webpack = require('webpack')

//const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ignoreWarningPlugin = require('../ignoreWarningPlugin')

const cfg = require('./config.json')

const entryCfg = cfg.entry
const outputPath = cfg.output

const devPort = cfg.devPort

//console.log(path.resolve(globalConfg.tempPath, './entryRt.js'))

module.exports = {
  mode: 'development',//设置mode
  //mode:'production',
  entry: entryCfg,
  output: {
    path: outputPath,
    filename: './js/[name].js',
    libraryTarget: 'umd',
    library: '[name]'
  },
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
  },
  resolve: {
    alias: {},
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  externals: [{
    'lodash': {
      commonjs: "lodash",
      commonjs2: "lodash",
      amd: "lodash",
      root: "_"
    },
    // '@mybricks/rxui': 'rxui',
    'react': {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "React"
    },
    'react-dom': {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "react-dom",
      root: "ReactDOM"
    },
    moment: 'moment',
    '@ant-design/icons': 'icons',
    '@ant-design/charts': 'charts'
  }],
  devtool: 'cheap-source-map',//devtool: 'cheap-source-map',
  devServer: {
    static: {
      directory: outputPath,
    },
    port: devPort,
    host: '0.0.0.0',
    // compress: true,
    // hot: true,
    client: {
      logging: 'warn',
      // overlay: true,
      // progress: true,
    },
    //contentBase: outputPath,

    //disableHostCheck: true,
    //Zprogress: true,
    //inline: true,
    //overlay: true,
    // quiet: true,
    //useLocalIp: true,
    // open:true,
    proxy: []
  },
  module: {
    rules: [
      // {
      //   test: /\.jsx?$/,
      //   use: [
      //     {
      //       loader: 'babel-loader',
      //       options: {
      //         presets: [
      //           '@babel/preset-react'
      //         ],
      //         plugins: [
      //           ['@babel/plugin-proposal-class-properties', {'loose': true}]
      //         ],
      //         cacheDirectory: true
      //       }
      //     }
      //   ]
      // },
      {
        test: /\.tsx?$/,
        //include: [pathSrc, testSrc],
        use: [
          // {
          //   loader: './config/test-loader'
          // },
          // {
          //   loader: 'babel-loader',
          //   options: {
          //     presets: [
          //       '@babel/preset-react'
          //     ],
          //     plugins: [
          //       ['@babel/plugin-proposal-class-properties', {'loose': true}]
          //     ],
          //     cacheDirectory: true
          //   }
          // },
          {
            loader: 'ts-loader',
            options: {
              silent: true,
              transpileOnly: true,
              compilerOptions: {
                module: 'es6',
                target: 'es6'
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        // exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      },
      // {
      //   test: /\.nmd(?=\.less)$/gi,
      //   use: ['style-loader', 'css-loader', 'less-loader']
      // },
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
        test: /^[^\.]+\.less$/i,
        use: [
          {
            loader: 'style-loader',
            options: {injectType: "singletonStyleTag"},
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
            },
          }
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              // 100Kb
              limit: 1024 * 100,
              name: 'img_[name]_[contenthash:4].[ext]'
            }
          }
        ]
      },
      // {
      //   test: /\.(gif|png|jpe?g|svg)$/i,
      //   use: [
      //     'file-loader',
      //     {
      //       loader: 'image-webpack-loader',
      //       options: {
      //         mozjpeg: {
      //           progressive: true,
      //         },
      //         // optipng.enabled: false will disable optipng
      //         optipng: {
      //           enabled: false,
      //         },
      //         pngquant: {
      //           quality: [0.65, 0.90],
      //           speed: 4
      //         },
      //         gifsicle: {
      //           interlaced: false,
      //         },
      //         // the webp option will enable WEBP
      //         webp: {
      //           quality: 75
      //         }
      //       }
      //     },
      //   ],
      // },
      // {
      //   test: /\.svg$/i,
      //   use: [
      //     {loader: 'raw-loader'}
      //   ]
      // },
      // {
      //   test: /\.vue$/i,
      //   use: [
      //     {loader: 'vue-loader'}
      //   ]
      // },
      {
        test: /\.d.ts$/i,
        use: [
          {loader: 'raw-loader'}
        ]
      },
      {
        test: /\.(xml|txt|html|cjs|theme)$/i,
        use: [
          {loader: 'raw-loader'}
        ]
      }
    ]
  },
  optimization: {
    concatenateModules: false//name_name
  },
  plugins: [
    new ignoreWarningPlugin(),   // All warnings will be ignored
    //new VueLoaderPlugin(),
    //new BundleAnalyzerPlugin()
    // new FriendlyErrorsWebpackPlugin({
    //   compilationSuccessInfo: {
    //     messages: [`Stark is running,open : http://${getIPAdress()}:${globalConfg.port}`]
    //   },
    //   clearConsole: true,
    // }),
    //new BundleAnalyzerPlugin(),//包大小分析
  ]

}