const path = require('path');
const axios = require('axios');
const fse = require('fs-extra');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const { VueLoaderPlugin } = require('vue-loader')
const babelPluginAutoCssModules = require('./../babel-plugins/babel-plugin-auto-css-modules');
const getLessLoaders = require('./../utils/getLessLoader');
const { execSync } = require('child_process');
const { generateSourceCode } = require('generate-mybricks-component-library-code2');
const t = require("@babel/types");
const parser = require("@babel/parser");
const generator = require("@babel/generator");

// vue源码的key
const VUE_ORIGINCODE_KEY = 'runtime.vue';

// console.log('获取当前npm登录账号...');

// let userId;

// try {
//   userId = execSync('npm whoami').toString().trim();
// } catch {
//   throw new Error('请登录npm账号');
// }

console.log('组件编译中...');

const mybricksJsonPath = '--replace-mybricksJsonPath--';
const { components } = generateSourceCode({mybricksJsonPath}, {});
const componentsIndexMap = {};
const entry = {};
// TODO - 不仅仅是vue，所有组件都要拆除非引擎环境的runtime，目前主要是非引擎环境的单位转换
const vueEntry = {};
const mybricksJson = fse.readJSONSync(mybricksJsonPath);
const outputPath = path.resolve(__dirname, 'dist');


// const { domain, email } = mybricksJson;
// if (!domain) {
//   throw new Error('请配置domain(平台地址)...');
// }
// if (!email) {
//   throw new Error(`请正确填写 ${domain} 平台的账号...`);
// }

// let userId = email;

const getPostCssOption = ({ pxToVw, pxToRem }) => {
  if (pxToRem) {
    return {
      plugins: [
        [
          'postcss-pixel-to-remvw',
          {
            baseSize: {
              rem: 12, // 10rem = 120px
            },
          },
        ],
      ]
    };
  }

  if (pxToVw) {
    const postcssPxToViewport = require('postcss-px-to-viewport');
    return {
      plugins: [
        new postcssPxToViewport({
          unitPrecision: 13,
          viewportWidth: 375,
          selectorBlackList: ['-noPxToVw'],
        }),
      ]
    };
  }

  return {};
};

// const postCssOptions = getPostCssOption(mybricksJson);

function recursiveComponentTree (components, cb, prefix = '') {
  components.forEach((component, index) => {
    const currentPrefix = `${prefix ? `${prefix}-${index}` : index}`;
    const { components } = component;
    const hasChildComponents = Array.isArray(components);
    cb(component, currentPrefix, hasChildComponents);
    if (hasChildComponents) {
      recursiveComponentTree(components, cb, currentPrefix);
    }
  });
}

recursiveComponentTree(components, (component, prefix, hasChildComponents) => {
  if (!hasChildComponents) {
    const keyAry = [];
    Object.keys(component).forEach((key) => {
      let value = component[key];
      if (key === 'target') {
        key = 'toReact';
        value = value[key];
      }

      if (typeof value === 'string' && path.isAbsolute(value)) {
        if (value.endsWith('vue')) {
          vueEntry[`${prefix}-${key}.vue`] = value;
        }
        entry[`${prefix}-${key}`] = value;
        keyAry.push(key);
      }

      // Vue代码
      if (typeof value === 'string' && value.endsWith('vue')) {
        keyAry.push(VUE_ORIGINCODE_KEY);
      }
    });

    componentsIndexMap[prefix] = keyAry;
  }
});

const { externals } = mybricksJson;
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

// class Plugin {
//   constructor(props) {
//     this._props = props;
//   }

//   apply (compiler) {
//     compiler.hooks.done.tap("Done", async () => {
//       const finalComponents = [];
//       const finalTree = [];
//       const {
//         userId,
//         mybricksJson,
//         components, 
//         outputPath, 
//         componentsIndexMap,
//       } = this._props;

//       const { componentsSet } = this;

//       recursiveComponentTree(components, (component, prefix, hasChildComponents) => {
//         if (hasChildComponents) {
//           componentsSet(finalTree, prefix, {title: component.title, components: []});
//         } else {
//           const comJson = {...component};
//           const keyAry = componentsIndexMap[prefix];

//           // 是否是Vue组件
//           const isVueOriginCodeComponent = keyAry.includes(VUE_ORIGINCODE_KEY);
  
