import * as fs from 'fs';
import * as path from 'path';
export { debugStatus } from './env';
export { imgToDataUri } from './image';
import { getJsonFile } from '../../utils';
import { MybricksConfigCom } from '../../types';

/**
 * 获取组件库入口文件配置项
 * @param {string} docPath    组件库目录绝对路径
 * @param {string} configPath 组件库mybricks.json配置文件绝对路径
 * @returns 配置项
 */
export function getEntryCfg (docPath: string, configPath: string): {
  libName: string;
  libVersion: string;
  libPath: string;
  debugger: string;
  description: string;
  comAry: Array<MybricksConfigCom>;
  [key: string]: any;
} {
  const pkg = getJsonFile<{name: string, version: string, description: string}>(path.join(docPath, './package.json'));
  const cfg = {
    comAry: [],
    libPath: docPath,
    libName: pkg.name,
    // libName: pkg.name.replace(/@|\//gi, '_'),
    debugger: 'pc-spa',
    libVersion: pkg.version,
    description: pkg.description
  };

  if (fs.existsSync(configPath)) {
    const cfgJson = getJsonFile<{comAry: MybricksConfigCom[]}>(configPath);

    Object.assign(cfg, cfgJson);
  };

  return cfg;
}
