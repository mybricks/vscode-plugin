import * as path from 'path'
import * as fse from 'fs-extra';
import * as vscode from 'vscode';


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
  const workbenchConfiguration = vscode.workspace.getConfiguration('workbench');
  let colorCustomizations = workbenchConfiguration.get('colorCustomizations') as any;

  if (color) {
    colorCustomizations["statusBar.background"] = color;
  } else {
    colorCustomizations["statusBar.background"] = null;
  }

  workbenchConfiguration.update('colorCustomizations', colorCustomizations);
}

// 自动设置全局变量
export function autoSetContextByProject() {
  vscode.commands.executeCommand('setContext', 'mybricks:isComlib', checkIsMybricksProject());
}

export function checkIsMybricksProject() {
  const wsFolders = vscode.workspace.workspaceFolders;
  if (!wsFolders) {
    return false;
  }

  const wsFsPath = wsFolders[0].uri.fsPath;
  const mybricksFilePath = path.join(wsFsPath, '/mybricks.json');

  if (fse.existsSync(mybricksFilePath)) {
    return true;
  } else {
    return false;
  }
}


export function getWorkspacePath() {
  const uri = vscode.workspace.workspaceFolders?.[0]?.uri;
  return uri;
}

export const opToString = Object.prototype.toString;
export const opIsArray = Array.isArray;

/**
 * 获取json文件内容转对象
 * @param {string} filePath json文件绝对路径
 * @returns 若路径错误或json内容有误，返回空对象
 */
export function getJsonFile<T extends object>(filePath: string): T {
  let rst = {} as T;

  try {
    rst = fse.readJSONSync(filePath);
  } catch (e) { }

  return rst;
}
