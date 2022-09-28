import * as vscode from "vscode";
import { updateStatusBar } from "../statusBar";
import { WORKSPACE_STATUS } from "../constants";
import { debugStatus } from "../scripts/utils";

export default function () {
  vscode.window.showInformationMessage("结束调试");

  //修改 statusBar 状态
  updateStatusBar(WORKSPACE_STATUS.DEV);

  //修改 button 状态
  vscode.commands.executeCommand("mybricks.buttonUi.dev");

  //执行结束调试
  debugStatus.close("mybricks");
}