import * as vscode from "vscode";
import { getWorkspaceFsPath, checkIsMybricksProject, logger } from "../utils";

export function initListener (context: vscode.ExtensionContext) {
  autoSetContextByProject();

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    autoSetContextByProject();
  });

  // /** 创建文件 */
  // vscode.workspace.onDidCreateFiles((e) => {
  //   const config = e.files[0];
  //   const { fsPath } = config;
  //   if (typeof fsPath === "string" && fsPath.replace(`${workspacePath}/`, "").split("/").length === 1) {
  //     autoSetContextByProject();
  //   }
  // });

  // /** 删除文件 */
  // vscode.workspace.onDidDeleteFiles((e) => {
  //   console.log(e.files, 'onDidDeleteFiles leon');
  // });

  // /** 重命名文件 */
  // vscode.workspace.onDidRenameFiles((e) => {
  //   console.log(e.files, 'onDidRenameFiles leon');
  // });

  // vscode.workspace.onDidRenameFiles((e) => {
  //   console.log(e, 'e onDidRenameFiles')
  // });

  // vscode.workspace.onDidCreateFiles((e) => {
  //   console.log(e, 'e onDidCreateFiles')
  // })

  // vscode.workspace.onDidDeleteFiles((e) => {
  //   console.log(e, 'e onDidDeleteFiles')
  // })

  // // TODO
  // // vscode.window
}

function autoSetContextByProject() {
  const bool = checkIsMybricksProject();
  logger("判断是否mybricks => ", bool, !!bool);
  if (bool) {
    vscode.commands.executeCommand("setContext", "mybricks:isComlib", bool);
  }
}
