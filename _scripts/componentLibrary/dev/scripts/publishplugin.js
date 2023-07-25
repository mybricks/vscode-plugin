const path = require("path");
const fse = require("fs-extra");
const request = require("request");

module.exports =  class MyPlugin {
  constructor (props) {
    this._props = props;
  }

  apply (compiler) {
    const { config, jsonconfig, type } = this._props;
    const { docPath } = jsonconfig;

    compiler.hooks.done.tap("Done", async () => {
      const distPath = path.resolve(docPath, './dist');

      setTimeout(async () => {
        // const { publishConfig = {} } = config;
        // const { api } = publishConfig;

        // if (typeof api === 'string') {
        //   console.log(`\n\x1b[0m调用发布接口 ${api}`);

        //   const { entry: { edit, rt } } = jsonconfig;
        //   const editJs = fse.readFileSync(edit, 'utf-8');
        //   const editJsMap = fse.readFileSync(edit + '.map', 'utf-8');
        //   const rtJs = fse.readFileSync(rt, 'utf-8');
        //   const rtJsMap = fse.readFileSync(rt + '.map', 'utf-8');
        //   const date = new Date();
        //   const prefix = `/${date.getFullYear()}-${date.getMonth()}-${date.getDay()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
        //   const finalCdns = await this.uploadToCdn([
        //     { path: prefix, filename: 'edit.js', content: editJs },
        //     { path: prefix, filename: 'edit.js.map', content: editJsMap },
        //     { path: prefix, filename: 'rt.js', content: rtJs },
        //     { path: prefix, filename: 'rt.js.map', content: rtJsMap },
        //   ], api);

        //   finalCdns.forEach((final) => {
        //     final.forEach((f) => {
        //       console.log(f);
        //     });
        //   });
        // } else {
        //   console.log('\n未配置发布所需调用的api，当前发布仅保存在本地');
        // }

        if (type === 'rt') {
          console.log(`\x1b[0m发布rt产物默认保存至本地文件:\n    \x1b[0mrt.js:\x1b[32m${distPath + '/rt.js'}\n\x1b[0mrt.js.map:\x1b[32m${distPath + '/rt.js.map'}`);
        } else if (type === 'edit') {
          console.log(`\x1b[0m发布edit产物默认保存至本地文件:\n    eidt.js:\x1b[32m${distPath + '/edit.js'}\n\x1b[0medit.js.map:\x1b[32m${distPath + '/edit.js.map'}\n`);
        }

        // console.log(`\x1b[0m发布产物默认保存至本地文件:\n    eidt.js:\x1b[32m${distPath + '/edit.js'}\n\x1b[0medit.js.map:\x1b[32m${distPath + '/edit.js.map'}\n      \x1b[0mrt.js:\x1b[32m${distPath + '/rt.js'}\n  \x1b[0mrt.js.map:\x1b[32m${distPath + '/rt.js.map'}`);
      });
    });
  }

  async uploadToCdn(apiParams, api) {
    return await Promise.all(apiParams.map((apiParam) => {
      return new Promise((resolve) => {
        request({
          method: "POST",
          url: api,
          headers: {
            "content-type": "application/json"
          },
          body: apiParam,
          json: true
        }, (error, response, body) => {
          if (error || response.statusCode !== 200) {
            resolve([`\n\x1b[0m${apiParam.filename} 发布失败(${response.statusCode})，${response.statusMessage}`]);
          } else {
            resolve([`\n\x1b[0m${apiParam.filename} 发布成功`, body]);
          }
        });
      });
    }));
  }
};
