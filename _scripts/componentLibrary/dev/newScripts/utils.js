const fs = require('fs-extra');
const babelParser = require("@babel/parser");

// @babel/parser 处理js字符串，使用@babel/generator转回，如何保证换行和空格都不被改变？

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
  if (!config.userName) {
    if (!config.email) {
      const userName = await getInput(`请输入组件库发布人名称（userName，发布至物料中心时用作平台账号）...`);
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

module.exports = {
  getOnlineInfo,
  getDistInfo,

  getLessLoaders
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
