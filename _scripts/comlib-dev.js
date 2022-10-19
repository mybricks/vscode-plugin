const path = require("path");
const fse = require("fs-extra");
const cp = require("child_process");
const { build } = require("./utils");
const { tempPath } = require("./const");

function mybricksJsonTips (configName) {
  return `
请正确配置${configName}内comAry信息
例1:
{
  "comAry": [
    "./src/button/com.json"
  ]
}
例2: 如果需要区分测试与发布可以做如下区分
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

const nodeModulesPath = path.join(__dirname, "../node_modules");

if (!fse.existsSync(nodeModulesPath)) {
  console.log("插件初始化中，请稍后再试...");
} else {
  console.log("组件库编译中...");

  const argv = process.argv.slice(2);
  const config = {};

  argv.forEach(str => {
    const [key, value] = str.split("=");

    config[key] = value;
  });

  const { docPath, configName } = config;

  const { id, editJS, comlibPath } = build(docPath, configName);

  if (!editJS || !id) {
    console.error(mybricksJsonTips(configName));
    return;
  }

  console.log(`当前编译组件来自${configName}下${comlibPath}的配置`);

  const editJSPath = path.join(tempPath, `${id.replace(/@|\//gi, "_")}.js`);

  fse.writeFileSync(editJSPath, editJS);

  cp.exec(`export entry=${editJSPath} && npm run --prefix ${path.join(__dirname, "../")} dev:comlib`);
}
