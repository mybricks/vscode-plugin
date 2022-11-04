import * as vscode from "vscode";

import { ViewLoader } from "./ViewLoader";

export class SettingsCommands {

  constructor (private readonly _context: vscode.ExtensionContext) {
    const { subscriptions } = this._context;

    subscriptions.push(
      vscode.commands.registerCommand("mybricks.publish.settings.open", () => {
        ViewLoader.showWebview(this._context);
      })
    );
  }
}
