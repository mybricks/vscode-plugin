import * as path from 'path';
import * as fse from 'fs-extra';

const tempPath = path.join(__dirname, '.tempComlib');

if (!fse.existsSync(tempPath)) {
  fse.mkdirSync(tempPath);
}

export { tempPath };
export { build } from './build';
export { startServer } from './startServer';
