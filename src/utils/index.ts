import * as vscode from "vscode";
import * as path from 'path'
import * as fse from 'fs-extra';


export function logger(...args: any) {
  console.log("==========");
  console.error("[Mybricks]", ...args);
  console.log("==========");
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

  const wsPath = wsFolders[0].uri.path;
  const wsFsPath = wsFolders[0].uri.fsPath;
  const mybricksFilePath = path.join(wsFsPath, '/mybricks.json');

  if (fse.existsSync(mybricksFilePath)) {
    return true
  } else {
    return false;
  }
}


export function getWorkspacePath() {
  const uri = vscode.workspace.workspaceFolders?.[0]?.uri;
  return uri;
}

