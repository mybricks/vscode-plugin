import * as path from 'path';
import * as fse from 'fs-extra';
import * as vscode from 'vscode';

import { debugStatus } from '../utils';
import { updateStatusBar } from '../../statusBar';
import { WORKSPACE_STATUS } from '../../constants';


const terminalName: string = 'mybricks';

export function startServer(comlibPath: string): void {

  let terminal = vscode.window.terminals.find(terminal => terminal.name === terminalName);

  if (!terminal) {
    terminal = vscode.window.createTerminal(terminalName);
  }

  vscode.window.onDidCloseTerminal((e) => {
    console.log(e, 'onDidCloseTerminal');
    updateStatusBar();
  });


  debugStatus.initStatus(terminal.name, {
    build: () => {
      updateStatusBar(WORKSPACE_STATUS.BUILD);
    },

    done: (url: string) => {
      console.log('加载好了');
      vscode.env.openExternal(vscode.Uri.parse(`mybricks://app=pc-ms&debug=1&comlib-url=${url}`));
      updateStatusBar(WORKSPACE_STATUS.DEBUG);
    },
    close: () => {
      console.log('关闭');
      updateStatusBar(WORKSPACE_STATUS.DEV);
    }
  });

  const envMap = fse.readJSONSync(path.join(__dirname, './.temp/mybricks_env.json'));

  envMap[`MYBRICKS_BUILD_ID_${terminal.name}`] = { status: 'build' };
  fse.writeJSONSync(path.join(__dirname, './.temp/mybricks_env.json'), envMap);

  terminal.sendText(`export entry=${comlibPath} entryId=${terminal.name} && npm run --prefix ${path.join(__dirname, '../')} dev:comlib`);
  terminal.show();
}
