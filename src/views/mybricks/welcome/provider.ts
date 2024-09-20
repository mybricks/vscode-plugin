import * as vscode from "vscode";

import * as fse from "fs-extra";
import { uuid, getWorkspaceFsPath, checkIsMybricksProject } from "../../../utils";

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
      switch (true) {
        case data.action === "create" && data.type === "pcComlib": {

          const saveRtn = await vscode.window.showSaveDialog({
            title: "请选择项目要保存的文件夹"
          });

          const projectDir = saveRtn?.fsPath;

          if (projectDir) {
            const tptDirPath = vscode.Uri.joinPath(this._context.extensionUri, "_templates/comlib-pc").fsPath;

            fse.copySync(tptDirPath, projectDir);

            openFolder(projectDir);
          }
        }
          break;
        case data.action === "create" && data.type === "pcComlib-vue3": {

          const saveRtn = await vscode.window.showSaveDialog({
            title: "请选择项目要保存的文件夹"
          });

          const projectDir = saveRtn?.fsPath;

          if (projectDir) {
            const tptDirPath = vscode.Uri.joinPath(this._context.extensionUri, "_templates/comlib-pc-vue3").fsPath;

            fse.copySync(tptDirPath, projectDir);

            openFolder(projectDir);
          }
        }
          break;
        
        case data.action === "create" && data.type === "h5VueComlib": {
          const saveRtn = await vscode.window.showSaveDialog({
            title: "请选择项目要保存的文件夹"
          });

          const projectDir = saveRtn?.fsPath;

          if (projectDir) {
            const tptDirPath = vscode.Uri.joinPath(this._context.extensionUri, "_templates/comlib-h5-vue").fsPath;

            fse.copySync(tptDirPath, projectDir);

            openFolder(projectDir);
          }
        }
          break;

        case data.action === "openDir": 
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
    // const wsFsPath = getWorkspaceFsPath();
    // const mybricksConfig = vscode.workspace.getConfiguration("mybricks");
    // const recentProjectPaths = JSON.stringify(mybricksConfig.inspect("recentProjectPaths")?.globalValue || []);

    const wsFsPath = getWorkspaceFsPath();
    const switchBool = checkIsMybricksProject(wsFsPath);
    
    let recentProjectPaths: string[] | string = [];

    if (wsFsPath) {
      // 表示进入了mybricks项目，记录global settings.json
      const mybricksConfig = vscode.workspace.getConfiguration("mybricks");

      recentProjectPaths = (mybricksConfig.inspect("recentProjectPaths")?.globalValue || []) as string[];

      if (switchBool) {
        const wsFsPathIndex = recentProjectPaths.findIndex(recentProject => recentProject === wsFsPath);

        if (wsFsPathIndex === -1) {
          // 取最近的十个
          if (recentProjectPaths.length > 9) {
            recentProjectPaths.pop();
          }
        } else {
          recentProjectPaths.splice(wsFsPathIndex, 1);
        }

        recentProjectPaths.unshift(wsFsPath);
      }

      // 过滤失效的地址（移动了位置、修改了名字）
      recentProjectPaths = recentProjectPaths.filter(recentProjectPath => {
        return checkIsMybricksProject(recentProjectPath);
      });

      mybricksConfig.update("recentProjectPaths", recentProjectPaths, vscode.ConfigurationTarget.Global);
    }

    recentProjectPaths = JSON.stringify(recentProjectPaths);
    
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
              vscode.setState({
                recentProjectPaths: ${recentProjectPaths},
                currentProjectPath: "${wsFsPath}"
              });
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
