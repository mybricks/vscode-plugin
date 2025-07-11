import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { View } from './view';

class AppConfig {
  private _context: vscode.ExtensionContext | undefined;

  constructor () {}

  async init (context: vscode.ExtensionContext) {
    this._context = context;

    const appConfigDirPath = path.join(this._context.globalStorageUri.fsPath, "appConfig");
    const appConfigWebpcakJsPath = path.join(appConfigDirPath, "webpack.js");
    const appConfigApplicationJsxPath = path.join(appConfigDirPath, "application.jsx");

    try {
      await fs.promises.access(appConfigDirPath, fs.constants.F_OK);
      // 文件已存在
    } catch {
      // 文件不存在，创建一个空文件或写入初始内容
      await fs.promises.mkdir(appConfigDirPath, { recursive: true });
    }

    try {
      await fs.promises.access(appConfigWebpcakJsPath, fs.constants.F_OK);
      // 文件已存在
    } catch {
      // 文件不存在，创建一个空文件或写入初始内容
      await fs.promises.writeFile(appConfigWebpcakJsPath, "module.exports = {}", "utf-8");
    }

    try {
      await fs.promises.access(appConfigApplicationJsxPath, fs.constants.F_OK);
      // 文件已存在
    } catch {
      // 文件不存在，创建一个空文件或写入初始内容
      await fs.promises.writeFile(appConfigApplicationJsxPath, "export default {}", "utf-8");
    }

    new View(context, {
      'webpack.js': {
        path: vscode.Uri.file(appConfigWebpcakJsPath)
      },
      'application.jsx': {
        path: vscode.Uri.file(appConfigApplicationJsxPath)
      }
    });
  }
}

export const appConfigExplorer = new AppConfig();
