const mybricksConfig = {
  h5: {
    viewWidth: 375,
  },
};

const build = async () => {
  const [mybricksJsonPath] = process.argv.slice(2);
  console.log("[MP:build - mybricksJsonPath] => ", mybricksJsonPath);
  const { uniPack } = require('mybricks-uni-pack');
  await uniPack.initMybricks({ ...mybricksConfig, mybricksJsonPath });
  await uniPack.build({});
};

build();