//           keyAry.forEach((key) => {
//             // Vue组件的特殊逻辑，runtime.vue才是vue源码，runtime始终是React的代码（Vue套壳代码）
//             if (isVueOriginCodeComponent) {
//               console.log('isVueOriginCodeComponent');
//               console.log('key: ', key);
//               if (key === VUE_ORIGINCODE_KEY) {
//                 let fileContent = `${fse.readFileSync(path.resolve(outputPath, `${prefix}-${'runtime'}.js`), 'utf-8')}return MybricksComDef.default;`;
//                 fileContent = `(function(){${fileContent}})()`;
//                 comJson[key] = fileContent;
//                 comJson.tags = ['vue2'];
//                 return;
//               }
//               if (key === 'runtime') {
//                 let fileContent = `${fse.readFileSync(path.resolve(outputPath, `${prefix}-${'runtime'}.js`), 'utf-8')}return VUEHoc(MybricksComDef.default);`;
//                 fileContent = `(function(){${fileContent}})()`;
//                 comJson[key] = fileContent;
//                 return;
//               }
//             }

//             let fileContent = `${fse.readFileSync(path.resolve(outputPath, `${prefix}-${key}.js`), 'utf-8')}return MybricksComDef.default;`;
//             // 这块处理与云组件对齐，物料中心只需处理相同逻辑，不需要判断兼容
//             if (key === 'editors') {
//               fileContent = `(function(){return function(){${fileContent}}})()`;
//             } else {
//               fileContent = `(function(){${fileContent}})()`;
//             }

//             if (key === 'toReact') {
//               comJson.target[key] = fileContent;
//             } else {
//               comJson[key] = fileContent;
//             }
//           });
//           componentsSet(finalTree, prefix, comJson.namespace);
//           finalComponents.push(comJson);
//         }
//       });

//       fse.emptyDirSync(outputPath);
//       fse.rmdirSync(outputPath);

//       console.log('编译完成，发布至物料中心...');

//       const { domain, sceneType, title, namespace } = mybricksJson;

//       console.log('请求物料中心创建物料接口')

//       await axios({
//         method: 'post',
//         url: `${domain.endsWith('/') ? domain.slice(0, -1) : domain}/api/material/create`,
//         data: {
//           userId,
//           sceneType,
//           components: finalComponents,
//           config: {
//             comlib: {
//               tree: finalTree,
//               title,
//               namespace
//             }
//           }
//         }
//       }).then(({data: { code, data, message }}) => {
//         if (code === 1) {
//           console.log('发布成功: ', JSON.stringify(data, null, 2));
//         } else {
//           throw new Error(`发布失败: ${message}`);
//         }
//       }).catch((err) => {
//         throw new Error(`发布失败: ${err.message}`);
//       });
//     });
//   }

//   componentsSet(obj, key, value) {
//     const keyAry = key.split('-');
//     let nowObj = obj;

//     keyAry.forEach((nowKey, index) => {
//       if (!nowObj[nowKey]) {
//         nowObj[nowKey] = {};
//       }
//       if (index !== keyAry.length - 1) {
//         nowObj = nowObj[nowKey].components;
//       } else {
//         nowObj[nowKey] = value;
//       }
//     });
//   }
// }

class Plugin {
  constructor(props) {
    this._props = props;

    this.init();
  }

  async init() {
    const finalComponents = [];
    const finalTree = [];
    const {
      userId,
      mybricksJson,
      components, 
      outputPath, 
      componentsIndexMap,
    } = this._props;

    const { componentsSet } = this;

    recursiveComponentTree(components, (component, prefix, hasChildComponents) => {
      if (hasChildComponents) {
        componentsSet(finalTree, prefix, {title: component.title, components: []});
      } else {
        const comJson = {...component};
        const keyAry = componentsIndexMap[prefix];

        // 是否是Vue组件
        const isVueOriginCodeComponent = keyAry.includes(VUE_ORIGINCODE_KEY);

        keyAry.forEach((key) => {
          // Vue组件的特殊逻辑，runtime.vue才是vue源码，runtime始终是React的代码（Vue套壳代码）
          if (isVueOriginCodeComponent) {
            if (key === VUE_ORIGINCODE_KEY) {
              let fileContent = `${fse.readFileSync(path.resolve(outputPath, `${prefix}-${'runtime.vue'}.js`), 'utf-8')}return MybricksComDef.default;`;
              fileContent = `(function(){${fileContent}})()`;
              comJson[key] = fileContent;
              comJson.tags = ['vue2'];
              return;
            }
            if (key === 'runtime') {
              let fileContent = `${fse.readFileSync(path.resolve(outputPath, `${prefix}-${'runtime'}.js`), 'utf-8')}return VUEHoc(MybricksComDef.default);`;
              fileContent = `(function(){${fileContent}})()`;
              comJson[key] = fileContent;
              return;
            }
          }

          let fileContent = `${fse.readFileSync(path.resolve(outputPath, `${prefix}-${key}.js`), 'utf-8')}return MybricksComDef.default;`;
          // 这块处理与云组件对齐，物料中心只需处理相同逻辑，不需要判断兼容
          if (key === 'editors') {
            fileContent = `(function(){return function(){${fileContent}}})()`;
          } else {
            fileContent = `(function(){${fileContent}})()`;
          }

          if (key === 'toReact') {
            comJson.target[key] = fileContent;
          } else {
            comJson[key] = fileContent;
          }
        });
        componentsSet(finalTree, prefix, comJson.namespace);
        finalComponents.push(comJson);
      }
    });

    fse.emptyDirSync(outputPath);
    fse.rmdirSync(outputPath);

    console.log('编译完成，发布至物料中心...');

    const { domain, sceneType, title, namespace } = mybricksJson;

    console.log('请求物料中心创建物料接口');

    await axios({
      method: 'post',
      url: `${domain.endsWith('/') ? domain.slice(0, -1) : domain}/api/material/create`,
      data: {
        userId,
        sceneType,
        components: finalComponents,
        config: {
          // comlib: {
          //   tree: finalTree,
          //   title,
          //   namespace
          // }
        }
      }
    }).then(({data: { code, data, message }}) => {
      if (code === 1) {
        console.log('发布成功: ', JSON.stringify(data, null, 2));
      } else {
        throw new Error(`发布失败: ${message}`);
      }
    }).catch((err) => {
      throw new Error(`发布失败: ${err.message}`);
    });
  }

