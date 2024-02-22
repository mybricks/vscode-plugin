const path = require('path');
const JSZip = require('jszip');
const axios = require('axios');
const fse = require('fs-extra');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const { merge } = require('webpack-merge');
// const { VueLoaderPlugin } = require('vue-loader');
const generateMybricksComponentLibraryCode = require('generate-mybricks-component-library-code');
const { getOnlineInfo, getDistInfo, getLessLoaders, getCentralInfo, getCurrentTimeYYYYMMDDHHhhmmss, uploadToOSS, publishToCentral, getGitEmail } = require("../utils");
const babelPluginAutoCssModules = require('../../scripts/babel-plugins/babel-plugin-auto-css-modules');
// 组件库根目录
const docPath = '--replace-docPath--';
// 配置文件
const configName = '--replace-configName--';
// 发布方式 dist - 本地， material - 物料中心（区别就是是否上传物料中心）
const publishType = '--publish-type--';
const mybricksJsonPath = path.join(docPath, configName);
const mybricksJson = fse.readJSONSync(mybricksJsonPath);
const packageJson = fse.readJSONSync(path.join(docPath, "./package.json"));

function getPostCssOption ({ pxToVw, pxToRem }) {
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

async function build() {
  let webpackMergeConfig = getWebpackMergeConfig();
  let finalConfig;
  const isPublishToDist = publishType === 'dist';
  const isPublishToCentral = publishType === 'central';
  if (isPublishToCentral) {
    console.log("发布至中心化");
    finalConfig = await getCentralInfo({configPath: mybricksJsonPath});
  } else if (!isPublishToDist) {
    console.log("发布至物料中心");
    finalConfig = await getOnlineInfo({configPath: mybricksJsonPath});
  } else {
    console.log('保存至本地dist文件夹');
    finalConfig = await getDistInfo({configPath: mybricksJsonPath});
  }

  const sceneInfo = ['H5', 'KH5'].includes(mybricksJson?.componentType) ? {
    title: 'H5',
    type: 'H5',
  } : {
    title: 'PC中后台',
    type: 'PC',
  };
  
  const { editCode, runtimeCode, components } = generateMybricksComponentLibraryCode(
    {
      id: packageJson.name,
      name: finalConfig.name || packageJson.description,
      version: finalConfig.version || packageJson.version,
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
    'vue': 'vue',
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
      webpack(getWebpckConfig({ entry: { 'edit': editCodePath }, outputPath: compileProductFolderPath, externals: [externalsMap], postCssOptions: getPostCssOption({}) }, webpackMergeConfig), (err, stats) => {
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
      webpack(getWebpckConfig({ entry: { 'rt': rtCodePath, ...entry }, outputPath: compileProductFolderPath, externals: [externalsMap], postCssOptions: getPostCssOption(mybricksJson) }, webpackMergeConfig), (err, stats) => {
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
    const userName = finalConfig.userName;
    const time = new Date().getTime();

    zip.file('组件库.material@mybricks.json', JSON.stringify({
      type: "material",
      material: {
        name: finalConfig.name || packageJson.description,
        namespace: finalConfig.namespace,
        // TODO: 这里是场景信息，不应该传1，和中心化一起改造
        sceneInfo,
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
        version: finalConfig.version || packageJson.version,
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
    const { domain, userName, tags } = finalConfig;

    let tag = tags === 'vue3' ? 'vue3' : 'vue2';

    if (isPublishToCentral) {
      console.log('开始上传中心化...');
      console.log("上传edit.js、rt.js、rtCom.js...");
      const time = getCurrentTimeYYYYMMDDHHhhmmss();
      const [editJs, rtJs, coms] = await Promise.all([
        await uploadToOSS({content: fse.readFileSync(editCodePath, 'utf-8'), folderPath: `comlibs/${finalConfig.namespace}/${finalConfig.version || packageJson.version}/${time}`, fileName: 'edit.js', noHash: true}),
        await uploadToOSS({content: fse.readFileSync(rtCodePath, 'utf-8'), folderPath: `comlibs/${finalConfig.namespace}/${finalConfig.version || packageJson.version}/${time}`, fileName: 'rt.js', noHash: true}),
        await uploadToOSS({content: runtimeComponentsMapString, folderPath: `comlibs/${finalConfig.namespace}/${finalConfig.version || packageJson.version}/${time}`, fileName: 'rtCom.js', noHash: true})
      ]);

      console.log("组件库资源地址: ", { editJs, rtJs, coms });

      let userId = 'Mybricks';

      try {
        const email = getGitEmail({ docPath });
        if (email) {
          userId = email;
          console.log(`当前 Git 邮箱: ${email}`);
        } else {
          console.log('未配置 Git 邮箱，userId 默认为 Mybricks');
        }
      } catch (error) {
        console.error('获取 Git 邮箱失败，userId默认为Mybricks: ', error);
      }

      // TODO: 单组件rt和edit都需要打包

      // const chunkSize = 3;
      // const chunks = [];

      // for (let i = 0; i < componentsArray.length; i += chunkSize) {
      //   chunks.push(componentsArray.slice(i, i + chunkSize));
      // }

      // async function uploadChunks(chunks) {
      //   const chunk = chunks.pop();
      //   if (chunk) {
      //     await Promise.all(chunk.map(async (content) => {
      //       await publishToCentral({
      //         sceneType: sceneInfo.type,
      //         name: content.title,
      //         content: JSON.stringify(content),
      //         tags: ['vue2'],
      //         namespace: content.namespace,
      //         version: content.version,
      //         description: content.description,
      //         type: 'component',
      //         icon: content.icon,
      //         previewImg: content.preview,
      //         creatorName: userId,
      //         creatorId: userId
      //       });
      //     }));
      //     await uploadChunks(chunks);
      //   }
      // }

      // await uploadChunks(chunks);

      // 上传组件库
      await publishToCentral({
        sceneType: sceneInfo.type,
        name: finalConfig.name || packageJson.description,
        content: JSON.stringify({ editJs, rtJs, coms }),
        tags: [tag],
        namespace: finalConfig.namespace,
        version: finalConfig.version || packageJson.version,
        // description,
        type: 'com_lib',
        // icon,
        // previewImg,
        creatorName: userId,
        creatorId: userId
      });

      console.log("全部上传完成");
    } else {
      console.log('开始上传物料中心...');
      await axios({
        method: 'post',
        url: `${domain.endsWith('/') ? domain.slice(0, -1) : domain}/api/material/vsc/createComlib`,
        data: {
          userId: userName,
          editCode: fse.readFileSync(editCodePath, 'utf-8'),
          runtimeCode: fse.readFileSync(rtCodePath, 'utf-8'),
          runtimeComponentsMapCode: runtimeComponentsMapString,
          version: finalConfig.version || packageJson.version,
          namespace: finalConfig.namespace,
          scene: sceneInfo,
          tags: [tag],
          title: finalConfig.name || packageJson.description
        }
      }).then(({data: { code, data, message }}) => {
        if (code === 1) {
          console.log('发布成功: ', JSON.stringify(data, null, 2));
        } else {
          console.error(`发布失败: ${message}`);
        }
      }).catch((err) => {
        if (err?.response?.data?.statusCode === 404) {
          console.error(`发布失败: ${err.message}，请检查平台是否正常安装物料中心`);
        } else {
          console.error(`发布失败: ${err.message}，请检查是否能正常访问 ${domain}`);
        }
      });
    }
  }

  fse.remove(__filename);
  fse.remove(compileProductFolderPath);
}

build();

function getWebpckConfig({ entry, outputPath, externals = [], postCssOptions }, webpackMergeConfig) {
  return merge(webpackMergeConfig, {
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
        // {
        //   test: /\.vue$/,
        //   loader: 'vue-loader',
        //   options: {
        //     hotReload: false,
        //   },
        // },
        {
          test: /\.jsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  '@babel/preset-react'
                ],
                plugins: [
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
                  '@babel/preset-env',
                  '@babel/preset-react'
                ],
                plugins: [
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
              loader: 'url-loader'
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
      // new VueLoaderPlugin()
    ]
  });
}

function getWebpackMergeConfig () {
  let webpackMergeConfig;

  const { webpackConfig } = mybricksJson;

  if (webpackConfig) {
    const typeWebpackConfig = Object.prototype.toString.call(webpackConfig);
    if (typeWebpackConfig === '[object String]') {
      try {
        webpackMergeConfig = require(path.resolve(docPath, webpackConfig));
      } catch {}
    } else if (typeWebpackConfig === '[object Object]') {
      try {
        webpackMergeConfig = require(path.resolve(docPath, webpackConfig.prod));
      } catch {}
    }
  }

  if (!webpackMergeConfig) {
    for (const webpackConfigFileName of ['webpack.config.prod.js', 'webpack.config.js']) {
      try {
        webpackMergeConfig = require(path.resolve(docPath, webpackConfigFileName));
        break;
      } catch {}
    }
  }
  return webpackMergeConfig || {};
}
