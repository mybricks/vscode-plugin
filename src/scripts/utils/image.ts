/**
 * 图片处理相关
 */

import * as fs from 'fs';

/**
 * 
 * @param imgPath 图片文件绝对路径
 * @returns 
 */
export function imgToDataUri(imgPath: string) {
  let uri: string = '';
  let hasImgFile: any;

  if (fs.existsSync(imgPath)) {
    hasImgFile = fs.readFileSync(imgPath);
  }

  switch (true) {
    case !hasImgFile:
      console.error(`${imgPath}：未找到图片`);
      break;
    case imgPath.endsWith('.svg'):
      uri = svgImgToDataUri(imgPath);
      break;
    default:
      uri = imgToBase64(imgPath);
      break;
  }

  return uri;
}

/**
 * 
 * @param imgPath 图片文件绝对路径
 * @returns 
 */
export function svgImgToDataUri(imgPath: string) {
  const imgFile = fs.readFileSync(imgPath, 'utf8');

  return 'data:image/svg+xml,' + encodeURIComponent(imgFile);
}

/**
 * 
 * @param imgPath 图片文件绝对路径
 * @returns 
 */
export function imgToBase64(imgPath: string) {
  const imgFile = fs.readFileSync(imgPath);
  const base64data = imgFile.toString('base64');

  return 'data:image/png;base64,' + base64data;
}
