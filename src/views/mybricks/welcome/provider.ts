import * as vscode from "vscode";

import * as fse from "fs-extra";
import { uuid } from "../../../utils";

export default class Provider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    const { subscriptions } = this._context;
    
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.action) {
        case "create": {
          const saveRtn = await vscode.window.showSaveDialog({
            title: "请选择项目要保存的文件夹",
            //canSelectFolders: true,
            //canSelectFiles: false,
            //canSelectMany: false,
          });

          const projectDir = saveRtn?.fsPath;

          if (projectDir) {
            const tptDirPath = vscode.Uri.joinPath(this._context.extensionUri, "_templates/comlib-pc").fsPath;
            console.log(projectDir, tptDirPath);
            fse.copySync(tptDirPath, projectDir);
            const newUrl = vscode.Uri.parse(projectDir);
            vscode.commands.executeCommand(`vscode.openFolder`, newUrl, true);
          }
          break;
        }
      }
    }, null, subscriptions);

    webviewView.onDidDispose(() => {
      //
    },
    null,
    subscriptions);
  }

  get webview () {
    return (this._view as vscode.WebviewView).webview;
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._context.extensionUri, "dist", "views/mybricksWelcome.js")
    );
    const nonce = uuid();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
        <body>
            <div id="root"></div>
            <script nonce="${nonce}">
              const vscode = acquireVsCodeApi();
            </script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
	    </html>`;
  }
}
