import * as vscode from "vscode";

import {  getWorkspaceFsPath, checkIsMybricksProject } from "../../utils";

export default async function start () {
  const mybricksJsonFiles = checkIsMybricksProject();
  const docPath = getWorkspaceFsPath();

  if (!docPath || !mybricksJsonFiles) {
    vscode.window.showInformationMessage(!docPath ? "未打开工程目录" : "缺失*mybricks.json配置文件");
    return false;
  }

  let mybricksJsonName;

  if (mybricksJsonFiles) {
    if (mybricksJsonFiles.length > 1) {
      mybricksJsonName = await vscode.window.showQuickPick(mybricksJsonFiles, {
        placeHolder: "请选择配置文件"
      }); 
    } else {
      mybricksJsonName = mybricksJsonFiles[0];
    }
  }

  if (!mybricksJsonName) {
    return false;
  }

  return {
    docPath,
    configName: mybricksJsonName
  };
}
