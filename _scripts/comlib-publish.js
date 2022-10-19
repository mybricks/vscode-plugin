// @ts-check
const path = require("path");
const fse = require("fs-extra");
const cp = require("child_process");
const { tempPubPath } = require("./const");
const { build, rmdirSync } = require("./utils");

const nodeModulesPath = path.join(__dirname, "../node_modules");

function mybricksJsonTips (configName) {
  return `
请正确配置${configName}内comAry信息
例1:
{
  "comAry": [
    "./src/button/com.json"
  ]
}
例2: 如何开发阶段区分test和publish，发布只会取publish
{
  "comAry": {
    "test": [
      "./src/button/com.json"
    ],
    "publish": [
      "./src/button/com.json"
    ]
  }
}`;
}

async function comlibPublish () {
  return new Promise((resolve) => {
    if (!fse.existsSync(nodeModulesPath)) {
      process.send?.({code: -1, message: "插件初始化中，请稍后再试..."});
    } else {
      const argv = process.argv.slice(2);
      const [docPath, configName] = argv;

      process.send?.({code: 0, message: "组件库拼接"});
      
      const { id, editJS, comlibPath, singleComs } = build(docPath, configName, false);

      if (!id || !editJS) {
        process.send?.({code: -1, message: mybricksJsonTips(configName)});
        resolve(true);
        return;
      }

      process.send?.({code: 0, message: `当前编译组件来自${configName}下${comlibPath}的配置`});

      const dirName = path.join(tempPubPath, `${id.replace(/@|\//gi, "_")}`);

      rmdirSync(dirName);
      fse.mkdirSync(dirName);

      const editJSPath = path.join(dirName, 'edit.js');

      fse.writeFileSync(editJSPath, editJS);

      singleComs.forEach(singleCom => {
        const { id, editCode, runtimeCode } = singleCom;

        fse.writeFileSync(path.join(dirName, `${id}.edit.js`), editCode);
        fse.writeFileSync(path.join(dirName, `${id}.runtime.js`), runtimeCode);
      });

      const child = cp.exec(`export entry=${dirName} && npm run --prefix ${path.join(__dirname, "../")} publish:comlib`);

      process.send?.({code: 0, message: "组件库编译中请稍后..."});

      child.on('close', code => {
        const docDistDirPath = path.join(docPath, 'dist');
        
        if (!fse.existsSync(docDistDirPath)) {
          fse.mkdirSync(docDistDirPath);
        } else {
          fse.unlinkSync(path.join(docDistDirPath, 'edit.js'));
        }
        
        const docDistComsPath = path.join(docDistDirPath, 'coms');

        if (!fse.existsSync(docDistComsPath)) {
          fse.mkdirSync(docDistComsPath);
        } else {
          const coms = fse.readdirSync(docDistComsPath);

          coms.forEach(com => {
            fse.unlinkSync(path.join(docDistComsPath, com));
          });
        }

        const editJSPath = path.join(dirName, 'edit.js');

        fse.writeFileSync(path.join(docDistDirPath, 'edit.js'), fse.readFileSync(editJSPath, 'utf-8'));

        singleComs.forEach(({id}) => {
          const comEditPath = path.join(dirName, `${id}.edit.js`);
          const comRuntimePath = path.join(dirName, `${id}.runtime.js`);

          fse.writeJSONSync(path.join(docDistComsPath, `${id}.json`), {
            editCode: encodeURIComponent(fse.readFileSync(comEditPath, 'utf-8')),
            runtimeCode: encodeURIComponent(fse.readFileSync(comRuntimePath, 'utf-8'))
          }, {
            spaces: 2
          });
        });

        rmdirSync(dirName);

        process.send?.({code: 1, message: "发布成功，产物保存在dist文件夹下", relativePath: "/dist/edit.js"});

        resolve(true);
      });
    }
  });
}

comlibPublish();
