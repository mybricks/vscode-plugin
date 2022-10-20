const path = require("path");
const fse = require("fs-extra");
const cp = require("child_process");

module.exports =  class MyPlugin {
  constructor (props) {
    const { watchFiles } = props;
    const watchFilesMap = {};

    watchFiles.forEach(file => {
      watchFilesMap[file] = true;
    });

    this._props = {
      ...props,
      watchFilesMap
    };
  }

  apply (compiler) {
    const { docPath, configName, watchFilesMap } = this._props;

    compiler.hooks.done.tap("Done", () => {
      const devServer = compiler.options.devServer;
      const child = cp.spawn("open", [`mybricks://app=pc-page&debug=1&comlib-url=http://${devServer.host}:${devServer.port}/bundle.js`]);

      child.stderr.on("data", () => {
        fse.writeJSONSync(path.join(__dirname, 'message.json'), {
          code: -1,
          message: "未安装Mybricks.app，无法启动调试!"
        });
        throw new Error('\n未安装Mybricks.app，无法启动调试\n');
      });
    });

    compiler.hooks.watchRun.tap('WatchRun', (comp, done) => {
      let changedFiles = [];

      if (comp.modifiedFiles) {
        changedFiles = Array.from(comp.modifiedFiles);
      }

      const hasComJsonFile = changedFiles.some((file) => {
        return watchFilesMap[file];
      });

      if (hasComJsonFile) {
        cp.exec(`npm run rebuild:comlib docPath=${docPath} configName=${configName}`);
      }
      if (done) {
        done();
      }
    });
  }
};
