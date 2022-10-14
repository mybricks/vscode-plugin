import * as vscode from "vscode";
import { welcomeMybricks } from "./mybricks";
import { developExplorer } from "./explorer";

export function initViews (context: vscode.ExtensionContext) {
  welcomeMybricks.init(context);
  developExplorer.init(context);
}
