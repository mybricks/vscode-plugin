import * as vscode from "vscode";
import * as path from 'path';
import { parse } from 'vue-docgen-api';
import genComFolder from "./gen-com-folder";

export class ImportCom {
  private _context: vscode.ExtensionContext | undefined;
  _getWebview: () => vscode.Webview;

  constructor({ context, getWebview }: { context: vscode.ExtensionContext, getWebview: () => vscode.Webview }) {
    this._context = context;
    this._getWebview = getWebview;
  }


  async import (selectFolderPath) {
    const importWay = await vscode.window.showQuickPick(['选择Vue单文件组件导入'], {
      placeHolder: '选择导入方式',
    });

    if (importWay !== '选择Vue单文件组件导入') {
      return;
    }

    const file = await this.selectFile();
    if (!file) {
      return;
    }

    const schema = await this.parseVue2File(file.path);
    schema.filePath = file.path;

    const namespace = await this.getComNamespace(schema);
    schema.namespace = namespace;

    let savePath = await this.getSaveFolderPath(selectFolderPath, schema);

    // 第一次没有存储位置重试一下
    if (!savePath) {
      const action = await vscode.window.showInformationMessage('请先配置组件存储的位置', { modal: true }, '去配置');
      if (action === '去配置') {
        const folderPath = await ImportCom.selectAndSetSaveFolderPath(this._context, this._getWebview());
        savePath = await this.getSaveFolderPath(folderPath, schema);
      } else {
        return;
      }
    }

    if (!savePath) {
      return;
    }

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "生成组件中...",
    }, async (progress, token) => {
      return await genComFolder(savePath, { schema });
    });
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

    const configSaveFolderPath = this._context.workspaceState.get('mybricks.import.com.saveFolderPath');

    switch (true) {
      case !!selectFolderPath: { // 从右键菜单导入，以右键菜单为存储空间
        targetFolderPath = path.join(selectFolderPath, folderName);
        break;
      }
      // case !selectFolderPath && !configSaveFolderPath: { // 从左下角按钮进入，未配置存储路径
      //   const result = await vscode.window.showSaveDialog({
      //     defaultUri:  vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0]?.uri, `./${folderName}`),
      //     title: '存储组件到...'
      //   });
      //   targetFolderPath = result?.fsPath ?? '';
      //   break;
      // }
      case !selectFolderPath && !!configSaveFolderPath: { // 从左下角按钮进入，配置了存储路径
        targetFolderPath = path.join(configSaveFolderPath as string, folderName);
      }
    }

    return targetFolderPath;
  }


  static async selectAndSetSaveFolderPath (context: vscode.ExtensionContext, webview: vscode.Webview) {
    const files = await vscode.window.showOpenDialog({
      defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri,
      filters: {
        'All files (*.*)': [`*.*`]
      },
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: '选择存储位置',
      title: '选择一个文件夹用于存储组件'
    });

    if (!files[0]?.fsPath) {
      throw new Error('setting save folder path cancel');
    }
    context.workspaceState.update('mybricks.import.com.saveFolderPath', files[0]?.fsPath);
    webview.postMessage({ action: "setSaveFolder", value: files[0]?.fsPath });

    return files[0]?.fsPath;
  }
}