  componentsSet(obj, key, value) {
    const keyAry = key.split('-');
    let nowObj = obj;

    keyAry.forEach((nowKey, index) => {
      if (!nowObj[nowKey]) {
        nowObj[nowKey] = {};
      }
      if (index !== keyAry.length - 1) {
        nowObj = nowObj[nowKey].components;
      } else {
        nowObj[nowKey] = value;
      }
    });
  }
}

process.stdin.setEncoding('utf8');

function getInput(tips) {
  console.log(tips);
  return new Promise(resolve => {
    process.stdin.once('data', data => {
      resolve(data.trim());
    });
  });
}

async function build() {
  let userId;

  async function checkOnlineInfo () {
    const pushNewObjectPropertys = [];

    if (!mybricksJson.domain) {
      const domain = await getInput('请输入平台地址...');
      mybricksJson.domain = domain;
      pushNewObjectPropertys.push({
        key: 'domain',
        value: domain
      });
    }
    // email兼容老的，后续使用userName
    if (!mybricksJson.email && !mybricksJson.userName) {
      const userName = await getInput(`请正确填写 ${mybricksJson.domain} 平台的账号...`);
      mybricksJson.userName = userName;
      pushNewObjectPropertys.push({
        key: 'userName',
        value: userName
      });
    }

    if (pushNewObjectPropertys.length) {
      const mybricksJsonStr = `(${fse.readFileSync(mybricksJsonPath, 'utf-8')})`;
      const ast = parser.parse(mybricksJsonStr, {
        sourceType: "module",
      });
      const properties = ast.program.body[0].expression.properties;
      pushNewObjectPropertys.forEach(({key, value}) => {
        const propertie = properties.find((obj) => obj.key.value === key);
        if (propertie) {
          propertie.value.value = value;
        } else {
          properties.push(t.objectProperty(
            t.identifier(`"${key}"`),
            t.stringLiteral(value)
          ));
        }
      });

      let modifiedJsonStr = generator.default(ast).code;
      modifiedJsonStr = modifiedJsonStr.slice(1, modifiedJsonStr.length-2);

      fse.writeFileSync(mybricksJsonPath, modifiedJsonStr, 'utf-8');
    }

    userId = mybricksJson.userName || mybricksJson.email;
  }

  await checkOnlineInfo();
  await Promise.all([
    new Promise((resolve, reject) => {
      webpack(getConfig({ entry, postCssOptions: getPostCssOption({}) }), (err, stats) => {
        if (err || stats.hasErrors()) {
          console.error(err || stats);
          reject(err || stats);
        }
        resolve();
      });
    }),
    new Promise((resolve, reject) => {
      webpack(getConfig({ entry: vueEntry, postCssOptions: getPostCssOption(mybricksJson) }), (err, stats) => {
        if (err || stats.hasErrors()) {
          console.error(err || stats);
          reject(err || stats);
        }
        resolve();
      });
    })
  ]);
  
  new Plugin({
    userId,
    mybricksJson,
    outputPath,
    components,
    componentsIndexMap
  });
}

build();


