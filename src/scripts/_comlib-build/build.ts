import * as fs from 'fs';
import * as path from 'path';
import { getEntryCfg, imgToDataUri } from '../utils';
import { getJsonFile, opToString } from '../../utils';

/**
 * 字符串拼接组件库.js并启动webpack-dev-server
 * @param {string} docPath    组件库目录绝对路径
 * @param {string} configName 配置文件名（例：mybricks.json)
 * @returns 
 */
export function build (docPath: string, configName: string): {
  id: string;
  editJS: string;
} {
  const configPath = docPath + '/' + configName;
  const entryCfg = getEntryCfg(docPath, configPath);
  const comAry = entryCfg.comAry;

  let editJS = initEditJS(entryCfg);

  editJS = editJS + scanComJson(docPath, comAry);

  return {
    id: entryCfg.libName,
    editJS
  };
}

/**
 * 初始化组件库edit.js
 * @param {Object} param0 
 * @param {string} libName     组件库名称
 * @param {string} libVersion  组件库版本号
 * @param {string} description 组件库描述
 * @returns 组件库edit.js初始化字符串
 */
function initEditJS ({libName, libVersion, description}: {
  libName: string;
  libVersion: string;
  description: string;
}): string {
  const editJS = `
    let comlibEdt = window['__comlibs_edit_'];
    if(!comlibEdt){
      comlibEdt = window['__comlibs_edit_'] = [];
    }
    const comAray = []
    comlibEdt.push({
      id: '${libName}',
      title: '${description}',
      version: '${libVersion}',
      comAray
    })
    let comDef;
  `;

  return editJS;
}

/**
 * 扫描com.json配置拼接组件库.js
 * @param {string} docPath               组件库目录绝对路径
 * @param {T_MybricksConfigCom[]} comAry 组件列表
 * @param {Array<string>} arrPath        组件列表嵌套路径
 * @returns 
 */
function scanComJson (docPath: string, comAry: T_MybricksConfigCom[], arrPath: string[] = []) {
  let rst: string = '';

  for (const [index, com] of comAry.entries()) {
    const type = opToString.call(com);

    if (type === '[object String]') {
      const comJsonPath = path.join(docPath, com as string);
      const comPath = path.join(comJsonPath, '../');
      const comJson = getJsonFile<T_ComConfig>(comJsonPath);

      rst = rst + getComString(comJson, comPath, arrPath);
    } else if (type === '[object Object]') {
      const {
        icon,
        type,
        title,
        comAry,
        visible
      } = com as any;

      rst = rst + `comAray${arrPath.join('')}.push({icon:'${icon}',title:'${title}',comAray:[],type:'${type}',visible:${visible === false ? false : true}});`;
      rst = rst + scanComJson(docPath, comAry, [...arrPath, `[${index}].comAray`]);
    }
  }

  return rst;
}

/**
 * 解析comjson配置
 * @param {T_ComConfig} com       配置项
 * @param {string} comPath        配置项目录路径
 * @param {Array<string>} arrPath 组件列表嵌套路径
 * @returns 单组件拼接字符串
 */
function getComString (com: T_ComConfig, comPath: string, arrPath: string[] = []): string {
  let comStr: string = '';

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
    if (fs.existsSync(runtimePath)) {
      // 图标处理
      if (icon && !`${icon}`.startsWith('http') && !`${icon}`.startsWith('data:image')) {
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
        // `comDef = require('${comPath}');` +
        `comDef = ${JSON.stringify(com)};\n` +
        `comDef.runtime = require('${runtimePath}').default;\n`;

      try {
        const editorsPath = path.join(comPath, editors);

        if (fs.existsSync(editorsPath)) {
          comStr = comStr + `comDef.editors = require('${editorsPath}').default;\n`;
        }
      } catch (e) {}

      try {
        const dataPath = path.join(comPath, data);

        if (fs.existsSync(dataPath)) {
          comStr = comStr + `comDef.data = require('${dataPath}').default;\n`;
        }
      } catch (e) {}

      try {
        const upgradePath = path.join(comPath, upgrade);

        if (fs.existsSync(upgradePath)) {
          comStr = comStr + `comDef.upgrade = require('${upgradePath}').default;\n`;
        }
      } catch (e) {}

      
      if (/\.(js|ts|jsx|tsx)$/.test(preview)) {
        try {
          const previewPath = path.join(comPath, preview);

          if (fs.existsSync(previewPath)) {
            comStr = comStr + `comDef.preview = require('${previewPath}').default;\n`;
          }
        } catch (e) {}
      } else if (/^http/.test(preview)) {
        comStr = comStr + `comDef.preview = '${preview}';\n`;
      }

      comStr = comStr + `comAray${arrPath.join('')}.push(comDef);\n`;
    }
  }

  return comStr;
}
