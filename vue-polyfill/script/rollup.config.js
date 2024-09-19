const path = require('path');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');
const json = require('@rollup/plugin-json');
const image = require('@rollup/plugin-image');
const terser = require('@rollup/plugin-terser');
const { babel } = require('@rollup/plugin-babel');

const packageJson = require('./../package.json');

const babelOptions = {
  presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
};

const commonConfig = {
  output: {
    dir: path.resolve(__dirname, `./../dist/${packageJson.version}`),
    // dir: path.resolve(__dirname, `./../../_scripts/componentLibrary/dev/public/assets/vue-polyfill/${packageJson.version}`),
    format: 'umd',
    globals: {
      vue: 'Vue'
    }
  },
  external: ['react', 'react-dom', 'vue'],
  plugins: [
    // postcss({
    //   extract: false,
    //   modules: true,
    //   process: processLess,
    // }),
    // nodeResolve(),
    resolve({
      // jsnext: true,
      // main: true,
      // browser: true,
    }),
    babel(babelOptions),
    commonjs(),
    // typescript({
    //   check: false, // 不检查ts报错
    //   tsconfig: {
    //     compilerOptions: {
    //       // module: 'esnext',
    //       target: 'esnext',
    //       rootDir: './../'
    //     },
    //   },
    // }),
    json(),
    terser()
  ],
};

module.exports = [
  {
    input: [path.resolve(__dirname, './../vue2.tsx')],
    ...commonConfig,
  },
  {
    input: [path.resolve(__dirname, './../vue3.tsx')],
    ...commonConfig,
  },
];