function getConfig({ entry, postCssOptions }) {
  return {
    mode: 'production',
    entry,
    output: {
      path: outputPath,
      filename: '[name].js',
      libraryTarget: 'umd',
      library: 'MybricksComDef'
    },
    resolve: {
      alias: {},
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    externals: [externalsMap],
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
                  transpileOnly: true,
              },
            },
          ]
        },
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: postCssOptions,
              },
            },
          ],
          sideEffects: true
        },
        ...getLessLoaders({ postCssOptions }),
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
      new VueLoaderPlugin(),
      // new Plugin({
      //   userId,
      //   mybricksJson,
      //   outputPath,
      //   components,
      //   componentsIndexMap
      // })
    ]
  };
}


// module.exports = {
//   mode: 'production',
//   entry,
//   output: {
//     path: outputPath,
//     filename: '[name].js',
//     libraryTarget: 'umd',
//     library: 'MybricksComDef'
//   },
//   resolve: {
//     alias: {},
//     extensions: ['.js', '.jsx', '.ts', '.tsx'],
//   },
//   externals: [externalsMap],
//   // devtool: 'source-map',
//   module: {
//     rules: [
//       {
//         test: /\.vue$/,
//         loader: 'vue-loader',
//         options: {
//           hotReload: false,
//         },
//       },
//       {
//         test: /\.jsx?$/,
//         use: [
//           {
//             loader: 'babel-loader',
//             options: {
//               presets: [
//                 '@babel/preset-react'
//               ],
//               plugins: [
//                 ['@babel/plugin-proposal-class-properties', {'loose': true}],
//                 [babelPluginAutoCssModules]
//               ],
//               cacheDirectory: true
//             }
//           }
//         ]
//       },
//       {
//         test: /\.tsx?$/,
//         use: [
//           {
//             loader: 'babel-loader',
//             options: {
//               presets: [
//                 '@babel/preset-react'
//               ],
//               plugins: [
//                 ['@babel/plugin-proposal-class-properties', {'loose': true}],
//                 [babelPluginAutoCssModules]
//               ],
//               cacheDirectory: true
//             }
//           },
//           {
//             loader: 'ts-loader',
//             options: {
//                 silent: true,
//                 transpileOnly: true,
//             },
//           },
//         ]
//       },
//       {
//         test: /\.css$/i,
//         use: [
//           'style-loader',
//           'css-loader',
//           {
//             loader: 'postcss-loader',
//             options: {
//               postcssOptions: postCssOptions,
//             },
//           },
//         ],
//         sideEffects: true
//       },
//       // {
//       //   test: /\.less$/i,
//       //   use: [
//       //     {
//       //       loader: 'style-loader',
//       //       options: {attributes: {title: 'less'}}
//       //     },
//       //     {
//       //       loader: 'css-loader',
//       //       options: {
//       //         modules: {
//       //           localIdentName: '[local]-[hash:5]'
//       //         }
//       //       }
//       //     },
//       //     {
//       //       loader: 'postcss-loader',
//       //       options: {
//       //         postcssOptions: postCssOptions,
//       //       },
//       //     },
//       //     {
//       //       loader: 'less-loader',
//       //       options: {
//       //         lessOptions: {
//       //           javascriptEnabled: true
//       //         },
//       //       },
//       //     }
//       //   ],
//       //   exclude: /node_modules/
//       // },
//       // {
//       //   test: /\.less$/i,
//       //   use: [
//       //     {
//       //       loader: 'style-loader',
//       //       options: {attributes: {title: 'less'}}
//       //     },
//       //     {
//       //       loader: 'css-loader',
//       //       options: {
//       //         modules: {
//       //           localIdentName: '[local]'
//       //         }
//       //       }
//       //     },
//       //     {
//       //       loader: 'postcss-loader',
//       //       options: {
//       //         postcssOptions: postCssOptions,
//       //       },
//       //     },
//       //     {
//       //       loader: 'less-loader',
//       //       options: {
//       //         lessOptions: {
//       //           javascriptEnabled: true
//       //         },
//       //       },
//       //     }
//       //   ],
//       //   include: /node_modules/
//       // },
//       ...getLessLoaders({ postCssOptions }),
//       {
//         test: /\.(gif|png|jpe?g|webp|svg|woff|woff2|eot|ttf)$/i,
//         use: [
//           {
//             loader: 'url-loader',
//             options: {
//               limit: 1024 * 2,
//               name: 'img_[name]_[contenthash:4].[ext]'
//             }
//           }
//         ]
//       },
//       {
//         test: /\.d.ts$/i,
//         use: [{ loader: 'raw-loader' }]
//       },
//       {
//         test: /\.(xml|txt|html|cjs|theme)$/i,
//         use: [{ loader: 'raw-loader' }]
//       }
//     ]
//   },
//   plugins: [
//     new WebpackBar(),
//     new VueLoaderPlugin(),
//     new Plugin({
//       userId,
//       mybricksJson,
//       outputPath,
//       components,
//       componentsIndexMap
//     })
//   ]
// };
