import { readJsonSync } from 'fs-extra';
import * as vscode from "vscode";

import start from "./start";
import * as path from "path";
import * as cp from "child_process";

import { registerCommand, showInformationMessage } from "../../utils";

const terminalName = "mybricks.publish.comlib";

export class PublishCommands {

  private _resove: any;

  constructor (private readonly _context: vscode.ExtensionContext) {
    const { subscriptions } = this._context;

    subscriptions.push(
      registerCommand("mybricks.publish.start", this.start.bind(this))
    );
  }

  async start () {
    if (this._resove) {
      showInformationMessage("组件库正在发布中，请稍后再试...");
      return;
    }

    const config = await start();

    if (config) {
      const {
        // token: configToken,
        docPath,
        configName,
        publishType
      } = config;

      const terminals = vscode.window.terminals;
  
      let devTerminal = terminals.find(terminal => terminal.name === terminalName);

      if (!devTerminal) {
        /** 
         * TODO
         * 1.新建terminal后等待webpack进程启动再呈现“调试中...”按钮
         */
        devTerminal = vscode.window.createTerminal(terminalName);
      }

      // this.devTerminal = devTerminal;

      const projPath = vscode.Uri.file(this._context.extensionPath).path;
      const filename = (docPath + configName).replace(/@|\//gi, "_");
      const libCfg = readJsonSync(path.join(docPath, configName));

      if (publishType === 'dist') {
        let cmd = 'publish:comlib';
        // 针对搭建产物为node的组件库
        if(libCfg?.target === 'node') {
          cmd = 'publish:comlib-node';
          showInformationMessage("编译目标为node..."); 
        }
        devTerminal.sendText(`node ${projPath}/_scripts/generateCodePublish.js docPath=${docPath} configName=${configName} && export filename=${filename} && npm run --prefix ${projPath} ${cmd}`);
      } else {
        devTerminal.sendText(`export mybricksJsonPath=${path.resolve(docPath, configName)} && npm run --prefix ${projPath} publish:single-component`);
      }

      devTerminal.show();

      // showInformationMessage("组件库发布中...");

      // vscode.window.withProgress({
      //   location: vscode.ProgressLocation.Notification,
      //   title: `组件库发布(${configName})`,
      //   cancellable: true
      // }, (progress, token) => {
      //   const child = cp.fork(vscode.Uri.joinPath(this._context.extensionUri, "_scripts", "comlib-publish.js").path, [docPath, configName, JSON.stringify(configToken)], {
      //     silent: true
      //   });

      //   token.onCancellationRequested(() => {
      //     // 手动取消？
      //     cp.spawn("kill", [String(child.pid)]);
      //     this.stop();
      //   });
  
      //   const rstPromise = new Promise<void>(resolve => {
      //     this._resove = resolve;

      //     child.on("message", (obj: {
      //       code: -1 | 0 | 1;
      //       message: string;
      //       relativePath: string;
      //     }) => {
      //       const { code, message, relativePath } = obj;

      //       switch (code) {
      //         case -1:
      //           // error
      //           vscode.window.showWarningMessage(message);
      //           this.stop();
      //           break;
      //         case 0:
      //           // loading
      //           progress.report({message: typeof message === 'string' ? message : JSON.stringify(message)});
      //           break;
      //         case 1:
      //           // success
      //           vscode.window.showInformationMessage(message);
      //           // vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.Uri.file(path.join(docPath, relativePath)))).then((document) => {
      //           //   vscode.window.showTextDocument(document);
      //           // });
      //           this.stop();
      //           break;
      //         default:
      //           break;
      //       }
      //     });
      //   });
  
      //   return rstPromise;
      // });
    }
  }

  async stop () {
    this._resove();

    this._resove = null;
  }
}
