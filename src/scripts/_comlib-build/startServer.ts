import * as path from 'path';
import * as vscode from 'vscode';

import { debugStatus } from '../utils';

const terminalName: string = 'mybricks';

export function startServer (comlibPath: string): void {

  let terminal = vscode.window.terminals.find(terminal => terminal.name === terminalName);

  if (!terminal) {
    terminal = vscode.window.createTerminal(terminalName);
  }

  debugStatus.initStatus(terminal.name, {
    close: () => {
      terminal?.dispose();
    }
  })

  terminal.sendText(`export entry=${comlibPath} entryId=${terminal.name} && npm run --prefix ${path.join(__dirname, '../')} test`);
  terminal.show();
}
