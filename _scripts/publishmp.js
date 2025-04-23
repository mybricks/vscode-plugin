const fs = require('fs-extra');
const readline = require('readline');
const { uniPack } = require('mybricks-uni-pack');
const babelParser = require("@babel/parser");

const [mybricksJsonPath] = process.argv.slice(2);

console.log("[MP:publish - mybricksJsonPath] => ", mybricksJsonPath);

function getInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${prompt}\n`, (input) => {
      if (input.trim() === '') {
        rl.close();
        resolve("");
      } else {
        rl.close();
        resolve(input);
      }
    });
  });
}

const mybricksConfig = {
  h5: {
    viewWidth: 375,
  },
};

const build = async () => {
  await uniPack.initMybricks({ ...mybricksConfig, mybricksJsonPath });
  await uniPack.build({});
};

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

const publish = async () => {  
  const config = await getOnlineInfo({ configPath: mybricksJsonPath });
  await build();
  console.log("[MP:publish - 编译完成]");
  await uniPack.initMybricks(mybricksConfig);
  console.log("开始发布");
  await uniPack.publish({
    domain: config.domain,
    userId: config.userName
  });
  console.log("发布成功");
};

publish();
