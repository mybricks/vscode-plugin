const path = require("path");
const fse = require("fs-extra");
const { build } = require("./utils");
const { tempPath } = require("./const");

const argv = process.argv.slice(2);
const config = {};

argv.forEach(str => {
  const [key, value] = str.split("=");

  config[key] = value;
});

const { id, editJS } = build(config.docPath, config.configName);

const editJSPath = path.join(tempPath, `${id.replace(/@|\//gi, "_")}.js`);

fse.writeFileSync(editJSPath, editJS);
