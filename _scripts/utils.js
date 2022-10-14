const fse = require("fs-extra");

/**
 * 
 * @param {string} imgPath 图片文件绝对路径
 * @returns 
 */
function imgToDataUri (imgPath) {
  let uri = '';
  let hasImgFile;

  if (fse.existsSync(imgPath)) {
    hasImgFile = fse.readFileSync(imgPath);
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
};

/**
 * 
 * @param {string} imgPath 图片文件绝对路径
 * @returns 
 */
function svgImgToDataUri (imgPath) {
  const imgFile = fse.readFileSync(imgPath, 'utf8');

  return 'data:image/svg+xml,' + encodeURIComponent(imgFile);
};

/**
 * 
 * @param {string} imgPath 图片文件绝对路径
 * @returns 
 */

function imgToBase64 (imgPath) {
  const imgFile = fse.readFileSync(imgPath);
  const base64data = imgFile.toString('base64');

  return 'data:image/png;base64,' + base64data;
};
 
/**
 * 获取json文件内容转对象
 * @param {string} filePath json文件绝对路径
 * @returns 若路径错误或json内容有误，返回空对象
 */
function readJSONSync (filePath) {
  let rst = {};

  try {
    rst = fse.readJSONSync(filePath);
  } catch (e) { }

  return rst;
};

/**
 * 获取类型
 * @param {*} value 
 * @returns 'object' | 'array' | 'property' | 'string' | 'number' | 'boolean' | 'null'
 */
function getNodeType (value) {
	switch (typeof value) {
		case 'boolean': return 'boolean';
		case 'number': return 'number';
		case 'string': return 'string';
		case 'object': {
			if (!value) {
				return 'null';
			} else if (Array.isArray(value)) {
				return 'array';
			}
			return 'object';
		}
		default: return 'null';
	}
};

class Logger {
  info (...args) {
    console.info('【Info】', ...args);
  }

  error (...args) {
    console.info('【Error】', ...args);
  }
}

const opToString = Object.prototype.toString;
const opIsArray = Array.isArray;

module.exports = {
  imgToDataUri,
  svgImgToDataUri,
  imgToBase64,
  opToString,
  opIsArray,
  getNodeType,
  readJSONSync
};
