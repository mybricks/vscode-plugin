import * as vscode from "vscode";
import Provider from "./provider";

class Develop {
  private _context: vscode.ExtensionContext | undefined;

  constructor () {}

  init (context: vscode.ExtensionContext) {
    this._context = context;

    const { subscriptions } = context;
    const debuggerPanel = new Provider(context);

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
      })
    );
  }
}

export const developExplorer = new Develop();
