import * as vscode from "vscode";

import * as path from "path";
import * as fse from "fs-extra";
import { LaunchJson } from "../../types";
import {
  opIsArray,
  readJSONSync,
  getWorkspaceFsPath,
  checkIsMybricksProject
} from "../../utils";

export async function start () {
  const mybricksComlibCfg = await initLaunchJson();

  return mybricksComlibCfg;

  // TODO 这里相当于强制重写，应该不会出现false的情况，后续再支持launch.json随意编写
}

/**
 * 初始化debugger所需的launch.json
 * TODO 暂时禁止该json内编写注释代码，可参考底部注释
 * @returns 
 */
export async function initLaunchJson (init = false) {
  const mybricksJsonFiles = checkIsMybricksProject();
  const docPath = getWorkspaceFsPath();

  if (docPath && mybricksJsonFiles) {
    let isInit = false;

    const vscodeConfigPath = path.join(docPath, ".vscode");
    const comlibJsPath = path.join(__dirname, "../_scripts/comlib-dev.js");

    let mybricksJsonName;

    if (init) {
      // 取默认mybricks.json，找不到的话获取第一项
      mybricksJsonName = mybricksJsonFiles.find(name => name === 'mybricks.json');

      if (!mybricksJsonName) {
        mybricksJsonName = mybricksJsonFiles[0];
      }
    } else if (mybricksJsonFiles) {
      if (mybricksJsonFiles.length > 1) {
        const selectMybricksJsonName = await vscode.window.showQuickPick(mybricksJsonFiles);

        mybricksJsonName = selectMybricksJsonName;
      } else {
        mybricksJsonName = mybricksJsonFiles[0];
      }
    }

    if (!mybricksJsonName) {
      return false;
    }

    if (!init) {
      vscode.commands.executeCommand("mybricks.debugger.check");
      vscode.window.showInformationMessage("检查并订正启动配置...");
    }

    const defaultMybrickComlibCfg = {
      type: "node",
      request: "launch",
      name: "Mybrick Comlib",
      args: [
        `docPath=${docPath}`,
        `configName=${mybricksJsonName}`
      ],
      program: comlibJsPath
    };

    if (!fse.existsSync(vscodeConfigPath)) {
      fse.mkdirSync(vscodeConfigPath);
    }

    const launchJsonPath = path.join(vscodeConfigPath, "launch.json");

    if (!fse.existsSync(launchJsonPath)) {
      fse.writeFileSync(launchJsonPath, JSON.stringify({
        version: "0.2.0",
        configurations: [
          defaultMybrickComlibCfg
        ]
      }, null, 2));

      isInit = true;
    }

    if (!isInit) {
      let launchJson: LaunchJson = readJSONSync(launchJsonPath);

      const { configurations } = launchJson;

      if (opIsArray(configurations)) {
        const mybricksComlibCfgIndex = configurations.findIndex(cfg => cfg.name === "Mybrick Comlib");

        if (mybricksComlibCfgIndex !== -1) {
          configurations[mybricksComlibCfgIndex] = defaultMybrickComlibCfg;
        } else {
          configurations.push(defaultMybrickComlibCfg);
        }
      } else {
        launchJson = {
          version: "0.2.0",
          configurations: [
            defaultMybrickComlibCfg
          ]
        };
      }

      fse.writeFileSync(launchJsonPath, JSON.stringify(launchJson, null, 2));
    }

    return defaultMybrickComlibCfg;
  }

  return false;
}

/**
 * launch.json处理可以翻vscode源码全局搜索“export const enum ScanError”
 */
