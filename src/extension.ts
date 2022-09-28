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
import { WelcomePanelProvider } from './panels/welcome';
import { DebuggerPanelProvider } from './panels/debugger';
import { createStatusBar, showStatusBar } from './statusBar';
import { logger, autoSetContextByProject, checkIsMybricksProject } from "./utils";

export function activate(context: vscode.ExtensionContext) {
  logger('Congratulations, your extension "mybricks" is now active!');

  const { subscriptions, extensionPath } = context;

  //自动设置全局变量
  autoSetContextByProject();

  //注册 UI
  const welcomePanel = new WelcomePanelProvider(context.extensionUri);
  const debuggerPanel = new DebuggerPanelProvider(context.extensionUri);

  subscriptions.push(
    vscode.window.registerWebviewViewProvider("mybricks_welcome", welcomePanel),
    vscode.window.registerWebviewViewProvider("mybricks_debugger", debuggerPanel)
  );

  //注册所有命令
  subscriptions.push(...commonds);

  //注册 statusbar
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

}

// this method is called when your extension is deactivated
export function deactivate() { }
