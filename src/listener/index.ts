import * as vscode from "vscode";
import { checkIsMybricksProject } from "../utils";

export function initListener (context: vscode.ExtensionContext) {
  autoSetContextByProject();

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    autoSetContextByProject();
  });
}

function autoSetContextByProject() {
  vscode.commands.executeCommand("setContext", "mybricks:isComlib", checkIsMybricksProject());
}
