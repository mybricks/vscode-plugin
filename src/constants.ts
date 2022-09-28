import { NodeDepTypes } from './types';

export const nodeDepTypes: NodeDepTypes[] = ['dependencies', 'devDependencies'];

export const showExtensionsQuickPickCommandId = 'mybricks.helloworld';

export const editorTitleRunDebugCommandId = 'npmScripts-editor-title-run-dev';
export const editorTitleRunBuildCommandId = 'npmScripts-editor-title-run-build';

export const projectExistsTime = 5;

// export const STATUSBARID = "mybricks.statusBarId";

export const COMMANDS = {
  START_DEBUG: "mybricks.start_debug",
  STOP_DEBUG: "mybricks.stop_debug",
}

export const WORKSPACE_STATUS = {
  DEV: "dev", //开发中
  COMPILE: "compile", //构建中
  BUILD: "build",//构建中
  ERROR: "error", //构建失败
  DEBUG: "debug", //调试中
};