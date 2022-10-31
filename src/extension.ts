/**
 * MyBricks Opensource
 * https://mybricks.world
 * This source code is licensed under the MIT license.
 *
 * CheMingjun @2019
 * mybricks@126.com
 */
import * as vscode from "vscode";
// import { envStatus } from "./env";
import { initViews } from "./views";
import { initCommands } from "./commands";
import { initListener } from "./listener";
import { initSnippets, disposeSnippets } from "./snippets";

export function activate(context: vscode.ExtensionContext) {
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
