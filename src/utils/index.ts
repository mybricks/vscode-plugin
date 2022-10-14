import * as path from "path";
import * as fse from "fs-extra";
import * as vscode from "vscode";


export function logger(...args: any) {
  console.log("======");
  console.error("[Mybricks]", ...args);
  console.log("======");
}


export function registerCommand(command: string, commandHandler: (...args: any[]) => any) {
  return vscode.commands.registerCommand(command, (...args) => {
    // todo: 增加日志
    logger("Execute Command", command, args);
    commandHandler(...args);
  });
}


export function setStatusBarBackground(color: string) {
  const workbenchConfiguration = vscode.workspace.getConfiguration("workbench");
  let colorCustomizations = workbenchConfiguration.get("colorCustomizations") as any;

  if (color) {
    colorCustomizations["statusBar.background"] = color;
  } else {
    colorCustomizations["statusBar.background"] = null;
  }

  workbenchConfiguration.update("colorCustomizations", colorCustomizations);
}

// 自动设置全局变量
// export function autoSetContextByProject() {
//   vscode.commands.executeCommand("setContext", "mybricks:isComlib", checkIsMybricksProject());
// }


/**
 * 获取工作空间路径
 * @returns 
 */
export function getWorkspaceFsPath () {
  const wsFolders = vscode.workspace.workspaceFolders;

  if (!wsFolders) {
    return;
  };

  const wsFsPath = wsFolders[0]?.uri?.fsPath;

  return wsFsPath;
}

/**
 * 判断是否为mybricks项目
 * 有“*.mybricks.json”文件即可
 * @returns 
 */
export function checkIsMybricksProject() {
  // const wsFolders = vscode.workspace.workspaceFolders;

  // if (!wsFolders) {
  //   return false;
  // }

  const wsFsPath = getWorkspaceFsPath();

  // const wsFsPath = wsFolders[0].uri.fsPath;

  if (!wsFsPath) {
    return false;
  }

  const mybricksFiles = fse.readdirSync(wsFsPath).filter((docName) => {
    return docName.endsWith('mybricks.json');
  });

  if (!mybricksFiles.length) {
    return false;
  }

  return mybricksFiles;

  // const mybricksFilePath = path.join(wsFsPath, "/mybricks.json");

  // if (fse.existsSync(mybricksFilePath)) {
  //   return true;
  // } else {
  //   return false;
  // }
}

export function uuid (): string {
  let text = "";

  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export const opToString = Object.prototype.toString;
export const opIsArray = Array.isArray;

/**
 * 获取json文件内容转对象
 * @param {string} filePath json文件绝对路径
 * @returns 若路径错误或json内容有误，返回空对象
 */
export function readJSONSync<T extends object>(filePath: string): T {
  let rst = {} as T;

  try {
    rst = fse.readJSONSync(filePath);
  } catch (e) { }

  return rst;
}
