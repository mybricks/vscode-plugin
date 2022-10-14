import * as vscode from "vscode";

import { registerCommand, getWorkspaceFsPath } from "../../utils";

// TODO 后续应该在OUTPUT输出 -- 临时（面向团队内）
export class PublishCommands {

  private _terminal: vscode.Terminal | undefined;

  constructor (private readonly _context: vscode.ExtensionContext) {
    const { subscriptions } = this._context;

    subscriptions.push(
      registerCommand("mybricks.publish.start", this.start.bind(this)),
      vscode.window.onDidCloseTerminal(e => {
        if (e.name === 'mybricks publish' && this._terminal) {
          this._terminal = undefined;
        }
      })
    );
  }

  async start () {
    if (!vscode.window.terminals.length) {
      vscode.window.createTerminal();
    }

    if (this._terminal) {
      this._terminal.dispose();
      this._terminal = undefined;

      this.start();
    } else {
      const terminal = vscode.window.createTerminal('mybricks publish');
      this._terminal = terminal;

      // export _WORKSPACE_=/Users/lianglihao/Desktop/Company/h5-common-lib && npm run --cwd "/Users/lianglihao/Desktop/Company/h5-common-lib" --prefix "/Users/lianglihao/Documents/GitHub/vscode-plugin" mybricks publish
      // terminal.sendText(`${getWorkspaceFsPath()}\n${this._context.extensionPath}`)
      terminal.sendText(`export _WORKSPACE_=${getWorkspaceFsPath()} && npm run --prefix ${this._context.extensionPath} mybricks publish`);
      // terminal.sendText('source ~/.bash_profile && mybricks publish');
      terminal.show();
    }
  }
}
