import * as vscode from 'vscode';
import { COMMANDS, WORKSPACE_STATUS } from '../constants';
import { setStatusBarBackground } from "../utils";

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
    //开发态
    case WORKSPACE_STATUS.DEV:
      icon = "debug-start";
      text = `Mybricks: 点击调试 $(${icon})`;
      command = COMMANDS.START;
      background = "#116dc1";
      break;

    //调试态
    case WORKSPACE_STATUS.DEBUG:
      icon = "debug-pause";
      text = `Mybricks: 调试中 $(${icon})`;
      command = COMMANDS.STOP;
      background = "#c35d33";
      break;
    default:
      icon = "debug-start";
      text = `Mybricks: 点击调试 $(${icon})`;
      command = COMMANDS.START;
      background = "#116dc1";
      break;
  }

  mainStatusBarItem.text = text;
  mainStatusBarItem.command = command;
  setStatusBarBackground(background);
}