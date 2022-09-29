import * as path from 'path';
import * as fse from 'fs-extra';
import * as vscode from 'vscode';
import { debugStatus } from '../utils';
import { updateStatusBar } from '../../statusBar';


const terminalName: string = 'mybricks';

let timeId: any;
let lastStatus: any;

vscode.window.onDidCloseTerminal((e) => {
  if (e.name === terminalName) {
    clearInterval(timeId);
    timeId = null;
    lastStatus = null;
    vscode.commands.executeCommand('mybricks.stop');
  }
});

export function startServer(comlibPath: string): void {
  console.log(comlibPath, 'comlibPath')

  const id = `MYBRICKS_BUILD_ID_${comlibPath}`;
  const terminalIndex = vscode.window.terminals.findIndex(terminal => terminal.name === terminalName);
  const terminal = vscode.window.createTerminal(terminalName);
  const envMap = fse.readJSONSync(path.join(__dirname, './.temp/mybricks_env.json'));

  envMap[id] = { status: 'build' };
  fse.writeJSONSync(path.join(__dirname, './.temp/mybricks_env.json'), envMap);

  timeId = setInterval(() => {
    const envMap = fse.readJSONSync(path.join(__dirname, './.temp/mybricks_env.json'));
    const status = envMap[id].status;

    switch (status) {
      case 'done':
        if (status !== lastStatus) {
          lastStatus = status;
          vscode.env.openExternal(vscode.Uri.parse(`mybricks://app=pc-ms&debug=1&comlib-url=${envMap[id].url}`));
        }

        break;
      case 'close':
        vscode.commands.executeCommand('mybricks.stop');
        terminal.dispose();
        break;
    }

    console.log('轮询')

  }, 1000);

  debugStatus.initStatus({methods: {
    close() {
      terminal.dispose();
    }
  }});

  

  // let terminal = vscode.window.terminals.find(terminal => terminal.name === terminalName);

  // if (!terminal) {
  //   terminal = vscode.window.createTerminal(terminalName);
  // }

  

  // const envMap = fse.readJSONSync(path.join(__dirname, './.temp/mybricks_env.json'));

  // envMap[`MYBRICKS_BUILD_ID_${comlibPath}`] = { status: 'build' };
  // fse.writeJSONSync(path.join(__dirname, './.temp/mybricks_env.json'), envMap);

  // debugStatus.initStatus(terminal, comlibPath, {
  //   build: () => {
  //     // @ts-ignore
  //   },
  //   done: (url: string) => {
  //     console.log('加载好了');
  //     vscode.env.openExternal(vscode.Uri.parse(`mybricks://app=pc-ms&debug=1&comlib-url=${url}`));
  //   },
  //   close: () => {
  //     console.log('关闭');
  //     terminal?.dispose();
  //     vscode.commands.executeCommand('mybricks.stop');
  //   }
  // });

  terminal.sendText(`export entry=${comlibPath} && npm run --prefix ${path.join(__dirname, '../')} dev:comlib`);
  terminal.show();




  if (terminalIndex !== -1) {
    vscode.window.terminals[terminalIndex].dispose();
  }
}
