/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */
import * as vscode from "vscode";
import { initNpm } from "./env";
import { initViews } from "./views";
import { initCommands } from "./commands";
import { initListener } from "./listener";
import { initSnippets, disposeSnippets } from "./snippets";
import { logger } from "./utils";

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand('mybricks.webview.develop.show', () => {
    logger("设置 mybricks:isComlib 为 true");
    vscode.commands.executeCommand("setContext", "mybricks:isComlib", true);
  });
  
  // const regist = () => {
  //   // 注册代码片段
  //   initSnippets(context);

  //   // 注册视图模块
  //   initViews(context);

  //   //注册所有命令
  //   initCommands(context);

  //   // 注册全局监听事件
  //   initListener(context);
  // };
  
  // envStatus.initReadyCb(regist);

  // npm包
  // initNpm();

  // 注册全局监听事件
  initListener(context);

  // 注册代码片段
  initSnippets(context);

  // 注册视图模块
  initViews(context);

  //注册所有命令
  initCommands(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
  disposeSnippets();
}
