// @ts-check
const path = require("path");
const fse = require("fs-extra");
const os = require("os");

const isWindows = os.platform() === "win32";

function getSafePath(value) {
  if (isWindows) {
    return value.replace(/\\/g, '\\\\');
  }
  return value;
}

/**
 * 
 * @param {string} imgPath 图片文件绝对路径
 * @returns 
 */
function imgToDataUri (imgPath) {
  let uri = '';
  let hasImgFile;

  if (fse.existsSync(imgPath)) {
    hasImgFile = fse.readFileSync(imgPath);
  }

  switch (true) {
    case !hasImgFile:
      console.error(`${imgPath}：未找到图片`);
      break;
    case imgPath.endsWith('.svg'):
      uri = svgImgToDataUri(imgPath);
      break;
    default:
      uri = imgToBase64(imgPath);
      break;
  }

  return uri;
};

/**
 * 
 * @param {string} imgPath 图片文件绝对路径
 * @returns 
 */
function svgImgToDataUri (imgPath) {
  const imgFile = fse.readFileSync(imgPath, 'utf8');

  return 'data:image/svg+xml,' + encodeURIComponent(imgFile);
};

/**
 * 
 * @param {string} imgPath 图片文件绝对路径
 * @returns 
 */

function imgToBase64 (imgPath) {
  const imgFile = fse.readFileSync(imgPath);
  const base64data = imgFile.toString('base64');

  return 'data:image/png;base64,' + base64data;
};
 
/**
 * 获取json文件内容转对象
 * @param {string} filePath json文件绝对路径
 * @returns 若路径错误或json内容有误，返回空对象
 */
function readJSONSync (filePath) {
  let rst = {};

  try {
    rst = fse.readJSONSync(filePath);
  } catch (e) { }

  return rst;
};

/**
 * 获取类型
 * @param {*} value 
 * @returns 'object' | 'array' | 'property' | 'string' | 'number' | 'boolean' | 'null'
 */
function getNodeType (value) {
	switch (typeof value) {
		case 'boolean': return 'boolean';
		case 'number': return 'number';
		case 'string': return 'string';
		case 'object': {
			if (!value) {
				return 'null';
			} else if (Array.isArray(value)) {
				return 'array';
			}
			return 'object';
		}
		default: return 'null';
	}
};

class Logger {
  info (...args) {
    console.info('【Info】', ...args);
  }

  error (...args) {
    console.info('【Error】', ...args);
  }
}

const opToString = Object.prototype.toString;
const opIsArray = Array.isArray;

/**
 * 删除文件夹
 * @param {string} fpath 文件夹路径
 */
function rmdirSync(fpath) {
  let files = [];
  if (fse.existsSync(fpath)) {
    if (fse.statSync(fpath).isDirectory()) {
      files = fse.readdirSync(fpath);
      files.forEach((file) => {
        const curPath = path.join(fpath, file);

        if (fse.statSync(curPath).isDirectory()) {
          rmdirSync(curPath);
        } else {
          fse.unlinkSync(curPath);
        }
      });
      fse.rmdirSync(fpath);
    } else {
      fse.unlinkSync(fpath);
    }
  }
}

module.exports = {
  build,
  rmdirSync,
  imgToDataUri,
  svgImgToDataUri,
  imgToBase64,
  opToString,
  opIsArray,
  getNodeType,
  readJSONSync
};

/**
 * 字符串拼接组件库.js并启动webpack-dev-server
 * @param {string} docPath    组件库目录绝对路径
 * @param {string} configName 配置文件名（例：mybricks.json)
 * @returns 
 */
