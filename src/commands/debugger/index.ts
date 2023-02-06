import * as vscode from "vscode";

import * as path from "path";
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
  // timer: NodeJS.Timer | null = null;
  
  constructor (private readonly _context: vscode.ExtensionContext) {
    const { subscriptions } = this._context;

    subscriptions.push(
      vscode.window.onDidCloseTerminal((e: vscode.Terminal) => {
        if (e?.name === terminalName) {
          this.stop.call(this);
        }
      }),
      // vscode.window.onDidOpenTerminal((e: vscode.Terminal) => {
      //   if (e?.name === terminalName) {
      //     setTimeout(() => {
      //       e.processId.then((pid) => {
      //         if (pid) {
      //           watchPid(pid, {
      //             success: () => {
      //               this.status = "debug";
      //               vscode.commands.executeCommand("mybricks.debugger.debug");
      //             },
      //             error: () => {
      //               console.log('触发了 error leon')
      //               this.stop.call(this);
      //             }
      //           }, "start");
      //         }
      //       });
      //     });
      //   }
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
            this.status = "check";
            vscode.commands.executeCommand("mybricks.debugger.check");
            // vscode.commands.executeCommand("mybricks.debugger.debug");

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
            
            devTerminal.sendText(`export mybricksJsonPath=${path.resolve(docPath, configName)} && npm run --prefix ${projPath} dev:comlib`);
            devTerminal.show();
            devTerminal.processId.then((pid) => {
              if (pid) {
                setTimeout(() => {
                  watchPid(pid, {
                    success: () => {
                      if (this.status === 'check') {
                        this.status = "debug";
                        vscode.commands.executeCommand("mybricks.debugger.debug");
                        watchPid(pid, {
                          success: () => {
                            // this.devTerminal?.processId.then((curPid) => {
                            //   if (curPid === pid) {
                            //     this.stop.call(this);
                            //   }
                            // });
                            this.stop.call(this);
                          },
                          error: () => {
                            // this.devTerminal?.processId.then((curPid) => {
                            //   if (curPid === pid) {
                            //     this.stop.call(this);
                            //   }
                            // });
                            this.stop.call(this);
                          }
                        }, "end");
                      }
                    },
                    error: () => {
                      this.stop.call(this);
                    }
                  }, "start");
                }, 2000);
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
    if (this.status !== "dev") {
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

/** 
 * 监听进程(开始/退出) 
 * 
 * TODO 可以判断是否有npm进程，没有代表已报错
 * */
function watchPid (pid: number, { success, error }: {
  success: (pid: number) => void,
  error: (pid: number) => void
}, type: "start" | "end", delay = 1000) {
  setTimeout(() => {
    pid_descendant(pid, (err: any, data: any[]) => {
      if (err) {
        error(pid);
      } else {
        if (!data.length) {
          error(pid);
        } else {
          const hasWebpackProcess = data.find(item => item.find((item: string) => item === "webpack"));
          if (type === "start") {
            // 开始          
            if (hasWebpackProcess) {
              success(pid);
            } else {
              watchPid(pid, { success, error }, type, delay);
            }
          } else {
            // 结束
            if (hasWebpackProcess) {
              watchPid(pid, { success, error }, type, delay);
            } else {
              success(pid);
            }
          }
        }
      }
    });
  }, delay);
}
