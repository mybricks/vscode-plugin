import * as path from 'path';
import * as fse from 'fs-extra';

const tempPath = path.join(__dirname, '.temp');
const mybricksEnvPath = path.join(tempPath, 'mybricks_env.json');

if (!fse.existsSync(tempPath)) {
  fse.mkdirSync(tempPath);
}

if (!fse.existsSync(mybricksEnvPath)) {
  fse.writeJSONSync(mybricksEnvPath, {});
}

export { tempPath };
export { build } from './build';
export { startServer } from './startServer';
