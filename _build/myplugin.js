const path = require("path");
const fse = require("fs-extra");
const cp = require("child_process");

module.exports =  class MyPlugin {
  constructor () {
    // this._props = props;
  }

  apply (compiler) {
    // const that = this;
    compiler.hooks.done.tap("Done", () => {
      const devServer = compiler.options.devServer;
      const child = cp.spawn("open", [`mybricks123://app=pc-ms&debug=1&comlib-url=http://${devServer.host}:${devServer.port}/bundle.js`]);

      child.stderr.on("data", () => {
        fse.writeJSONSync(path.join(__dirname, 'message.json'), {
          code: -1,
          message: "未安装Mybricks.app，无法启动调试!"
        });
        throw new Error('\n未安装Mybricks.app，无法启动调试\n');
      });
    });
  }
};
