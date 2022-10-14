import * as path from "path";
import * as fse from "fs-extra";
import * as shelljs from "shelljs";

const node_modules = path.join(__dirname, '../node_modules');

// 全局环境变量
class EnvStatus {
  // 项目准备就绪
  projrd = false;
  // 项目就绪执行回调
  projReadyCb: any;

  initReadyCb (cb: Function) {
    if (this.projrd) {
      cb();
    } else {
      this.projReadyCb = cb;
    }
  }

  setReady (bool: boolean) {
    if (bool && this.projReadyCb) {
      this.projReadyCb();
    }

    this.projrd = bool;
  }

  get ready () {
    return this.projrd;
  }
}

export const envStatus = new EnvStatus();

if (!fse.existsSync(node_modules)) {
  console.log('安装依赖');

  const pkgPath = path.join(__dirname, '../package.json');
  const pkg = fse.readJSONSync(pkgPath);

  pkg.devDependencies = {
    "@babel/core": "^7.6.2",
    "@babel/plugin-proposal-class-properties": "^7.18.6",
    "@babel/preset-react": "^7.18.6",
    "babel-loader": "^8.0.6",
    "css-loader": "^6.7.1",
    "eslint": "^8.20.0",
    "less": "^4.1.3",
    "less-loader": "^11.0.0",
    "portfinder-sync": "0.0.2",
    "style-loader": "^3.3.1",
    "ts-loader": "^9.3.1",
    "typescript": "^4.7.4",
    "webpack": "^5.74.0",
    "webpack-cli": "^4.10.0",
    "webpack-dev-server": "^4.9.3",
    "fs-extra": "^10.1.0",
    "@fangzhou/stark": "1.0.57-beta1"
  };
  pkg.dependencies = {};

  fse.writeJSONSync(pkgPath, pkg);

  console.time('npm i');

  shelljs.exec(`cd ${path.join(__dirname, '../')} && npm i`, function ( code ,  stdout ,  stderr ) {
    console.log({code, stdout, stderr}, 'npm i 结果');

    if (code === 0) {
      envStatus.setReady(true);

      console.timeEnd('npm i');
    }
  });
} else {
  envStatus.setReady(true);
}