function build (docPath, configName, useTest = true) {
  const configPath = docPath + "/" + configName;

  if (!fse.existsSync(configPath)) {
    return {};
  }

  const entryCfg = getEntryCfg(docPath, configPath);

  let comlibPath = "comAry";

  let comAry = entryCfg.comAry;
  let type = getNodeType(comAry);

  if (type !== "array") {
    if (type === "object") {
      const { test, publish } = comAry;

      if (opIsArray(test) && useTest) {
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
  let rtJS = initRuntimeJS(entryCfg);

  const { editJS: comEditJS, singleComs, rtJS: comRtJS } = scanComJson(docPath, comAry);

  editJS = editJS + comEditJS;
  rtJS = rtJS + comRtJS;

  return {
    rtJS,
    editJS,
    comlibPath,
    singleComs,
    id: entryCfg.libName,
    entryCfg
  };
}

/**
 * 获取组件库入口文件配置项
 * @param {string} docPath    组件库目录绝对路径
 * @param {string} configPath 组件库mybricks.json配置文件绝对路径
 * @returns {{libPath: string, libName: string, debugger: string, libVersion: string, description: string, comAry: Array<any> | {test: any, publish: any}}} 配置项
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
    const cfgJson = readJSONSync(configPath);

    Object.assign(cfg, cfgJson);
  };

  return cfg;
}

/**
 * 初始化组件库edit.js
 * @param {Object} param0 
 * @param {string} param0.libName        组件库名称
 * @param {string} param0.libVersion     组件库版本号
 * @param {string} param0.description    组件库描述
 * @param {string[]} param0.dependencies 依赖cdn数组
 * @returns 组件库edit.js初始化字符串
 */
function initEditJS ({libName, libVersion, description, dependencies}) {
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
      dependencies: ${JSON.stringify(dependencies || [])},
      target: "nodejs",
      comAray
    })
    let comDef;
  `;

  return editJS;
}

/**
 * 初始化组件库rt.js
 * @param {Object} param0 
 * @param {string} param0.libName     组件库名称
 * @param {string} param0.libVersion  组件库版本号
 * @param {string} param0.description 组件库描述
 * @returns 组件库rt.js初始化字符串
 */
function initRuntimeJS ({libName, libVersion, description}) {
  let rtJS = `
    let world = typeof window == 'undefined' ?  global : window
    let comlibRT = world['__comlibs_rt_'];
    if(!comlibRT){
      comlibRT = world['__comlibs_rt_'] = [];
    }
    const comAray = [];
    comlibRT.push({
      id: "${libName}",
      title: "${description}",
      version: "${libVersion}",
      comAray
    });
    let comDef;
  `;

  return rtJS;
}

/**
 * 扫描com.json配置拼接组件库.js
 * @param {string} docPath               组件库目录绝对路径
 * @param {any} comAry 组件列表
 * @param {Array<string>} arrPath        组件列表嵌套路径
 * @returns 
 */
function scanComJson (docPath, comAry, arrPath = [], singleComs = []) {
  let editJS = "";
  let rtJS = "";

  for (const [index, com] of comAry.entries()) {
    const type = opToString.call(com);

    if (type === "[object String]") {
      const comJsonPath = path.join(docPath, com);
      const comPath = path.join(comJsonPath, "../");
      const comJson = readJSONSync(comJsonPath);

      const { rtJS: comRtJS, editJS: comEditJS } = getComString(comJson, comPath, comJsonPath, arrPath, singleComs);

      editJS = editJS + comEditJS;
      rtJS = rtJS + comRtJS;

      // editJS = editJS + getComString(comJson, comPath, comJsonPath, arrPath, singleComs);
    } else if (type === "[object Object]") {
      const {
        icon,
        type,
        title,
        comAry,
        visible
      } = com;

      const { rtJS: comRtJS, editJS: comEditJS } = scanComJson(docPath, comAry, [...arrPath, `[${index}].comAray`], singleComs);


      // TODO rtJS
      editJS = editJS + `comAray${arrPath.join("")}.push({icon:"${icon}",title:"${title}",comAray:[],type:"${type}",visible:${visible === false ? false : true}});`;
      editJS = editJS + comEditJS;

      rtJS = rtJS + `comAray${arrPath.join("")}.push({icon:"${icon}",title:"${title}",comAray:[],type:"${type}",visible:${visible === false ? false : true}});`;
      rtJS = rtJS + comRtJS;
    }
  }

  return {
    rtJS,
    editJS,
    singleComs
  };
}

/**
 * 解析comjson配置
 * @param {any} com               配置项
 * @param {string} comPath        配置项目录路径
 * @param {Array<string>} arrPath 组件列表嵌套路径
 * @returns 单组件拼接字符串
 */
function getComString (com, comPath, comJsonPath, arrPath = [], singleComs = []) {
  let editStr = "";
  let rtStr = "";

  const {
    icon,
    data,
    version,
    upgrade,
    editors,
    preview,
    runtime,
    namespace
  } = com;

  let runtimePath;

  try {
    runtimePath = path.join(comPath, runtime);
  } catch (e) {}

  // 没有runtime或namespace直接跳过即可
  if (runtimePath && namespace) {
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

      editStr = editStr + 
        `comDef = ${JSON.stringify(com)};\n` +
        `comDef.runtime = require("${getSafePath(runtimePath)}").default;\n`;
      rtStr = rtStr + `
        comDef = {
          namespace: "${namespace}",
          version: "${version}",
          runtime: require("${getSafePath(runtimePath)}").default
        };\n
      `;

      try {
        const editorsPath = path.join(comPath, editors);

        if (fse.existsSync(editorsPath)) {
          editStr = editStr + `comDef.editors = require("${getSafePath(editorsPath)}").default;\n`;
        }
      } catch (e) {}

      try {
        const dataPath = path.join(comPath, data);

        if (fse.existsSync(dataPath)) {
          editStr = editStr + `comDef.data = require("${getSafePath(dataPath)}");\n`;
        }
      } catch (e) {}

      try {
        const upgradePath = path.join(comPath, upgrade);

        if (fse.existsSync(upgradePath)) {
          editStr = editStr + `comDef.upgrade = require("${getSafePath(upgradePath)}").default;\n`;
        }
      } catch (e) {}

      try {
        const runtimeEditPath = path.join(comPath, com['runtime.edit']);

        if (fse.existsSync(runtimeEditPath)) {
          editStr = editStr + `comDef['runtime.edit'] = require("${getSafePath(runtimeEditPath)}").default;\n`;
        }
      } catch (e) {}

      
      if (/\.(js|ts|jsx|tsx)$/.test(preview)) {
        try {
          const previewPath = path.join(comPath, preview);

          if (fse.existsSync(previewPath)) {
            editStr = editStr + `comDef.preview = require("${getSafePath(previewPath)}").default;\n`;
          }
        } catch (e) {}
      } else if (/^http/.test(preview)) {
        editStr = editStr + `comDef.preview = "${preview}";\n`;
      }

      singleComs.push({id: namespace, comJsonPath, editCode: `let comDef;${editStr}export default comDef;`, runtimeCode: `let comDef;${editStr}export default comDef;`});

      editStr = editStr + `comAray${arrPath.join("")}.push(comDef);\n`;
      rtStr = rtStr + `comAray${arrPath.join("")}.push(comDef);\n`;
    }
  }

  return { rtJS: rtStr, editJS: editStr };
}
