import * as vscode from "vscode";

import * as path from "path";
import * as fse from "fs-extra";
// @ts-ignore
import * as pid_descendant from "pid-descendant";

import {
  registerCommand,
  getWorkspaceFsPath,
  checkIsMybricksProject
} from "../../utils";
import { configValidCheck } from './../../utils/validCheck';

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

            configValidCheck(res);

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
            // const projPath = vscode.Uri.file(this._context.extensionPath).path;
            const projPath = this._context.extensionPath;
            const mybricksJsonPath = path.resolve(docPath, configName);
            const mybricksJson = fse.readJSONSync(mybricksJsonPath);
            const devTempPath = path.resolve(projPath, './_scripts/componentLibrary/dev/scripts/_devTemp');
            
            if (!fse.existsSync(devTempPath)) {
              fse.mkdirSync(devTempPath);
            }
            const pattern = /[^a-zA-Z0-9]+/g;
            const replacement = '_';
            const result = mybricksJsonPath.replace(pattern, replacement) + '.js';
            const webpackdevjsPath = path.resolve(devTempPath, result);
            const webpackdevjs = fse.readFileSync(path.resolve(projPath, './_scripts/componentLibrary/dev/scripts/webpack.dev.js'), 'utf-8');
            fse.writeFileSync(webpackdevjsPath, webpackdevjs.replace('const { mybricksJsonPath, docPath } = process.env;', `const mybricksJsonPath = decodeURIComponent("${encodeURIComponent(mybricksJsonPath)}");\nconst docPath = decodeURIComponent("${encodeURIComponent(docPath)}");`), 'utf-8');

            if (mybricksJson.componentType === 'MP') {
              // devTerminal.sendText(`node ${projPath}/_scripts/devmp.js ${mybricksJsonPath}`);
              devTerminal.sendText(`node ${projPath}/_scripts/devmp.js ${mybricksJsonPath} ${projPath} ${webpackdevjsPath}`);
            } else {
              // devTerminal.sendText(`export mybricksJsonPath=${mybricksJsonPath} && npm run --prefix ${projPath} dev:comlib`);
              
              devTerminal.sendText(`npm run --prefix ${projPath} dev:comlib ${webpackdevjsPath}`);
              // devTerminal.sendText(`node ${projPath}/node_modules/webpack-dev-server/bin/webpack-dev-server.js --config ${webpackdevjsPath}`);
            }
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
    if (this.status !== "dev") {
      vscode.commands.executeCommand("mybricks.debugger.dev");
      this.status = "dev";
      // TODO: 暂时注释，windows系统问题
      // this.devTerminal?.dispose();
      // this.devTerminal = undefined;
      // 打开调试的terminal模拟执行Ctrl+C
      this.devTerminal?.show();
      vscode.commands.executeCommand('workbench.action.terminal.sendSequence', {
        text: '\x03' // \x03 是 Ctrl+C 的 ASCII 码
      });
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
      let selectConfigName;

      if (mybricksJsonFiles.length > 1) {
        selectConfigName = await vscode.window.showQuickPick(mybricksJsonFiles, {
          placeHolder: "请选择配置文件"
        });
      } else {
        selectConfigName = mybricksJsonFiles[0];
      }

      configName = selectConfigName;
      if (!configName) {
        reject();
      } else {
        resolve({
          docPath,
          configName
        });
      }
    } else {
      vscode.window.showInformationMessage(!docPath ? "未打开工程目录" : "缺失*mybricks.json配置文件");
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
        if (data.length < 2) {
          error(pid);
        } else {
          // const hasWebpackProcess = data.find(item => item.find((item: string) => item === "webpack"));

          const hasWebpackProcess = data.length > 1;

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
