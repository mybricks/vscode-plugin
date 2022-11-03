import * as vscode from "vscode";

import * as path from "path";
import * as fse from "fs-extra";

import { getMybricksConfigJson, setMybricksConfigJson , getWorkspaceFsPath, checkIsMybricksProject } from "../../utils";
// import { getAPIUserGender } from "../config";
// import { Message, CommonMessage } from "./messages/messageTypes";

export type MessageType = "GET";

export interface Message {
  type: MessageType;
  value: any;
}

// export interface CommonMessage extends Message {
//   type: "COMMON";
//   payload: string;
// }

// export interface ReloadMessage extends Message {
//   type: "RELOAD";
// }


export class ViewLoader {
  public static currentPanel?: vscode.WebviewPanel;

  private panel: vscode.WebviewPanel;
  private context: vscode.ExtensionContext;
  private disposables: vscode.Disposable[];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.disposables = [];

    this.panel = vscode.window.createWebviewPanel("publishSettings", "发布配置", vscode.ViewColumn.One, {
      enableScripts: true,
      // retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, "dist", "views"))],
    });

    const iconPath = vscode.Uri.file(this.context.extensionPath + "/images/mybricks.png");

    this.panel.iconPath = {
      dark: iconPath,
      light: iconPath
    };

    // render webview
    this.renderWebview();

    const that = this;

    // listen messages from webview
    this.panel.webview.onDidReceiveMessage(
      (message: Message) => {
        const { type, value } = message;
        const wsFsPath = getWorkspaceFsPath();
        let files: any = checkIsMybricksProject(wsFsPath);

        if (type === "GET") {
          if (Array.isArray(files) && wsFsPath) {
            // const mybricksConfig = vscode.workspace.getConfiguration("mybricks");
            // const componentsPublishConfig: any = mybricksConfig.inspect("components.publishConfig")?.globalValue || {};
            const componentsPublishConfig = getMybricksConfigJson();
            const componentsPublishConfigKeys = Object.keys(componentsPublishConfig);

            files = files.map(file => {
              const configJson = fse.readJSONSync(path.join(wsFsPath, file));

              const index = componentsPublishConfigKeys.findIndex(key => key === file);

              if (index !== -1) {
                componentsPublishConfigKeys.splice(index, 1);
              }

              let filePublishConfig = componentsPublishConfig[file];

              if (!filePublishConfig) {
                filePublishConfig = {token: {key: "", value: ""}};
                componentsPublishConfig[file] = filePublishConfig;
              }

              return {
                key: file,
                value: {
                  publishApi: configJson.publishApi,
                  publishConfig: filePublishConfig
                }
              };
            });

            componentsPublishConfigKeys.forEach(key => {
              Reflect.deleteProperty(componentsPublishConfig, key);
            });

            setMybricksConfigJson(componentsPublishConfig);

            // mybricksConfig.update("components.publishConfig", componentsPublishConfig, vscode.ConfigurationTarget.Global);
          }

          that.panel.webview.postMessage({
            type: "GET",
            value: files
          });
        } else if (type === "POST") {
          const { key, value: config } = value;

          if (Array.isArray(files) && wsFsPath) {
            const hasFile = files.find(file => file === key);

            if (hasFile) {
              const { publishApi, publishConfig } = config;
              const configJsonPath = path.join(wsFsPath, key);
              const configJson = fse.readJSONSync(configJsonPath);

              configJson.publishApi = publishApi;
              fse.writeFileSync(configJsonPath, JSON.stringify(configJson, null, 2));

              // const mybricksConfig = vscode.workspace.getConfiguration("mybricks");
              // const componentsPublishConfig: any = mybricksConfig.inspect("components.publishConfig")?.globalValue || {};

              const componentsPublishConfig = getMybricksConfigJson();

              componentsPublishConfig[key].token = publishConfig.token;

              setMybricksConfigJson(componentsPublishConfig);
              // mybricksConfig.update("components.publishConfig", componentsPublishConfig, vscode.ConfigurationTarget.Global);
            }
          }

          vscode.window.showInformationMessage("修改成功");

          that.panel.webview.postMessage({
            type: "POST",
            value: true
          });
        }
      },
      null,
      this.disposables
    );

    this.panel.onDidDispose(
      () => {
        this.dispose();
      },
      null,
      this.disposables
    );
  }

  private renderWebview() {
    const html = this.render();
    this.panel.webview.html = html;
  }

  static showWebview(context: vscode.ExtensionContext) {
    const cls = this;
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;
    if (cls.currentPanel) {
      cls.currentPanel.reveal(column);
    } else {
      cls.currentPanel = new cls(context).panel;
    }
  }

  static postMessageToWebview<T extends Message = Message>(message: T) {
    // post message from extension to webview
    const cls = this;
    cls.currentPanel?.webview.postMessage(message);
  }

  public dispose() {
    ViewLoader.currentPanel = undefined;

    // Clean up our resources
    this.panel.dispose();

    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  render() {
    const bundleScriptPath = this.panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, "dist", "views/explorerSettings.js"))
    );

    return `
      <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>React App</title>
        </head>
    
        <body>
          <div id="root"></div>
          <script>
            const vscode = acquireVsCodeApi();
          </script>
          <script src="${bundleScriptPath}"></script>
        </body>
      </html>
    `;
  }
}
