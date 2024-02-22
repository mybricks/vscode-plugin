import * as vscode from "vscode";
import * as path from 'path';
// import { parse } from 'vue-docgen-api';
import genComFolder from "./gen-com-folder";

// import Provider from "./provider";

class CreateCom {
  private _context: vscode.ExtensionContext | undefined;

  constructor () {}

  dirPath: string;

  init (context: vscode.ExtensionContext) {
    this._context = context;

    const { subscriptions } = context;
    // const welcomePanel = new Provider(context);

    subscriptions.push(
      // vscode.commands.registerCommand("mybricks.import.com", (uri: vscode.Uri) => {
      //   const selectFolderPath = uri?.fsPath;

      //   ;(async () => {

      //     const importWay = await vscode.window.showQuickPick(['选择Vue单文件组件导入'], {
      //       placeHolder: '选择导入方式',
      //     });

      //     if (importWay !== '选择Vue单文件组件导入') {
      //       return;
      //     }

      //     const file = await this.selectFile();
      //     if (!file) {
      //       return;
      //     }

      //     const schema = await this.parseVue2File(file.path);
      //     schema.filePath = file.path;

      //     const namespace = await this.getComNamespace(schema);
      //     schema.namespace = namespace;

      //     const savePath = await this.getSaveFolderPath(selectFolderPath, schema);

      //     if (!savePath) {
      //       return;
      //     }

      //     await vscode.window.withProgress({
      //       location: vscode.ProgressLocation.Notification,
      //       title: "生成组件中...",
      //     }, async (progress, token) => {
      //       return await genComFolder(savePath, { schema });
      //     });
          
      //   })();
      
      //   // welcomePanel.webview.postMessage({ action: "invalidAddress", value: dirName });
      // }),
      // vscode.commands.registerCommand("mybricks.open.url", () => {
      //   const panel = vscode.window.createWebviewPanel(
      //     'mybricks',
      //     'mybricks',
      //     vscode.ViewColumn.One,
      //     {
      //       enableScripts: true
      //     }
      //   );

      //   panel.title = 'mybricks';
      //   panel.webview.html = `
      //     <!DOCTYPE html>
      //     <html lang="en">
      //     <head>
      //         <meta charset="UTF-8">
      //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
      //         <title>Cat Coding</title>
      //     </head>
      //     <body>
      //       <iframe style="width: 100vw; height: 100vh;" src="http://localhost:8009" />
      //     </body>
      //     </html>
      //   `
      // })
    );
  }

  async selectFile ({ extName = 'vue' } = {}) {
    const files = await vscode.window.showOpenDialog({
      defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri,
      filters: {
        'All files (*.*)': [`*.${extName}`]
      },
      canSelectFolders: false,
      canSelectFiles: true,
      canSelectMany: false,
      openLabel: '导入组件',
      title: '选择一个Vue文件用于导入'
    });
    return files?.[0];
  }

  async parseVue2File (filePath: string) {
    const regex = /\/([^.\/]+)\.\w+$/;
    const match = filePath.match(regex);
    const filename = match?.[1];

    let schema: any = {
      filename,
    };

    try {
      let result = await parse(filePath);
      schema = {
        ...schema,
        ...result,
      };
    } catch (error) {
      console.log(error)
    }
    return schema;
  }

  async getComNamespace (schema) {
    let namespace = schema?.displayName;

    if (!namespace) {
      namespace = await vscode.window.showInputBox({
        placeHolder: '当前组件没有定义name，请输入组件名称，英文和中划线表示'
      });
    }

    return namespace.toLowerCase();
  }

  async getSaveFolderPath (selectFolderPath, schema) {
    const folderName = schema?.namespace.toLowerCase();

    let targetFolderPath = '';

    if (selectFolderPath) {
      targetFolderPath = path.join(selectFolderPath, folderName);
    } else {
      const result = await vscode.window.showSaveDialog({
        defaultUri:  vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0]?.uri, `./${folderName}`),
        title: '存储组件到...'
      });
      targetFolderPath = result?.fsPath ?? '';
    }

    return targetFolderPath;
  }
}

export const createComMybricks = new CreateCom();
