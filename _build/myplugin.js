const fse = require('fs-extra');
const path = require('path');

const DebugStatusPrefix = 'MYBRICKS_BUILD_ID_';

const mybricksEnvPath = path.join(__dirname, '../dist/.temp/mybricks_env.json');


module.exports =  class Testplugin {
  constructor (id) {
    this.envId = `${DebugStatusPrefix}${id}`;
  }

  apply (compiler) {
    compiler.hooks.done.tap('Done', (...args) => {
      console.log('args 编译完成 打开', this.envId);

      // TODO
      const env = fse.readJSONSync(mybricksEnvPath);
      const devServer = compiler.options.devServer;

      if (!env[this.envId]) {
        env[this.envId] = {status: 'done', url: `http://${devServer.host}:${devServer.port}/bundle.js`};
      } else {
        env[this.envId].status = 'done';
        env[this.envId].url = `http://${devServer.host}:${devServer.port}/bundle.js`;
      }

      fse.writeJSONSync(mybricksEnvPath, env);
    });

    compiler.hooks.shutdown.tap('Shutdown', (...args) => {
      console.log('编辑结束', this.envId);

      const env = fse.readJSONSync(mybricksEnvPath);

      if (!env[this.envId]) {
        env[this.envId] = {status: 'close'};
      } else {
        env[this.envId].status = 'close';
      }

      fse.writeJSONSync(mybricksEnvPath, env);
    });
  }
};
