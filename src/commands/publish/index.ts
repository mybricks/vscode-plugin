import { readJsonSync } from 'fs-extra';
import * as vscode from "vscode";
import { window } from "vscode";

import * as os from "os";
import * as fse from 'fs-extra';
import start from "./start";
import * as path from "path";
import * as cp from "child_process";

import { registerCommand, showInformationMessage } from "../../utils";
import { configValidCheck, publishConfigValidCheck } from './../../utils/validCheck';

const terminalName = "mybricks.publish.comlib";
const isWindows = os.platform() === "win32";

function getSafePath(value: string) {
  if (isWindows) {
    return value.replace(/\\/g, '\\\\');
  }
  return value;
}

export class PublishCommands {

  private _resove: any;

  constructor (private readonly _context: vscode.ExtensionContext) {
    const { subscriptions } = this._context;

    subscriptions.push(
      registerCommand("mybricks.publish.start", this.start.bind(this))
    );
  }

  async start () {
    const config = await start();

    configValidCheck(config);
    // publishConfigValidCheck(config);

    if (config) {
      const { configName, docPath, materialType, publishType } = config;
      let devTerminal = window.terminals.find(terminal => terminal.name === terminalName);
      if (!devTerminal) {
        devTerminal = window.createTerminal(terminalName);
      }
      const filename = (docPath + configName).replace(/@|\//gi, "_");
      const libCfg = readJsonSync(path.join(docPath, configName));
      const projPath = this._context.extensionPath;
      const mybricksJsonPath = path.resolve(docPath, configName);
      const mybricksJson = fse.readJSONSync(mybricksJsonPath);
      const buildTempPath = path.resolve(projPath, './_scripts/componentLibrary/dev/newScripts/_buildTemp');
      if (!fse.existsSync(buildTempPath)) {
        fse.mkdirSync(buildTempPath);
      }
      const pattern = /[^a-zA-Z0-9]+/g;
      const replacement = '_';
      const result = mybricksJsonPath.replace(pattern, replacement) + '.js';
      const webpackbuildjsPath = path.resolve(buildTempPath, result);
      let tags = 'react';

      switch (mybricksJson.tags) {
        case 'vue':
        case 'vue2':
        case 'vue3':
          tags = 'vue';
          break;
        default:
          break;
      }

      if (libCfg?.componentType === 'MP') {
        if (publishType === "dist") {
          devTerminal.sendText(`npx mybricks build --mybricksJsonPath ${mybricksJsonPath}`);
          devTerminal.show();
        } else if (publishType === "material") {
          devTerminal.sendText(`node ${projPath}/_scripts/publishmp.js ${mybricksJsonPath}`);
          devTerminal.show();
        } else {
          vscode.window.showInformationMessage(`未支持的发布模式 - ${publishType}`);
        }
        return;
      } else if (libCfg?.componentType === "HM") {
        if (publishType === "dist") {
          devTerminal.sendText(`npx mybricks buildComlib --mybricksJsonPath ${mybricksJsonPath}`);
          devTerminal.show();
        } else if (publishType === "material") {
          devTerminal.sendText(`npx mybricks buildComlib --mybricksJsonPath ${mybricksJsonPath} --customVersion nextVersion && node ${projPath}/_scripts/getOnlineInfo.js ${mybricksJsonPath} && npx mybricks publish2 --mybricksJsonPath ${mybricksJsonPath} --customVersion nextVersion`);
          devTerminal.show();
        } else {
          vscode.window.showInformationMessage(`未支持的发布模式 - ${publishType}`);
        }
        return;
      }

      const webpackbuildjs = fse.readFileSync(path.resolve(projPath, `./_scripts/componentLibrary/dev/newScripts/build.${tags}.${materialType}.js`), 'utf-8');
      
      // 编写webpack
      // 
      // react
      // 组件库 com_lib 进行中
      // 组件 component
      // vue2
      // 组件库 com_lib
      // 组件 component

      fse.writeFileSync(
        webpackbuildjsPath,
        webpackbuildjs
          .replace('--replace-docPath--', getSafePath(docPath))
          .replace('--replace-configName--', configName)
          .replace('--publish-type--', publishType),
        'utf-8'
      );

      if(['node', 'nodejs'].includes(libCfg?.target)) {
        showInformationMessage("编译目标为node...");
        devTerminal.sendText(`node ${projPath}/_scripts/generateCodePublish.js docPath=${docPath} configName=${configName} && export filename=${filename} && npm run --prefix ${projPath} ${'publish:comlib-node'}`);
      } else {
        devTerminal.sendText(`npm run --prefix ${projPath} publish:any ${webpackbuildjsPath}`);
      }

      devTerminal.show();
    }
  }

  async start2 () {
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

      // const projPath = vscode.Uri.file(this._context.extensionPath).path;
      const filename = (docPath + configName).replace(/@|\//gi, "_");
      const libCfg = readJsonSync(path.join(docPath, configName));

      const projPath = this._context.extensionPath;
      const mybricksJsonPath = path.resolve(docPath, configName);
      const mybricksJson = fse.readJSONSync(mybricksJsonPath);
      const buildTempPath = path.resolve(projPath, './_scripts/componentLibrary/dev/scripts/_buildTemp');
      // webpack.new.build.js
      if (!fse.existsSync(buildTempPath)) {
        fse.mkdirSync(buildTempPath);
      }
      const pattern = /[^a-zA-Z0-9]+/g;
      const replacement = '_';
      const result = mybricksJsonPath.replace(pattern, replacement) + '.js';
      const webpackbuildjsPath = path.resolve(buildTempPath, result);
      const webpackbuildjsRtPath = webpackbuildjsPath.replace('.js', '.rt.js');
      const webpackbuildjs = fse.readFileSync(path.resolve(projPath, './_scripts/componentLibrary/dev/scripts/webpack.new.build.js'), 'utf-8');
      const webpackbuildRtjs = fse.readFileSync(path.resolve(projPath, './_scripts/componentLibrary/dev/scripts/webpack.new.build.rt.js'), 'utf-8');
      fse.writeFileSync(
        webpackbuildjsPath,
        webpackbuildjs
          .replace('--replace-docPath--', getSafePath(docPath))
          .replace('--replace-configName--', configName),
        'utf-8'
      );
      fse.writeFileSync(
        webpackbuildjsRtPath,
        webpackbuildRtjs
          .replace('--replace-docPath--', getSafePath(docPath))
          .replace('--replace-configName--', configName),
        'utf-8'
      );

      if (libCfg?.componentType === 'MP') {
        vscode.window.showInformationMessage(`暂时没有提供该类型组件的发布能力，加速开发中...`);
        return;
      }

      if (publishType === 'dist') {
        let cmd = 'publish:comlib';
        // 针对搭建产物为node的组件库
        if(['node', 'nodejs'].includes(libCfg?.target)) {
          cmd = 'publish:comlib-node';
          showInformationMessage("编译目标为node...");
          devTerminal.sendText(`node ${projPath}/_scripts/generateCodePublish.js docPath=${docPath} configName=${configName} && export filename=${filename} && npm run --prefix ${projPath} ${cmd}`);
        } else {
          devTerminal.sendText(`npm run --prefix ${projPath} ${cmd} ${webpackbuildjsPath}; npm run --prefix ${projPath} ${cmd} ${webpackbuildjsRtPath}`);
        }
        // devTerminal.sendText(`node ${projPath}/_scripts/generateCodePublish.js docPath=${docPath} configName=${configName} && export filename=${filename} && npm run --prefix ${projPath} ${cmd}`);
        // devTerminal.sendText(`npm run --prefix ${projPath} ${cmd} ${webpackbuildjsPath}; npm run --prefix ${projPath} ${cmd} ${webpackbuildjsRtPath}`);
        // devTerminal.sendText(`node ${projPath}/node_modules/webpack/bin/webpack.js --config ${webpackbuildjsPath}; node ${projPath}/node_modules/webpack/bin/webpack.js --config ${webpackbuildjsRtPath}`);
      } else {
        // webpack.build-single-component
        const webpackbuildjs = fse.readFileSync(path.resolve(projPath, './_scripts/componentLibrary/dev/scripts/webpack.build-single-component.new.js'), 'utf-8');
        fse.writeFileSync(
          webpackbuildjsPath,
          webpackbuildjs
            .replace('--replace-mybricksJsonPath--', getSafePath(path.resolve(docPath, configName))),
          'utf-8'
        );
        // devTerminal.sendText(`export mybricksJsonPath=${path.resolve(docPath, configName)} && npm run --prefix ${projPath} publish:single-component`);
        devTerminal.sendText(`npm run --prefix ${projPath} publish:single-component ${webpackbuildjsPath}`);
        // devTerminal.sendText(`node ${projPath}/node_modules/webpack/bin/webpack.js --config ${webpackbuildjsPath}`);
        // "./node_modules/webpack/bin/webpack.js --config ./_scripts/componentLibrary/dev/scripts/webpack.build-single-component.js",
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
