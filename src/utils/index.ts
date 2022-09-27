/**
 * 通用
 */

import * as fs from 'fs';

export const opToString = Object.prototype.toString;
export const opIsArray = Array.isArray;

/**
 * 获取json文件内容转对象
 * @param {string} filePath json文件绝对路径
 * @returns 若路径错误或json内容有误，返回空对象
 */
export function getJsonFile <T extends object>(filePath: string): T {
  let rst = {} as T;

  try {
    const objString = fs.readFileSync(filePath, 'utf-8');

    rst = JSON.parse(objString);
  } catch (e) {}

  return rst;
}