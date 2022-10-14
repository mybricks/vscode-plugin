const path = require("path");
const fse = require("fs-extra");

const tempPath = path.join(__dirname, '.temp');
// const mybricksEnvPath = path.join(tempPath, 'mybricks_env.json');

if (!fse.existsSync(tempPath)) {
  fse.mkdirSync(tempPath);
}

// if (!fse.existsSync(mybricksEnvPath)) {
//   fse.writeJSONSync(mybricksEnvPath, {});
// }

exports.tempPath = tempPath;
