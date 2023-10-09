import * as vscode from "vscode";
import Provider from "./provider";

import { ImportCom } from "./import-com";

class Develop {
  private _context: vscode.ExtensionContext | undefined;

  constructor () {}

  init (context: vscode.ExtensionContext) {
    this._context = context;

    const { subscriptions } = context;
    const debuggerPanel = new Provider(context);

    const importCom = new ImportCom({ context, getWebview: () => debuggerPanel.webview });

    subscriptions.push(
      vscode.commands.registerCommand("mybricks.debugger.dev", () => {
        context.globalState.update("debuggerStatus", "dev");
        debuggerPanel.webview.postMessage({ action: "dev" });
      }),
      vscode.commands.registerCommand("mybricks.debugger.check", () => {
        context.globalState.update("debuggerStatus", "check");
        debuggerPanel.webview.postMessage({ action: "check" });
      }),
      vscode.commands.registerCommand("mybricks.debugger.debug", () => {
        context.globalState.update("debuggerStatus", "debug");
        debuggerPanel.webview.postMessage({ action: "debug" });
      }),
      vscode.window.registerWebviewViewProvider("mybricks_develop", debuggerPanel, {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }),
      vscode.commands.registerCommand("mybricks.import.com", (uri: vscode.Uri) => {
        importCom.import(uri?.fsPath);
      }),
    );
  }
}

export const developExplorer = new Develop();
