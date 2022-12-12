const path = require("path");

module.exports =  class MyPlugin {
  constructor (props) {
    this._props = props;
  }

  apply (compiler) {
    const { docPath } = this._props;

    compiler.hooks.done.tap("Done", () => {
      const distPath = path.resolve(docPath, './dist');
      setTimeout(() => {
        console.log('\x1b[32m发布成功');
        
        console.log(`\x1b[0m当前发布仅保存至本地:\neidt.js:\x1b[32m${distPath + '/edit.js'}\n  \x1b[0mrt.js:\x1b[32m${distPath + '/rt.js'}`);
      });
    });
  }
};
