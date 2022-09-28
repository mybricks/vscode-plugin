import * as path from 'path';
import * as fse from 'fs-extra';
import * as vscode from 'vscode';

import { debugStatus } from '../utils';

const terminalName: string = 'mybricks';

export function startServer (comlibPath: string): void {

  let terminal = vscode.window.terminals.find(terminal => terminal.name === terminalName);

  if (!terminal) {
    terminal = vscode.window.createTerminal(terminalName);
  }

  vscode.window.onDidCloseTerminal((e) => {
    console.log(e, 'onDidCloseTerminal');
  });

  debugStatus.initStatus(terminal.name, {
    done: () => {
      console.log('加载好了');
    },
    close: () => {
      console.log('关闭')
      // terminal?.dispose();
    }
  });

  const envMap = fse.readJSONSync(path.join(__dirname, './.temp/mybricks_env.json'));

  envMap[`MYBRICKS_BUILD_ID_${terminal.name}`] = {status: 'build'};
  fse.writeJSONSync(path.join(__dirname, './.temp/mybricks_env.json'), envMap);

  terminal.sendText(`export entry=${comlibPath} entryId=${terminal.name} && npm run --prefix ${path.join(__dirname, '../')} dev:comlib`);
  terminal.show();
}
