import * as vscode from "vscode";
import * as fse from 'fs-extra';
import * as path from 'path';
import { updateStatusBar } from "../statusBar";
import { WORKSPACE_STATUS } from "../constants";
import { build, tempPath, startServer } from '../scripts/_comlib-build';

export default async function () {
  vscode.window.showInformationMessage("开启调试");

  //修改 statusBar 状态
  updateStatusBar(WORKSPACE_STATUS.DEBUG);

  //修改 button 状态



  //执行开启调试
  const wsFolders = vscode.workspace.workspaceFolders;
  if (wsFolders) {
    const docPath = wsFolders[0].uri.fsPath;
    const configName = 'mybricks.json';
    const { id, editJS } = build(docPath, configName);
    const editJSPath = path.join(tempPath, `${id.replace(/@|\//gi, '_')}.js`);
    fse.writeFileSync(editJSPath, editJS);
    await startServer(editJSPath);
  }

}