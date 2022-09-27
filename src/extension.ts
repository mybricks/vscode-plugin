/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */

import * as vscode from "vscode";
import { createStatusBar } from './statusBar';
import { WelcomePanelProvider } from "./panels/welcome";
import { DebuggerPanelProvider } from "./panels/debugger";
import { logger, registerCommand, autoSetContextByProject, checkIsMybricksProject } from "./utils";
import commonds from "./commonds";

export function activate(context: vscode.ExtensionContext) {
  logger('Congratulations, your extension "mybricks" is now active!');

  const { subscriptions, extensionPath } = context;

  //自动设置全局变量
  autoSetContextByProject();

  //注册命令
  let disposable = vscode.commands.registerCommand("mybricks.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from Mybricks!");
  });
  context.subscriptions.push(disposable);

  //注册 UI
  const welcomePanel = new WelcomePanelProvider(context.extensionUri);
  const debuggerPanel = new DebuggerPanelProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("mybricks_welcome", welcomePanel)
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "mybricks_debugger",
      debuggerPanel
    )
  );

  //注册所有命令
  subscriptions.push(...commonds);

  //仅在 mybricks 项目下执行
  if (checkIsMybricksProject()) {
    //初始化 statusBar
    subscriptions.push(createStatusBar());
    // vscode.commands.executeCommand('setContext', 'mybricks.showDebugger', true);
  }

  // 
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    logger(editor);
  });

}

// this method is called when your extension is deactivated
export function deactivate() { }
