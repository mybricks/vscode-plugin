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

module.exports = [
  // {
  //   input: path.resolve(__dirname, '../index.tsx'),
  //   output: [
  //     { file: path.resolve(__dirname, packageJson.module), format: 'esm' },
  //   ],
  //   external: ['react', 'react-dom'],
  //   plugins: [
  //     postcss({
  //       extract: false,
  //       modules: true,
  //       process: processLess,
  //     }),
  //     // nodeResolve(),
  //     commonjs(),
  //     resolve({
  //       // jsnext: true,
  //       // main: true,
  //       // browser: true,
  //     }),
  //     typescript({
  //       check: false, // 不检查ts报错
  //     }),
  //     json(),
  //     babel(babelOptions),
  //   ],
  // },
  {
    input: path.resolve(__dirname, './../index.tsx'),
    output: [
      {
        file: path.resolve(__dirname, `./../dist/${packageJson.version}/index.umd.js`),
        format: 'umd',
        name: packageJson.name,
      },
    ],
    external: ['react', 'react-dom', 'vue'],
    plugins: [
      // postcss({
      //   extract: false,
      //   modules: true,
      //   process: processLess,
      // }),
      // nodeResolve(),
      commonjs(),
      resolve({
        // jsnext: true,
        // main: true,
        // browser: true,
      }),
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
      babel(babelOptions),
      // terser()
    ],
  },
];
