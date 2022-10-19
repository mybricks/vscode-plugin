const path = require("path");
const fse = require("fs-extra");

const tempPath = path.join(__dirname, '.temp');
const tempPubPath = path.join(__dirname, '.temp-pub');

if (!fse.existsSync(tempPath)) {
  fse.mkdirSync(tempPath);
}

if (!fse.existsSync(tempPubPath)) {
  fse.mkdirSync(tempPubPath);
}


exports.tempPath = tempPath;
exports.tempPubPath = tempPubPath;
