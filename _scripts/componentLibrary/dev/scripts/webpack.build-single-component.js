const path = require('path');
const axios = require('axios');
const fse = require('fs-extra');
const WebpackBar = require('webpackbar');
const { execSync } = require('child_process');
const { generateSourceCode } = require('generate-mybricks-component-library-code');

console.log('获取当前npm登录账号...');

let userId;

try {
  userId = execSync('npm whoami').toString().trim();
} catch {
  throw new Error('请登录npm账号');
}

console.log('组件编译中...');

const { mybricksJsonPath } = process.env;
const { components } = generateSourceCode({mybricksJsonPath}, {});
const componentsIndexMap = {};
const entry = {};
const mybricksJson = fse.readJSONSync(mybricksJsonPath);
const outputPath = path.resolve(__dirname, 'dist');


const { domain } = mybricksJson;
if (!domain) {
  throw new Error('请配置domain(平台地址)...');
}

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
        
        entry[`${prefix}-${key}`] = value;
        keyAry.push(key);
      }
    });

    componentsIndexMap[prefix] = keyAry;
  }
});

const { externals } = mybricksJson;
const externalsMap = {
  'react': 'React',
  'react-dom': 'ReactDOM'
};

if (Array.isArray(externals)) {
  externals.forEach(({name, library, urls}) => {
    if (name && library && Array.isArray(urls)) {
      externalsMap[name] = library;
    }
  });
}

class Plugin {
  constructor(props) {
    this._props = props;
  }

  apply (compiler) {
    compiler.hooks.done.tap("Done", async () => {
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
  
          keyAry.forEach((key) => {
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

      await axios({
        method: 'post',
        url: `${domain.endsWith('/') ? domain.slice(0, -1) : domain}/api/material/create`,
        data: {
          userId,
          sceneType,
          components: finalComponents,
          config: {
            comlib: {
              tree: finalTree,
              title,
              namespace
            }
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

module.exports = {
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
  // devtool: 'source-map',
  module: {
    rules: [
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
                ['@babel/plugin-proposal-class-properties', {'loose': true}]
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
                ['@babel/plugin-proposal-class-properties', {'loose': true}]
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
            loader: 'less-loader',
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
            loader: 'style-loader',
            options: {attributes: {title: 'less'}}
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]'
              }
            }
          },
          {
            loader: 'less-loader',
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
    new Plugin({
      userId,
      mybricksJson,
      outputPath,
      components,
      componentsIndexMap
    })
  ]
};
