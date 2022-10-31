import * as vscode from "vscode";
import { getWorkspaceFsPath, checkIsMybricksProject } from "../utils";

export function initListener (context: vscode.ExtensionContext) {
  autoSetContextByProject();

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    autoSetContextByProject();
  });

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
  vscode.commands.executeCommand("setContext", "mybricks:isComlib", checkIsMybricksProject());
}
