import * as vscode from "vscode";
import { getWorkspaceFsPath, checkIsMybricksProject } from "../utils";

export function initListener (context: vscode.ExtensionContext) {
  autoSetContextByProject();

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    autoSetContextByProject();
  });
}

function autoSetContextByProject() {
  const wsFsPath = getWorkspaceFsPath();
  const switchBool = checkIsMybricksProject(wsFsPath);

  if (wsFsPath && switchBool) {
    // 表示进入了mybricks项目，记录global settings.json
    const mybricksConfig = vscode.workspace.getConfiguration("mybricks");

    let recentProjectPaths = (mybricksConfig.inspect("recentProjectPaths")?.globalValue || []) as string[];

    if (!recentProjectPaths.find(recentProject => {
      return recentProject === wsFsPath;
    })) {
      recentProjectPaths.unshift(wsFsPath);

      // 取最近的十个
      if (recentProjectPaths.length > 10) {
        recentProjectPaths.pop();
      }

      // 过滤失效的地址（移动了位置、修改了名字）
      recentProjectPaths = recentProjectPaths.filter(recentProjectPath => {
        return checkIsMybricksProject(recentProjectPath);
      });

      mybricksConfig.update("recentProjectPaths", recentProjectPaths, vscode.ConfigurationTarget.Global);
    }
  }

  vscode.commands.executeCommand("setContext", "mybricks:isComlib", checkIsMybricksProject());
}
