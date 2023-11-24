import * as path from "path";
import * as fse from "fs-extra";
import * as semver from 'semver';
import * as vscode from 'vscode';
import * as url from 'url';

export function configValidCheck ({ docPath, configName, publishType }: any) {
  const configPath = path.resolve(docPath, configName);

  if (!fse.existsSync(configPath)) {
    console.error(`缺失mybricks.json文件`);
  }

  const config = fse.readJSONSync(configPath);

  // Vue需要判断Node版本
  if ((Array.isArray(config.tags) && config.tags.include('vue')) || config.tags === 'vue') {
    const currentNodeVersion = process.versions.node;
    const requiredNodeVersion = '14.21.0';
    if (semver.gt(requiredNodeVersion, currentNodeVersion)) {
      vscode.window.showErrorMessage(`当前的Node.js版本(${currentNodeVersion})过低，请升级到${requiredNodeVersion}或更高版本`);
      // throw new Error(`当前的Node.js版本(${currentNodeVersion})过低，请升级到${requiredNodeVersion}或更高版本`);
    }
  }
}

export function publishConfigValidCheck({ docPath, configName, publishType }: any) {
  const configPath = path.resolve(docPath, configName);

  if (!fse.existsSync(configPath)) {
    console.error(`缺失mybricks.json文件`);
  }

  const config = fse.readJSONSync(configPath);
  const isPublishToDist = publishType === 'dist';
  const isPublishToCentral = publishType === 'central';
  if (!isPublishToDist && !isPublishToCentral) {
    if (!config.domain) {
      vscode.window.showErrorMessage(`发布到物料中心需要正确填写domain，比如 https://my.mybricks.world`);
      throw new Error(`发布到物料中心需要正确填写domain，比如 https://my.mybricks.world`);
    }

    checkDomain(config.domain);
  }
}


function checkDomain(domain) {
  try {
    const result = url.parse(domain);
    if (!['http:', 'https:'].includes(result.protocol)) {
      vscode.window.showErrorMessage(`当前domain配置 ${domain} 不合法，请填写正确的url，比如 https://my.mybricks.world`);
      throw new Error(`当前domain配置 ${domain} 不合法，请填写正确的url，比如 https://my.mybricks.world`);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`当前domain ${domain} 不合法，请填写正确的url，比如 https://my.mybricks.world`);
    throw new Error(`当前domain配置 ${domain} 不合法，请填写正确的url，比如 https://my.mybricks.world`);
  }
}