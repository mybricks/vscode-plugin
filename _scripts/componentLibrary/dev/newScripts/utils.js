const fs = require('fs-extra');
const axios = require('axios');
const chalk = require('chalk');
const FormData = require('form-data');
// @babel/parser 处理js字符串，使用@babel/generator转回，如何保证换行和空格都不被改变？
const babelParser = require("@babel/parser");
const { execSync } = require('child_process');

const readline = require('readline');

function getInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${prompt}\n`, (input) => {
      if (input.trim() === '') {
        rl.close();
        resolve(getInput(prompt));
      } else {
        rl.close();
        resolve(input);
      }
    });
  });
}

// 获取发布至中心化所需的数据
async function getCentralInfo ({configPath}) {
  const configCode = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configCode);
  const pushNewObjectPropertys = [];
  if (!config.namespace) {
    const namespace = await getInput('请输入组件库namespace（唯一标识，用于组件库升级）...');
    config.namespace = namespace;
    pushNewObjectPropertys.push({
      key: 'namespace',
      value: namespace
    });
  }
  if (!config.tags) {
    config.tags = 'react';
    pushNewObjectPropertys.push({
      key: 'tags',
      value: 'react'
    });
  }
  if (pushNewObjectPropertys.length) {
    const newConfig = {};
    // TODO: 转ast是为了保证原JSON顺序不变
    const ast = babelParser.parse(`(${configCode})`);
    const properties = ast.program.body[0].expression.properties;
    properties.forEach((propertie) => {
      const key = propertie.key.value;
      newConfig[key] = config[key];
    });
    pushNewObjectPropertys.forEach(({ key, value }) => {
      newConfig[key] = value;
    });
    fs.writeJSONSync(configPath, newConfig, { spaces: 2 });
  }

  return config;
}

// 获取发布至物料中心所需的数据
async function getOnlineInfo ({configPath}) {
  const configCode = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configCode);
  const pushNewObjectPropertys = [];

  if (!config.domain) {
    const domain = await getInput('请输入平台地址...');
    config.domain = domain;
    pushNewObjectPropertys.push({
      key: 'domain',
      value: domain
    });
  }
  if (!config.namespace) {
    const namespace = await getInput('请输入组件库namespace（唯一标识，用于组件库升级）...');
    config.namespace = namespace;
    pushNewObjectPropertys.push({
      key: 'namespace',
      value: namespace
    });
  }
  if (!config.userName) {
    if (!config.email) {
      const userName = await getInput(`请正确填写 ${config.domain} 平台的账号...`);
      config.userName = userName;
    } else {
      config.userName = config.email;
    }
    pushNewObjectPropertys.push({
      key: 'userName',
      value: config.userName
    });
  }
  if (!config.tags) {
    config.tags = 'react';
    pushNewObjectPropertys.push({
      key: 'tags',
      value: 'react'
    });
  }
  if (pushNewObjectPropertys.length) {
    const newConfig = {};
    // TODO: 转ast是为了保证原JSON顺序不变
    const ast = babelParser.parse(`(${configCode})`);
    const properties = ast.program.body[0].expression.properties;
    properties.forEach((propertie) => {
      const key = propertie.key.value;
      newConfig[key] = config[key];
    });
    pushNewObjectPropertys.forEach(({ key, value }) => {
      newConfig[key] = value;
    });
    fs.writeJSONSync(configPath, newConfig, { spaces: 2 });
  }

  return config;
}

async function getDistInfo ({configPath}) {
  const configCode = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configCode);
  const pushNewObjectPropertys = [];
  if (!config.namespace) {
    const namespace = await getInput('请输入组件库namespace（唯一标识，用于组件库升级）...');
    config.namespace = namespace;
    pushNewObjectPropertys.push({
      key: 'namespace',
      value: namespace
    });
  }
  // if (!config.userName) {
  //   if (!config.email) {
  //     const userName = await getInput(`请输入组件库发布人名称（userName，发布至物料中心时用作平台账号）...`);
  //     config.userName = userName;
  //   } else {
  //     config.userName = config.email;
  //   }
  //   pushNewObjectPropertys.push({
  //     key: 'userName',
  //     value: config.userName
  //   });
  // }
  if (!config.tags) {
    config.tags = 'react';
    pushNewObjectPropertys.push({
      key: 'tags',
      value: 'react'
    });
  }
  if (pushNewObjectPropertys.length) {
    const newConfig = {};
    // TODO: 转ast是为了保证原JSON顺序不变
    const ast = babelParser.parse(`(${configCode})`);
    const properties = ast.program.body[0].expression.properties;
    properties.forEach((propertie) => {
      const key = propertie.key.value;
      newConfig[key] = config[key];
    });
    pushNewObjectPropertys.forEach(({ key, value }) => {
      newConfig[key] = value;
    });
    fs.writeJSONSync(configPath, newConfig, { spaces: 2 });
  }

  return config;
}

async function getNpmInfo ({configPath}) {
  const configCode = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configCode);
  const pushNewObjectPropertys = [];
  if (!config.tags) {
    config.tags = 'react';
    pushNewObjectPropertys.push({
      key: 'tags',
      value: 'react'
    });
  }
  if (pushNewObjectPropertys.length) {
    const newConfig = {};
    // TODO: 转ast是为了保证原JSON顺序不变
    const ast = babelParser.parse(`(${configCode})`);
    const properties = ast.program.body[0].expression.properties;
    properties.forEach((propertie) => {
      const key = propertie.key.value;
      newConfig[key] = config[key];
    });
    pushNewObjectPropertys.forEach(({ key, value }) => {
      newConfig[key] = value;
    });
    fs.writeJSONSync(configPath, newConfig, { spaces: 2 });
  }

  return config;
}

function getCurrentTimeYYYYMMDDHHhhmmss() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

  return formattedDate;
}

async function uploadToOSS({content, folderPath, fileName, noHash}) {
  const blob = new Buffer.from(content);
  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('fileName', fileName);
  formData.append('folderPath', folderPath);
  formData.append('noHash', JSON.stringify(noHash));
  
  try {
    const res = await axios.post('https://my.mybricks.world/paas/api/oss/uploadFile', formData);
    const { code, data } = res.data;
    if (code === 1) {
      return data.url;
    } else {
      throw new Error(res);
    }
  } catch (err) {
    throw new Error(err);
  }
}

// const domain = 'http://localhost:4100/central/api';
const domain = 'https://my.mybricks.world/central/api';

async function publishToCentral({
  sceneType, // PC
  name,
  content,
  tags, // ['react']
  namespace,
  version,
  description,
  type, // com_lib
  icon,
  previewImg,
  creatorName,
  creatorId
}) {
  try {
    const res = await axios({
      method: 'post',
      url: domain + '/channel/gateway',
      data: {
        action: 'material_publishVersion',
        payload: {
          namespace,
          version,
          description,
          type,
          icon,
          scene_type: sceneType,
          name,
          content,
          tags,
          preview_img: previewImg,
          creator_name: creatorName,
          creator_id: creatorId,
        }
      }
    });
    const { code, message } = res.data;

    console.log(`${namespace}@${version}: `, code === -1 ? chalk.yellowBright(message) : chalk.greenBright(message));
  } catch (err) {
    throw new Error(err);
  }
}

function getGitEmail({ docPath }) {
  let email = '';
  try {
    email = execSync(`cd ${docPath} && git config user.email`).toString().trim();
  } catch (error) {
    console.log('获取组件库目录下 Git 邮箱失败，尝试从全局获取: ', error.message);
  }

  if (!email) {
    console.log('当前组件库目录下未配置 Git 邮箱，尝试从全局获取...');
    try {
      email = execSync('git config user.email').toString().trim();
    } catch (error) {
      console.log('获取全局 Git 邮箱失败: ', error);
    }
  }

  return email;
}

module.exports = {
  getCentralInfo,
  getOnlineInfo,
  getDistInfo,
  getNpmInfo,
  getGitEmail,

  getLessLoaders,
  getCurrentTimeYYYYMMDDHHhhmmss,
  uploadToOSS,
  publishToCentral
};



// TODO: vue临时
// 只有带?moduels的文件才会被css modules，这个文件由babelPluginAutoCssModules插件产生，所以必须配合使用
function getLessLoaders({ postCssOptions }) {
  return [
    {
      test: /\.less$/i,
      oneOf: [
        {
          resourceQuery: /modules/,
          use: getLessModuleLoaders({ postCssOptions: postCssOptions ?? {} })
        },
        {
          use: getLessNoModulesLoaders({ postCssOptions: postCssOptions ?? {} }),
        }
      ],
      exclude: /node_modules/
    },
    {
      test: /\.less$/i,
      use: getLessModuleLoaders({ postCssOptions: postCssOptions ?? {} }),
      include: /node_modules/
    },
  ];
};


const getLessModuleLoaders = ({ postCssOptions }) => [
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
    loader: 'postcss-loader',
    options: {
      postcssOptions: postCssOptions,
    },
  },
  {
    loader: "less-loader",
    options: {
      lessOptions: {
        javascriptEnabled: true
      },
    },
  }
];

const getLessNoModulesLoaders = ({ postCssOptions }) => [
  {
    loader: 'style-loader',
    options: {attributes: {title: 'less'}}
  },
  {
    loader: 'css-loader',
    options: {
      modules: false,
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: postCssOptions,
    },
  },
  {
    loader: "less-loader",
    options: {
      lessOptions: {
        javascriptEnabled: true
      },
    },
  }
];
