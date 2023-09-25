const os = require('os')
const fs = require('fs')
const path = require('path')
const Webpack = require('webpack')
const portfinder = require('portfinder')
const WebpackDevServer = require('webpack-dev-server')
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin')
const generateMybricksComponentLibraryCode = require('generate-mybricks-component-library-code')
const { VueLoaderPlugin } = require('vue-loader');
const babelPluginAutoCssModules = require('./plugins/babel-plugin-auto-css-modules');
const getLessLoaders = require('./utils/getLessLoader');

const {
  IS,
  uuid
} = require('./utils')
const Dev = require('./plugins/dev')

const pluginName = 'mybricks-plugin-connect-comlib-app'
const tmpDir = os.tmpdir()
const tmpFiles = fs.readdirSync(tmpDir)

let pluginTmpDir = tmpFiles.find((tmpFile) => {
  return tmpFile.startsWith(pluginName)
})

if (!pluginTmpDir) {
  pluginTmpDir = fs.mkdtempSync(path.join(tmpDir, pluginName + '_'))
} else {
  pluginTmpDir = path.join(tmpDir, pluginTmpDir)
}

const _templateAssetRegExp = ext => new RegExp(`(.+?)\\.${ext}$`, 'i')
const templateAssetRegExp = _templateAssetRegExp('html')

