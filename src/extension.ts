/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */
import * as vscode from 'vscode';
import commonds from './commonds';
import { WORKSPACE_STATUS } from './constants';
import { WelcomePanelProvider } from './panels/welcome';
import { DebuggerPanelProvider } from './panels/debugger';
import { createStatusBar, showStatusBar, updateStatusBar } from './statusBar';
import { logger, autoSetContextByProject, checkIsMybricksProject } from "./utils";
import { completionProvider, dispose } from './editor'

export function activate(context: vscode.ExtensionContext) {
  logger('Congratulations, your extension "mybricks" is now active!');

  const { subscriptions, extensionPath } = context;

  autoSetContextByProject();

  subscriptions.push(createStatusBar());
  if (checkIsMybricksProject()) {
    showStatusBar(true);
  } else {
    showStatusBar(false);
  }

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    autoSetContextByProject();
    if (checkIsMybricksProject()) {
      showStatusBar(true);
    } else {
      showStatusBar(false);
    }
  });


  //注册 UI
  const welcomePanel = new WelcomePanelProvider(context.extensionUri);
  const debuggerPanel = new DebuggerPanelProvider(context.extensionUri);

  subscriptions.push(vscode.commands.registerCommand("mybricks.buttonUi.dev", () => {
    // @ts-ignore
    debuggerPanel.getWebview().webview.postMessage({ action: "dev" });
  }));

  subscriptions.push(vscode.commands.registerCommand("mybricks.buttonUi.debug", () => {
    // @ts-ignore
    debuggerPanel.getWebview().webview.postMessage({ action: "debug" });
  }));

  subscriptions.push(
    vscode.window.registerWebviewViewProvider("mybricks_welcome", welcomePanel),
    vscode.window.registerWebviewViewProvider("mybricks_debugger", debuggerPanel)
  );

  //注册所有命令
  subscriptions.push(...commonds);

  //注册editor provider
  subscriptions.push(completionProvider())
}

// this method is called when your extension is deactivated
export function deactivate() {
  updateStatusBar(WORKSPACE_STATUS.DEV);
  dispose()
}
