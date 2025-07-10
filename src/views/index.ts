import * as vscode from "vscode";
import { welcomeMybricks } from "./mybricks";
import { developExplorer, appConfigExplorer } from "./explorer";

export async function initViews (context: vscode.ExtensionContext) {
  welcomeMybricks.init(context);
  await appConfigExplorer.init(context);
  developExplorer.init(context);
}