module.exports = class MybricksPluginConnectComlibApp {
  options = []
  componentLibraryUrls = new Set()

  constructor(options = []) {
    options = this.transformOptions(options)

    const finalOptions = options.filter((option) => {
      if (!option) return false

      const { mybricksJsonPath } = option
      let mybricksJson
      
      try {
        mybricksJson = JSON.parse(fs.readFileSync(mybricksJsonPath, 'utf-8'))
        option.mybricksJson = mybricksJson
        option.rootDirPath = path.join(mybricksJsonPath, '../')
      } catch {}
      
      if (mybricksJson) {

        let packageJson = {}

        try {
          packageJson = JSON.parse(fs.readFileSync(path.join(mybricksJsonPath, '../package.json'), 'utf-8'))
        } catch {}
    
        if (!IS.isString(option.id)) {
          option.id = packageJson.name || uuid()
        }
        if (!IS.isString(option.name)) {
          option.name = packageJson.description || ('组件库 ' + option.id)
        }
        if (!IS.isString(option.version)) {
          option.version = packageJson.version || '1.0.0'
        }
        
        return true
      }
      
      console.error(JSON.stringify(option, null, 2), '请正确配置 mybricksJsonPath(组件库*.mybricks.json绝对路径)')
      return false
    })

    if (!finalOptions.length) {
      this.configError()
    }

    this.options = finalOptions

    portfinder.getPorts(finalOptions.length, {
      port: 20000
    }, (err, ports) => {
      if (err) {
        throw new Error(err)
      }
      Promise.all(finalOptions.map(async (option, index) => {
        return await this.startServer(option, ports[index])
      })).then((urls) => {
        urls.forEach((url) => {
          this.componentLibraryUrls.add(url)
        })

        this.ready = true
      })
    })
  }

  apply(compiler) {
    const that = this
    compiler.hooks.compilation.tap('MybricksPluginConnectComlibApp', (compilation) => {
      if (this.ready) {
        Done()
      } else {
        let time = setInterval(() => {
          if (this.ready) {
            clearInterval(time)
            time = null
            Done()
          }
        }, 500)
      }

      function Done() {
        compilation.hooks.afterProcessAssets.tap('MybricksPluginConnectComlibAppEmit', (assets) => {
          const assetsNames = Object.keys(assets)

          if (assetsNames.length) {
            let lookupAssetName

            assetsNames.forEach((assetsName) => {
              if (templateAssetRegExp.test(assetsName)) {
                lookupAssetName = assetsName
                let lookupAssetSource = assets[lookupAssetName].source()

                compilation.updateAsset(assetsName, new Webpack.sources.RawSource(that.replaceHtmlScripts(lookupAssetSource)))
              }
            })

            if (!lookupAssetName) {
              const assetsDirs = fs.readdirSync(compilation.outputOptions.path)

              assetsDirs.forEach((file) => {
                if (templateAssetRegExp.test(file)) {
                  let lookupAssetSource = fs.readFileSync(path.resolve(compilation.outputOptions.path, `./${file}`), 'utf-8')

                  compilation.fileDependencies.add(path.resolve(compilation.outputOptions.path, file))
                  compilation.emitAsset(file, new Webpack.sources.RawSource(that.replaceHtmlScripts(lookupAssetSource)))
                }
              }) 
            }
          }
        })
      }
    })
  }

  transformOptions(options) {
    let bool = false

    switch (true) {
      case IS.isObject(options):
        const { path, mybricksJsonPath } = options

        if (IS.isString(mybricksJsonPath)) {
          bool = true
          options = [options]
        } else if (IS.isString(path)) {
          options.mybricksJsonPath = path
          bool = true
          options = [options]
        }

        break
      case IS.isArray(options):
        bool = true
        break
      default:
        break
    }

    if (bool) {
      return options
    }

    this.configError()
  }

  replaceHtmlScripts(htmlContent) {
    return htmlContent.replace('</body>', Array.from(this.componentLibraryUrls).reduce((c, s) => {
      return `\n<script src="${s}"></script>` + c
    }, '\n</body>'))
  }

  startServer(option, port) {
    return new Promise((resolve) => {
      const { id, mybricksJson, mybricksJsonPath, alias = {} } = option
      const { editCode, runtimeCode, components } = generateMybricksComponentLibraryCode(
        option,
        {
          useTestComponentLibrary: true,
          collectionStyleTags: true
        }
      );
      const editCodePath = path.join(pluginTmpDir, id.replace(/@|\//gi, '_') + '.js')
  
      fs.writeFileSync(editCodePath, editCode)
  
      const extraWatchFiles = components.map(({comJsonPath}) => comJsonPath).concat(mybricksJsonPath)
      const externalsMap = {
        'react': {
          commonjs: 'react',
          commonjs2: 'react',
          amd: 'react',
          root: 'React',
        },
        'react-dom': {
          commonjs: 'react-dom',
          commonjs2: 'react-dom',
          amd: 'react-dom',
          root: 'ReactDOM',
        },
        vue: {
          commonjs: 'vue',
          commonjs2: 'vue',
          amd: 'vue',
          root: 'Vue'
        },
      }
  
      if (IS.isArray(mybricksJson.externals)) {
        mybricksJson.externals.forEach(({name, library}) => {
          externalsMap[name] = library
        })
      }

      const webpackConfig = {
        mode: 'development',
        entry: editCodePath,
        output: {
          filename: 'comlib.js',
          libraryTarget: 'umd',
          // library: 'comlib'
          library: id
        },
        stats: {
          colors: true,
          preset: 'normal'
        },
        resolve: {
          /**
           * TODO
           * 可开放哪些webpack配置
           */
          alias,
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        externals: [externalsMap],
        module: {
          rules: [
            {
              test: /\.vue$/,
              loader: 'vue-loader',
            },
            {
              test: /\.jsx?$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    presets: [
                      '@babel/preset-react'
                    ],
                    plugins: [
                      ['@babel/plugin-proposal-class-properties', {'loose': true}],
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
                  loader: 'babel-loader',
                  options: {
                    presets: [
                      '@babel/preset-react'
                    ],
                    plugins: [
                      ['@babel/plugin-proposal-class-properties', {'loose': true}],
                      [babelPluginAutoCssModules]
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
              test: /\.css$/i,
              use: ['style-loader', 'css-loader'],
              sideEffects: true
            },
            // {
            //   test: /\.less$/i,
            //   use: [
            //     {
            //       loader: 'style-loader',
            //       options: {attributes: {title: 'less'}}
            //     },
            //     {
            //       loader: 'css-loader',
            //       options: {
            //         modules: {
            //           localIdentName: '[local]-[hash:5]'
            //         }
            //       }
            //     },
            //     {
            //       loader: "less-loader",
            //       options: {
            //         lessOptions: {
            //           javascriptEnabled: true
            //         },
            //       },
            //     }
            //   ],
            //   exclude: /node_modules/
            // },
            // {
            //   test: /\.less$/i,
            //   use: [
            //     {
            //       loader: 'style-loader',
            //       options: {attributes: {title: 'less'}}
            //     },
            //     {
            //       loader: 'css-loader',
            //       options: {
            //         modules: {
            //           localIdentName: '[local]'
            //         }
            //       }
            //     },
            //     {
            //       loader: "less-loader",
            //       options: {
            //         lessOptions: {
            //           javascriptEnabled: true
            //         },
            //       },
            //     }
            //   ],
            //   include: /node_modules/
            // },
            ...getLessLoaders({ postCssOptions: {} }),
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
        devtool: 'cheap-source-map',
        devServer: {
          hot: true,
          allowedHosts: 'all',
          client: {
            overlay: false
          },
          proxy: [],
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
                "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers":
                "X-Requested-With, content-type, Authorization",
          },
        },
        optimization: {
          concatenateModules: false
        },
        // cache: {
        //   type: 'filesystem',
        //   name: id
        // },
        plugins: [
          new VueLoaderPlugin(),
          new Dev({
            editCodePath,
            extraWatchFiles,
            option
          }),
          new ExtraWatchWebpackPlugin({
            files: extraWatchFiles
          }),
        ]
      }
      const compiler = Webpack(webpackConfig);
      const devServerOptions = { ...webpackConfig.devServer, port};
      const server = new WebpackDevServer(devServerOptions, compiler);
  
      server.startCallback(() => {
        resolve(`http://localhost:${port}/comlib.js`)
      });
    })
  }

  configError() {
    throw new Error(
      '请正确配置插件信息(mybricksJsonPath为必填项)\n' + 
      '例:\n' + 
      JSON.stringify([{
        mybricksJsonPath: 'xxx/xx/mybricks.json'
      }], null, 2)
    )
  }
}
