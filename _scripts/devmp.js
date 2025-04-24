const readline = require('readline');

const [mybricksJsonPath, projPath, webpackdevjsPath] = process.argv.slice(2);

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
  console.log("[MP:dev - webpackdevjsPath] => ", webpackdevjsPath);
  console.log("[MP:dev - mybricksJsonPath] => ", mybricksJsonPath);
  // const url = await getInput("请填写期望用于调试组件库的搭建页面 URL: ");
  await uniPack.initMybricks({ ...mybricksConfig, mybricksJsonPath });
  await uniPack.dev({
    open() {
      console.log("[MP:dev - success]");
      const cp = require("child_process");
      // cp.execSync(`npm run --prefix ${projPath} dev:comlib ${webpackdevjsPath}`);
      cp.exec(`npm run --prefix ${projPath} dev:comlib ${webpackdevjsPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
    }
  });
};

dev();