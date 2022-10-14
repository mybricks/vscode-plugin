const path = require("path");
const fse = require("fs-extra");
const cp = require("child_process");
const { tempPath } = require("./const");
const {
  opIsArray,
  opToString,
  getNodeType,
  readJSONSync,
  imgToDataUri
} = require("./utils");

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

/**
 * 字符串拼接组件库.js并启动webpack-dev-server
 * @param {string} docPath    组件库目录绝对路径
 * @param {string} configName 配置文件名（例：mybricks.json)
 * @returns 
 */
function build (docPath, configName) {
  const configPath = docPath + "/" + configName;

  if (!fse.existsSync(configPath)) {
    return {};
  }

  const entryCfg = getEntryCfg(docPath, configPath);

  let comlibPath = "comAry";

  // TODO 支持test和publish？
  let comAry = entryCfg.comAry;
  let type = getNodeType(comAry);

  if (type !== "array") {
    if (type === "object") {
      const { test, publish } = comAry;

      if (opIsArray(test)) {
        comAry = test;
        comlibPath = comlibPath + ".test";
      } else if (opIsArray(publish)) {
        comAry = publish;
        comlibPath = comlibPath + ".publish";
      }
    }
  }

  if (!opIsArray(comAry)) {
    return {};
  }

  let editJS = initEditJS(entryCfg);

  editJS = editJS + scanComJson(docPath, comAry);

  return {
    editJS,
    comlibPath,
    id: entryCfg.libName
  };
}

/**
 * 获取组件库入口文件配置项
 * @param {string} docPath    组件库目录绝对路径
 * @param {string} configPath 组件库mybricks.json配置文件绝对路径
 * @returns 配置项
 */
function getEntryCfg (docPath, configPath) {
  // const pkg = getJsonFile(path.join(docPath, "./package.json"));

  const pkg = readJSONSync(path.join(docPath, "./package.json"));

  const cfg = {
    comAry: [],
    libPath: docPath,
    libName: pkg.name,
    // libName: pkg.name.replace(/@|\//gi, "_"),
    debugger: "pc-spa",
    libVersion: pkg.version,
    description: pkg.description
  };

  if (fse.existsSync(configPath)) {
    // const cfgJson = getJsonFile<{comAry: MybricksConfigCom[]}>(configPath);

    const cfgJson = readJSONSync(configPath);

    Object.assign(cfg, cfgJson);
  };

  return cfg;
}

/**
 * 初始化组件库edit.js
 * @param {Object} param0 
 * @param {string} param0.libName     组件库名称
 * @param {string} param0.libVersion  组件库版本号
 * @param {string} param0.description 组件库描述
 * @returns 组件库edit.js初始化字符串
 */
function initEditJS ({libName, libVersion, description}) {
  const editJS = `
    let comlibEdt = window["__comlibs_edit_"];
    if(!comlibEdt){
      comlibEdt = window["__comlibs_edit_"] = [];
    }
    const comAray = []
    comlibEdt.push({
      id: "${libName}",
      title: "${description}",
      version: "${libVersion}",
      comAray
    })
    let comDef;
  `;

  return editJS;
}

/**
 * 扫描com.json配置拼接组件库.js
 * @param {string} docPath               组件库目录绝对路径
 * @param {any} comAry 组件列表
 * @param {Array<string>} arrPath        组件列表嵌套路径
 * @returns 
 */
function scanComJson (docPath, comAry, arrPath = []) {
  let rst = "";

  for (const [index, com] of comAry.entries()) {
    const type = opToString.call(com);

    if (type === "[object String]") {
      const comJsonPath = path.join(docPath, com);
      const comPath = path.join(comJsonPath, "../");
      const comJson = readJSONSync(comJsonPath);

      rst = rst + getComString(comJson, comPath, arrPath);
    } else if (type === "[object Object]") {
      const {
        icon,
        type,
        title,
        comAry,
        visible
      } = com;

      rst = rst + `comAray${arrPath.join("")}.push({icon:"${icon}",title:"${title}",comAray:[],type:"${type}",visible:${visible === false ? false : true}});`;
      rst = rst + scanComJson(docPath, comAry, [...arrPath, `[${index}].comAray`]);
    }
  }

  return rst;
}

/**
 * 解析comjson配置
 * @param {any} com       配置项
 * @param {string} comPath        配置项目录路径
 * @param {Array<string>} arrPath 组件列表嵌套路径
 * @returns 单组件拼接字符串
 */
function getComString (com, comPath, arrPath = []) {
  let comStr = "";

  const {
    icon,
    data,
    upgrade,
    editors,
    preview,
    runtime
  } = com;

  let runtimePath;

  try {
    runtimePath = path.join(comPath, runtime);
  } catch (e) {}

  // 没有runtime直接跳过即可
  if (runtimePath) {
    if (fse.existsSync(runtimePath)) {
      // 图标处理
      if (icon && !`${icon}`.startsWith("http") && !`${icon}`.startsWith("data:image")) {
        const iconPath = path.join(comPath, icon);
        const imgUri = imgToDataUri(iconPath);

        if (imgUri) {
          com.icon = imgUri;
        }
      }

      // 预览处理
      if (preview && !/(\.(js|ts|jsx|tsx)$)|(^http)/.test(preview)) {
        const iconPath = path.join(comPath, preview);
        const imgUri = imgToDataUri(iconPath);

        if (imgUri) {
          com.preview = imgUri;
        }
      }

      comStr = comStr + 
        // `comDef = require("${comPath}");` +
        `comDef = ${JSON.stringify(com)};\n` +
        `comDef.runtime = require("${runtimePath}").default;\n`;

      try {
        const editorsPath = path.join(comPath, editors);

        if (fse.existsSync(editorsPath)) {
          comStr = comStr + `comDef.editors = require("${editorsPath}").default;\n`;
        }
      } catch (e) {}

      try {
        const dataPath = path.join(comPath, data);

        if (fse.existsSync(dataPath)) {
          comStr = comStr + `comDef.data = require("${dataPath}");\n`;
        }
      } catch (e) {}

      try {
        const upgradePath = path.join(comPath, upgrade);

        if (fse.existsSync(upgradePath)) {
          comStr = comStr + `comDef.upgrade = require("${upgradePath}").default;\n`;
        }
      } catch (e) {}

      
      if (/\.(js|ts|jsx|tsx)$/.test(preview)) {
        try {
          const previewPath = path.join(comPath, preview);

          if (fse.existsSync(previewPath)) {
            comStr = comStr + `comDef.preview = require("${previewPath}").default;\n`;
          }
        } catch (e) {}
      } else if (/^http/.test(preview)) {
        comStr = comStr + `comDef.preview = "${preview}";\n`;
      }

      comStr = comStr + `comAray${arrPath.join("")}.push(comDef);\n`;
    }
  }

  return comStr;
}
