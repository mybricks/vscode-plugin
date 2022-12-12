const path = require("path");
const fse = require("fs-extra");
const { build } = require("./utils");
const { tempPubPath } = require("./const");

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

console.log("组件库编译中...");

const argv = process.argv.slice(2);
const config = {};

argv.forEach(str => {
  const [key, value] = str.split("=");

  config[key] = value;
});

const { docPath, configName } = config;

const { id, rtJS, editJS, comlibPath, singleComs } = build(docPath, configName);

if (!editJS || !id) {
  console.error(mybricksJsonTips(configName));
  return;
}

console.log(`当前编译组件来自${configName}下${comlibPath}的配置`);

const docDistDirPath = path.join(docPath, 'dist');

fse.removeSync(docDistDirPath);
fse.mkdirSync(docDistDirPath);

const editJSPath = path.join(docDistDirPath, 'edit.js');

fse.writeFileSync(editJSPath, editJS);

const rtJSPath = path.join(docDistDirPath, 'rt.js');

fse.writeFileSync(rtJSPath, rtJS);

const filename = (docPath + configName).replace(/@|\//gi, "_");

fse.writeJSONSync(path.resolve(tempPubPath, `./${filename}`), {
  entry: {
    edit: editJSPath,
    rt: rtJSPath
  },
  docPath,
  configName
});
