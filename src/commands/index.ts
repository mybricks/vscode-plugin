import * as vscode from "vscode";

import { PublishCommands } from "./publish";
import { SettingsCommands } from "./settings";
import { DebuggerCommands } from "./debugger";

export let publishCommands: PublishCommands;
export let debuggerCommands: DebuggerCommands;
export let settingsCommands: SettingsCommands;

export function initCommands (context: vscode.ExtensionContext) {

  publishCommands = new PublishCommands(context);
  debuggerCommands = new DebuggerCommands(context);
  settingsCommands = new SettingsCommands(context);
}
