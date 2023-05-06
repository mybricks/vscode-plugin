import * as vscode from "vscode";

import { getMybricksConfigJson, getWorkspaceFsPath, checkIsMybricksProject } from "../../utils";

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

  let publishType: any = await vscode.window.showQuickPick([
    {label: "组件库产物保存至本地dist文件夹内", value: "dist"},
    {label: "发布至物料中心，需在配置文件内正确配置平台地址（domain）", value: "material"}
  ], {
    placeHolder: "请选择发布方式",
  });

  if (!publishType) {
    return false;
  }

  publishType = publishType.value;



  // const mybricksConfig = vscode.workspace.getConfiguration("mybricks");
  // const componentsPublishConfig: any = mybricksConfig.inspect("components.publishConfig")?.globalValue || {};

  // const componentsPublishConfig = getMybricksConfigJson();
  // const token = componentsPublishConfig[mybricksJsonName]?.token || {};

  return {
    // token,
    docPath,
    publishType,
    configName: mybricksJsonName
  };
}
