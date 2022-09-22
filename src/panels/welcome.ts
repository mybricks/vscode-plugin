/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */

import * as vscode from "vscode";

import * as fse from 'fs-extra';

export class WelcomePanelProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "create": {
          const saveRtn = await vscode.window.showSaveDialog({
            title: "请选择项目要保存的文件夹",

            //canSelectFolders: true,
            //canSelectFiles: false,
            //canSelectMany: false,
          });

          const projectDir = saveRtn?.fsPath
          if(projectDir){
            const tptDirPath = vscode.Uri.joinPath(this._extensionUri, "_templates/comlib-pc").fsPath;

            console.log(projectDir,tptDirPath);


            fse.copySync(tptDirPath,projectDir);
  
            const newUrl = vscode.Uri.parse(projectDir);
            vscode.commands.executeCommand(`vscode.openFolder`, newUrl,true);
          }
          break;
        }
      }
    });
  }

  public addColor() {
    if (this._view) {
      this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
      this._view.webview.postMessage({ type: "addColor" });
    }
  }

  public clearColors() {
    if (this._view) {
      this._view.webview.postMessage({ type: "clearColors" });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "_assets", "panel-welcome.js")
    );

    const styleViewUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "_assets", "view.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleViewUri}" rel="stylesheet">
			</head>
			<body>
				<button class="button-new" data-type='pcComLib'>新建 PC组件库</button>
                <button class="button-new" data-type='plugin'>新建 插件</button>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
