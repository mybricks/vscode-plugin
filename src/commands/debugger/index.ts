import * as vscode from "vscode";
// @ts-ignore
import * as pid_descendant from "pid-descendant";

import {
  registerCommand,
  getWorkspaceFsPath,
  checkIsMybricksProject
} from "../../utils";

const terminalName = "mybricks.dev.comlib";

export class DebuggerCommands {

  status: "dev" | "check" | "debug" = "dev";
  devTerminal: vscode.Terminal | undefined = undefined;
  
  constructor (private readonly _context: vscode.ExtensionContext) {
    const { subscriptions } = this._context;

    subscriptions.push(
      vscode.window.onDidCloseTerminal((e: vscode.Terminal) => {
        if (e?.name === terminalName) {
          this.stop.call(this);
        }
      }),
      // vscode.window.onDidOpenTerminal((e: vscode.Terminal) => {
      //   console.log(e, 'onDidOpenTerminal leon');
      // }),
      // vscode.window.onDidChangeTerminalState((e: vscode.Terminal) => {
      //   console.log(e, 'onDidChangeTerminalState leon');
      // }),
      // vscode.window.onDidChangeActiveTerminal((e) => {
      //   console.log(e, 'onDidChangeActiveTerminal leon');
      // }),
      // registerCommand("mybricks.debugger.start", this.start.bind(this)),
      // registerCommand("mybricks.debugger.stop", this.stop.bind(this)),
      // vscode.debug.onDidChangeActiveDebugSession((e) => {
      //   // TODO 目前只有组件库调试
      //   if (!e) {
      //     if (this.mybricksComlibSession) {
      //       this.stopStatus();
      //     }
      //   } else if (e.name === 'Mybrick Comlib' && !this.mybricksComlibSession) {
      //     vscode.commands.executeCommand("mybricks.debugger.debug");
      //     vscode.window.showInformationMessage("开始调试");
      //     this.mybricksComlibSession = e;
      //   }
      // })
      registerCommand("mybricks.debugger.start", () => {
        if (this.status === "dev") {
          start().then((res) => {
            this.status = "debug";
            vscode.commands.executeCommand("mybricks.debugger.debug");

            const terminals = vscode.window.terminals;
  
            let devTerminal = terminals.find(terminal => terminal.name === terminalName);
  
            if (!devTerminal) {
              /** 
               * TODO
               * 1.新建terminal后等待webpack进程启动再呈现“调试中...”按钮
               */
              devTerminal = vscode.window.createTerminal(terminalName);
            }

            this.devTerminal = devTerminal;
  
            const { docPath, configName } = res;
            const projPath = vscode.Uri.file(this._context.extensionPath).path;
            const filename = (res.docPath + res.configName).replace(/@|\//gi, "_");
            devTerminal.sendText(`node ${projPath}/_scripts/generateCode.js docPath=${docPath} configName=${configName} && export filename=${filename} && npm run --prefix ${projPath} dev:comlib`);
            devTerminal.show();
            devTerminal.processId.then((pid) => {
              if (pid) {
                watchPid(pid, () => {
                  this.devTerminal?.processId.then((curPid) => {
                    if (curPid === pid) {
                      this.stop.call(this);
                    }
                  });
                });
              }
            });
          });
        }
      }),
      registerCommand("mybricks.debugger.stop", () => {
        this.stop.call(this);
      })
    );
  }

  async start () {
    // this.status = 'check';

    // const mybricksComlibCfg = await start();

    // if (mybricksComlibCfg && this.status === 'check') {
    //   vscode.debug.startDebugging(undefined, mybricksComlibCfg);
    // } else {
    //   vscode.commands.executeCommand("mybricks.debugger.dev");
    // }
  }

  stop () {
    if (this.status === "debug") {
      vscode.commands.executeCommand("mybricks.debugger.dev");
      this.status = "dev";
      this.devTerminal?.dispose();
      this.devTerminal = undefined;
    }
   

    // if (this.mybricksComlibSession) {
    //   vscode.debug.stopDebugging(this.mybricksComlibSession);
    // } else {
    //   this.stopStatus();
    // }
  }

  stopStatus () {
    // this.status = 'dev';
    // this.mybricksComlibSession = undefined;
    // vscode.commands.executeCommand("workbench.debug.panel.action.clearReplAction");
    // vscode.commands.executeCommand("mybricks.debugger.dev");
    // vscode.window.showInformationMessage("结束调试");

    // const messageJsonPath = vscode.Uri.joinPath(this._context.extensionUri, "_build", "message.json").path;
    // const messageJson = readJSONSync(messageJsonPath);
    // const { code, message } = messageJson;

    // if (code === -1 && message) {
    //   vscode.window.showInformationMessage(message);

    //   fse.unlinkSync(messageJsonPath);
    // }
  }
}

function start (): Promise<{docPath: string, configName: string}> {
  return new Promise(async (resolve, reject) => {
    const mybricksJsonFiles = checkIsMybricksProject();
    const docPath = getWorkspaceFsPath();

    let configName;
  
    if (docPath && Array.isArray(mybricksJsonFiles) && mybricksJsonFiles.length) {
      const selectConfigName = await vscode.window.showQuickPick(mybricksJsonFiles, {
        placeHolder: "请选择配置文件"
      });
  
      configName = selectConfigName;
      if (!configName) {
        reject();
      } else {
        resolve({
          docPath,
          configName
        });
      }
    }
  });
}

/** 监听进程退出 */
function watchPid (pid: number, cb: (pid: number) => void, delay = 10000) {
  setTimeout(() => {
    pid_descendant(pid, (err: any, data: any[]) => {
      if (err) {
        console.log(err);
        cb(pid);
      } else {
        const hasWebpackProcess = data.find(item => item.find((item: string) => item === "webpack"));
        if (hasWebpackProcess) {
          watchPid(pid, cb, 1000);
        } else {
          cb(pid);
        }
      }
    });
  }, delay);
}
