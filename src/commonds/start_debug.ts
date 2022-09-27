import * as vscode from "vscode";
import { updateStatusBar } from "../statusBar";

export default function () {
  vscode.window.showInformationMessage("start!");
  // updateStatusBar(true);

  const r = vscode.window.createOutputChannel('a')
  r.show();
  r.appendLine('ssss');
}