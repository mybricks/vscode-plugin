import * as vscode from 'vscode';
import { COMMANDS, WORKSPACE_STATUS } from '../constants';
import { logger, setStatusBarBackground } from "../utils";

let mainStatusBarItem: vscode.StatusBarItem;

export function createStatusBar() {
  mainStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -10000);
  updateStatusBar();
  return mainStatusBarItem;
}

export function showStatusBar(status: boolean) {
  if (status) {
    mainStatusBarItem.show();
  } else {
    mainStatusBarItem.hide();
  }
}

export function updateStatusBar(workspaceStatus?: string) {
  let icon;
  let text;
  let command;
  let background;

  switch (workspaceStatus) {
    //开发中
    case WORKSPACE_STATUS.DEV:
      icon = "debug-start";
      text = `Mybricks: 点击调试 $(${icon})`;
      command = COMMANDS.STOP_DEBUG;
      background = "";
      break;

    //构建中
    case WORKSPACE_STATUS.COMPILE:
    case WORKSPACE_STATUS.BUILD:
      icon = "loading";
      text = `Mybricks: 构建中 $(${icon})`;
      command = COMMANDS.STOP_DEBUG;
      background = "#381712";
      break;

    //构建异常
    case WORKSPACE_STATUS.ERROR:
      icon = "warning";
      text = `Mybricks: 构建失败 $(${icon})`;
      command = COMMANDS.STOP_DEBUG;
      background = "#983612";
      break;

    //调试中
    case WORKSPACE_STATUS.DEBUG:
      icon = "debug-pause";
      text = `Mybricks: 调试中 $(${icon})`;
      command = COMMANDS.STOP_DEBUG;
      background = "#003732";
      break;
    default:
      icon = "debug-start";
      text = `Mybricks: 点击调试 $(${icon})`;
      command = COMMANDS.STOP_DEBUG;
      background = "";
      break;
  }

  mainStatusBarItem.text = text;
  mainStatusBarItem.command = command;
  setStatusBarBackground(background);
}