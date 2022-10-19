const fse = require("fs-extra");
const { build } = require("./utils");

const argv = process.argv.slice(2);
const config = {};

argv.forEach(str => {
  const [key, value] = str.split("=");

  config[key] = value;
});

console.log(config, 'config')

const { id, editJS } = build(config.docPath, config.configName);

const editJSPath = path.join(tempPath, `${id.replace(/@|\//gi, "_")}.js`);

fse.writeFileSync(editJSPath, editJS);
