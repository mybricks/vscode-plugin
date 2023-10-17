const path = require('path');
const JSZip = require('jszip');
const axios = require('axios');
const fse = require('fs-extra');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const generateMybricksComponentLibraryCode = require('generate-mybricks-component-library-code');
const { getOnlineInfo, getDistInfo } = require("../utils");
// 组件库根目录
const docPath = '--replace-docPath--';
// 配置文件
const configName = '--replace-configName--';
// 发布方式 dist - 本地， material - 物料中心（区别就是是否上传物料中心）
const publishType = '--publish-type--';
const mybricksJsonPath = path.join(docPath, configName);
const mybricksJson = fse.readJSONSync(mybricksJsonPath);
const packageJson = fse.readJSONSync(path.join(docPath, "./package.json"));

async function build() {
  let finalConfig;
  const isPublishToDist = publishType === 'dist';
  if (!isPublishToDist) {
    console.log('发布至物料中心');
    finalConfig = await getOnlineInfo({configPath: mybricksJsonPath});
  } else {
    console.log('保存至本地dist文件夹');
    finalConfig = await getDistInfo({configPath: mybricksJsonPath});
  }
  const { editCode, runtimeCode, components } = generateMybricksComponentLibraryCode(
    {
      id: packageJson.name,
      name: packageJson.description,
      version: packageJson.version,
      mybricksJsonPath: path.join(docPath, configName),
    },
    {
      useTestComponentLibrary: false,
      collectionStyleTags: true
    }
  );
  const compileProductFolderPath = path.resolve(__dirname, `compile${String(Math.random()).replace('\.', '_')}`);
  fse.mkdirSync(compileProductFolderPath);
  const { externals } = mybricksJson;
  const externalsMap = {
    'react': 'React',
    'react-dom': 'ReactDOM',
  };
  if (Array.isArray(externals)) {
    externals.forEach(({name, library, urls}) => {
      if (name && library && Array.isArray(urls)) {
        externalsMap[name] = library;
      }
    });
  }
  const editCodePath = path.resolve(compileProductFolderPath, 'edit.js');
  fse.writeFileSync(editCodePath, editCode, 'utf-8');
  const rtCodePath = path.resolve(compileProductFolderPath, 'rt.js');
  fse.writeFileSync(rtCodePath, runtimeCode, 'utf-8');

  await Promise.all([
    new Promise((resolve, reject) => {
      webpack(getWebpckConfig({ entry: { 'edit': editCodePath }, outputPath: compileProductFolderPath, externals: [externalsMap] }), (err, stats) => {
        if (err || stats.hasErrors()) {
          console.error(err || stats.compilation.errors);
          reject(err || stats);
        }
        resolve();
      });
    }),
    new Promise((resolve, reject) => {
      const entry = components.reduce((f, s) => {
        f[s.namespace] = s.runtime;
        return f;
      }, {});
      webpack(getWebpckConfig({ entry: { 'rt': rtCodePath, ...entry }, outputPath: compileProductFolderPath, externals: [externalsMap] }), (err, stats) => {
        if (err || stats.hasErrors()) {
          console.error(err || stats.compilation.errors);
          reject(err || stats);
        }
        resolve();
      });
    })
  ]);

  const runtimeComponentsMap = {};
  components.forEach(({ version, namespace }) => {
    const componentJsPath = path.resolve(compileProductFolderPath, `${namespace}.js`);
    runtimeComponentsMap[`${namespace}@${version}`] = {
      runtime: encodeURIComponent(fse.readFileSync(componentJsPath, 'utf-8')),
      version
    };
    if (isPublishToDist) {
      fse.unlinkSync(componentJsPath);
    }
  });
  const runtimeComponentsMapString = JSON.stringify(runtimeComponentsMap);

  if (isPublishToDist) {
    const docDistDirPath = path.join(docPath, 'dist');
    if (!fse.existsSync(docDistDirPath)) {
      fse.mkdirSync(docDistDirPath);
    }
    fse.copySync(compileProductFolderPath, docDistDirPath);
    fse.writeFileSync(path.resolve(docDistDirPath, 'rtCom.js'), runtimeComponentsMapString, 'utf-8');

    const zip = new JSZip();
    const userName = mybricksJson.userName;
    const time = new Date().getTime();
    zip.file('组件库.material@mybricks.json', JSON.stringify({
      type: "material",
      material: {
        name: packageJson.description,
        namespace: mybricksJson.namespace,
        // TODO: 这里是场景信息，不应该传1，和中心化一起改造
        scene: 1,
        type: 'com_lib',
        creatorName: userName,
        creatorId: userName,
        createTime: time,
        updateTime: time,
        updatorId: userName,
        updatorName: userName
      },
      materialPub: {
        content: JSON.stringify({
          rtJs: './resource/rt.js',
          editJs: './resource/edit.js',
          coms: './resource/rtCom.js'
        }),
        version: packageJson.version,
        creatorName: userName,
        creatorId: userName,
        createTime: time,
        updateTime: time,
        updatorId: userName,
        updatorName: userName
      }
    }));
    zip.file('./resource/rt.js', fse.readFileSync(rtCodePath, 'utf-8'));
    zip.file('./resource/edit.js', fse.readFileSync(editCodePath, 'utf-8'));
    zip.file('./resource/rtCom.js', runtimeComponentsMapString);

    const content = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9
      }
    });
    fse.writeFileSync(path.resolve(docDistDirPath, '物料.zip'), content, 'utf-8');
    console.log(`\x1b[0m编译产物已保存至本地文件:\n \x1b[0meidt.js: \x1b[32m${path.resolve(docDistDirPath, 'edit.js')}\n   \x1b[0mrt.js: \x1b[32m${path.resolve(docDistDirPath, 'rt.js')}\n\x1b[0mrtCom.js: \x1b[32m${path.resolve(docDistDirPath, 'rtCom.js')}`);
  } else {
    console.log('开始上传物料中心...');
    const { domain, userName } = finalConfig;
    await axios({
      method: 'post',
      url: `${domain.endsWith('/') ? domain.slice(0, -1) : domain}/api/material/vsc/createComlib`,
      data: {
        userId: userName,
        editCode: fse.readFileSync(editCodePath, 'utf-8'),
        runtimeCode: fse.readFileSync(rtCodePath, 'utf-8'),
        runtimeComponentsMapCode: runtimeComponentsMapString,
        version: packageJson.version,
        namespace: mybricksJson.namespace,
        tags: ['react'],
        title: packageJson.description
      }
    }).then(({data: { code, data, message }}) => {
      if (code === 1) {
        console.log('发布成功: ', JSON.stringify(data, null, 2));
      } else {
        console.error(`发布失败: ${message}`);
      }
    }).catch((err) => {
      console.error(`发布失败: ${err.message}`);
    });
  }

  fse.remove(__filename);
  fse.remove(compileProductFolderPath);
}

build();

function getWebpckConfig({ entry, outputPath, externals = [] }) {
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
    externals,
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
    ]
  };
}
