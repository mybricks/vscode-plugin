import * as vscode from "vscode";

import * as fse from "fs-extra";
import { uuid, getWorkspaceFsPath } from "../../../utils";

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
        case "create":
          const saveRtn = await vscode.window.showSaveDialog({
            title: "请选择项目要保存的文件夹"
          });

          const projectDir = saveRtn?.fsPath;

          if (projectDir) {
            const tptDirPath = vscode.Uri.joinPath(this._context.extensionUri, "_templates/comlib-pc").fsPath;

            fse.copySync(tptDirPath, projectDir);

            openFolder(projectDir);
          }
          break;
        case "openDir": 
          const { value } = data;

          if (!openFolder(value)) {
            vscode.commands.executeCommand("mybricks.welcome.invalidAddress", value);
          }
          break;
        default:
          break;
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
    const wsFsPath = getWorkspaceFsPath();
    const mybricksConfig = vscode.workspace.getConfiguration("mybricks");
    // 过滤当前打卡目录
    const recentProjectPaths = JSON.stringify(((mybricksConfig.inspect("recentProjectPaths")?.globalValue || []) as string[]).filter(recentProjectPath => recentProjectPath !== wsFsPath));
    
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
              vscode.setState({recentProjectPaths: ${recentProjectPaths}});
            </script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
	    </html>`;
  }
}

/**
 * 打开文件夹
 * @param {string} dirPath 文件夹地址
 */
function openFolder (dirPath: string): boolean {
  if (fse.existsSync(dirPath)) {
    const url = vscode.Uri.parse(dirPath);

    vscode.commands.executeCommand(`vscode.openFolder`, url, true);

    return true;
  }
  
  vscode.window.showWarningMessage(`打开文件目录(${dirPath})失败`);

  return false;
}
