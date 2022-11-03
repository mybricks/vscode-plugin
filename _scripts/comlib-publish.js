const path = require("path");
const fse = require("fs-extra");
const request = require("request");
const cp = require("child_process");
const { tempPubPath } = require("./const");
const { build, rmdirSync } = require("./utils");

const nodeModulesPath = path.join(__dirname, "../node_modules");

function mybricksJsonTips (configName) {
  return `
请正确配置${configName}内comAry信息
例:
{
  "comAry": [
    "./src/button/com.json"
  ]
}`;
}

async function comlibPublish () {
  return new Promise((resolve) => {
    if (!fse.existsSync(nodeModulesPath)) {
      process.send?.({code: -1, message: "插件初始化中，请稍后再试..."});
    } else {
      const argv = process.argv.slice(2);
      const [docPath, configName, token] = argv;

      process.send?.({code: 0, message: "组件库拼接"});
      
      const { id, editJS, comlibPath, singleComs, rtJS, entryCfg } = build(docPath, configName, false);

      if (!id || !editJS || !rtJS) {
        process.send?.({code: -1, message: mybricksJsonTips(configName)});
        resolve(true);
        return;
      }

      process.send?.({code: 0, message: `当前编译组件来自${configName}下${comlibPath}的配置`});

      const dirName = path.join(tempPubPath, `${id.replace(/@|\//gi, "_")}`);

      rmdirSync(dirName);
      fse.mkdirSync(dirName);

      process.send?.({code: 0, message: dirName});

      const editJSPath = path.join(dirName, 'edit.js');

      fse.writeFileSync(editJSPath, editJS);

      const rtJSPath = path.join(dirName, 'rt.js');

      fse.writeFileSync(rtJSPath, rtJS);

      // singleComs.forEach(singleCom => {
      //   const { id, editCode, runtimeCode } = singleCom;

      //   fse.writeFileSync(path.join(dirName, `${id}.com.js`), runtimeCode);
      //   // 不需要runtime code了
      //   // fse.writeFileSync(path.join(dirName, `${id}.runtime.js`), runtimeCode);
      // });

      const child = cp.exec(`export entry=${dirName} && npm run --prefix ${path.join(__dirname, "../")} publish:comlib`);

      process.send?.({code: 0, message: "组件库编译中请稍后..."});

      child.on('close', code => {
        const docDistDirPath = path.join(docPath, 'dist');
        
        if (!fse.existsSync(docDistDirPath)) {
          fse.mkdirSync(docDistDirPath);
        } else {
          fse.unlinkSync(path.join(docDistDirPath, 'edit.js'));
          fse.unlinkSync(path.join(docDistDirPath, 'rt.js'));
        }
        
        // TODO 单组件信息
        // const docDistComsPath = path.join(docDistDirPath, 'coms');

        // if (!fse.existsSync(docDistComsPath)) {
        //   fse.mkdirSync(docDistComsPath);
        // } else {
        //   const coms = fse.readdirSync(docDistComsPath);

        //   coms.forEach(com => {
        //     fse.unlinkSync(path.join(docDistComsPath, com));
        //   });
        // }

        const editJSPath = path.join(dirName, 'edit.js');

        fse.writeFileSync(path.join(docDistDirPath, 'edit.js'), fse.readFileSync(editJSPath, 'utf-8'));

        const rtJSPath = path.join(dirName, 'rt.js');

        fse.writeFileSync(path.join(docDistDirPath, 'rt.js'), fse.readFileSync(rtJSPath, 'utf-8'));

        // singleComs.forEach(({id}) => {
        //   const comEditPath = path.join(dirName, `${id}.com.js`);
        //   // const comRuntimePath = path.join(dirName, `${id}.runtime.js`);

        //   fse.writeFileSync(path.join(docDistComsPath, `${id}.js`), fse.readFileSync(comEditPath, 'utf-8'));

        //   // fse.writeJSONSync(path.join(docDistComsPath, `${id}.json`), {
        //   //   editCode: encodeURIComponent(fse.readFileSync(comEditPath, 'utf-8')),
        //   //   runtimeCode: encodeURIComponent(fse.readFileSync(comRuntimePath, 'utf-8'))
        //   // }, {
        //   //   spaces: 2
        //   // });
        // });

        // 保留字段 dependencies，comAry, publishApi
        const { comAry, dependencies, publishApi, ...other } = entryCfg;

        if (publishApi) {
          process.send?.({code: 0, message: "调用接口发布组件库..." + publishApi});

          const { key: tokenKey, value: tokenValue } = JSON.parse(token);
          const params = {
            ...other,
            isComLib: true,
            comLibEditor: fse.readFileSync(editJSPath, 'utf-8'),
            comLibRuntime: fse.readFileSync(rtJSPath, 'utf-8')
          };
  
          if (tokenKey && tokenValue) {
            params[tokenKey] = tokenValue;
          }
  
          request({
            method: "POST",
            url: publishApi,
            headers: {
              "content-type": "application/json"
            },
            body: params,
            json: true
          }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
              const { code, message } = body;

              process.send?.({code: code === 1 ? 1: -1, message: code === 1 ? (message || "发布成功") : `发布失败(${message})`});
            } else{
              process.send?.({code: -1, message: `发布失败(${error.message})`});
            }

            rmdirSync(dirName);
            resolve(true);
          });
        } else {
          rmdirSync(dirName);

          process.send?.({code: 1, message: "发布成功，未配置发布接口，产物保存在dist文件夹下", relativePath: "/dist/edit.js"});
  
          resolve(true);
        }
      });
    }
  });
}

comlibPublish();
