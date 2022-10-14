import * as vscode from "vscode";
import { completionProvider as comEditorCompletionProvider, dispose as comEditorDispose } from "./comEditor";

export function initSnippets (context: vscode.ExtensionContext) {
  const { subscriptions } = context;

  subscriptions.push(comEditorCompletionProvider());
}

export function disposeSnippets () {
  comEditorDispose();
}
