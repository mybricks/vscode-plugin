const { uniPack } = require('mybricks-uni-pack');

const [mybricksJsonPath] = process.argv.slice(2);

uniPack.initMybricks({mybricksJsonPath});
uniPack.dev({
  open: ({ debugServerUrl }) => `https://my.mybricks.world/mybricks-app-mpsite/index.html?id=1&bricks_debug_server=${encodeURIComponent(debugServerUrl)}`
});
