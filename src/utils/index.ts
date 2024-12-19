import * as path from "path";
import * as fse from "fs-extra";
import * as vscode from "vscode";

export function logger(...args: any) {
  console.log("======");
  console.log("[Mybricks]", ...args);
  console.log("======");
}


export function registerCommand(command: string, commandHandler: (...args: any[]) => any) {
  return vscode.commands.registerCommand(command, (...args) => {
    // todo: 增加日志
    logger("Execute Command", command, args);
    commandHandler(...args);
  });
}


/**
 * 获取工作空间路径
 * @returns 
 */
export function getWorkspaceFsPath () {
  const wsFolders = vscode.workspace.workspaceFolders;

  logger("wsFolders => ", wsFolders);

  if (!wsFolders) {
    return;
  };

  const wsFsPath = wsFolders[0]?.uri?.fsPath;

  logger("wsFsPath => ", wsFsPath);

  return wsFsPath;
}

/**
 * 判断是否为mybricks项目
 * 有“*?.?mybricks.json”文件即可
 * @param {string} wsFsPath 检查的文件目录路径
 * @returns 
 */
export function checkIsMybricksProject(wsFsPath = getWorkspaceFsPath()) {
  if (!wsFsPath || !fse.existsSync(wsFsPath)) {
    logger("路径不存在");
    return false;
  }

  const mybricksFiles = fse.readdirSync(wsFsPath).filter((docName) => {
    logger("docName => ", docName);
    return docName === "mybricks.json" || docName.endsWith(".mybricks.json");
  });

  if (!mybricksFiles.length) {
    logger("未找到mybricks配置文件");
    return false;
  }

  return mybricksFiles;
}

export function uuid (): string {
  let text = "";

  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export const opToString = Object.prototype.toString;
export const opIsArray = Array.isArray;

/**
 * 获取json文件内容转对象
 * @param {string} filePath json文件绝对路径
 * @returns 若路径错误或json内容有误，返回空对象
 */
export function readJSONSync<T extends {[key: string]: any}>(filePath: string): T {
  let rst = {} as T;

  try {
    rst = fse.readJSONSync(filePath);
  } catch (e) { }

  return rst;
}

/**
 * 普通消息提示
 * @param {string} title 提示内容
 * @param {number} duration 停留时间
 */
export function showInformationMessage (title: string, duration = 5000) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title,
      cancellable: false,
    },
    async (progress, _token) => {
      return new Promise((resolve) => {
        const seconds = duration / (1 * 1000);
        const increment = 100 / seconds;

        for (let i = 0; i < seconds; i++) {
          setTimeout(() => {
            progress.report({ increment });

            if (i === seconds - 1) {
              resolve(true);
            }
          }, i * 1000);
        }
      });
    }
  );
}

export function getMybricksConfigJson () {
  const ws = getWorkspaceFsPath() as string;
  const vscodeConfigPath = path.join(ws, ".vscode");

  if (!fse.existsSync(vscodeConfigPath)) {
    fse.mkdirSync(vscodeConfigPath);
  }

  const configPath = path.join(vscodeConfigPath, 'mybricks.config.json');

  return readJSONSync(configPath);
}

export function setMybricksConfigJson (json: {[key: string]: any}) {
  const ws = getWorkspaceFsPath() as string;
  const vscodeConfigPath = path.join(ws, ".vscode");

  if (!fse.existsSync(vscodeConfigPath)) {
    fse.mkdirSync(vscodeConfigPath);
  }

  const configPath = path.join(vscodeConfigPath, "mybricks.config.json");

  fse.writeJSONSync(configPath, json, {spaces: 2});
}
