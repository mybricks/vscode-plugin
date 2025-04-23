const readline = require('readline');

const mybricksConfig = {
  h5: {
    viewWidth: 375,
  },
};

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

const dev = async () => {
  const { uniPack } = require('mybricks-uni-pack');
  const [mybricksJsonPath] = process.argv.slice(2);
  console.log("[MP:dev - mybricksJsonPath] => ", mybricksJsonPath);
  const url = await getInput("请填写期望用于调试组件库的搭建页面 URL: ");
  await uniPack.initMybricks({ ...mybricksConfig, mybricksJsonPath });
  await uniPack.dev({
    /** 配置自动打开的调试URL链接 */
    open: ({ debugServerUrl, packageName, namespace }) => {
      debugServerUrl = `debugServerUrl=${encodeURIComponent(debugServerUrl)}`;
      packageName = `packageName=${encodeURIComponent(packageName)}`;
      namespace = `namespace=${encodeURIComponent(namespace)}`;

      return `${url}&${debugServerUrl}&${packageName}&${namespace}`;
    },
  });
};

dev();