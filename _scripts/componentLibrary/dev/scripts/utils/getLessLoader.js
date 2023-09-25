
const getLessModuleLoaders = ({ postCssOptions }) => [
  {
    loader: 'style-loader',
    options: {attributes: {title: 'less'}}
  },
  {
    loader: 'css-loader',
    options: {
      modules: {
        localIdentName: '[local]-[hash:5]'
      }
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: postCssOptions,
    },
  },
  {
    loader: "less-loader",
    options: {
      lessOptions: {
        javascriptEnabled: true
      },
    },
  }
];


const getLessNoModulesLoaders = ({ postCssOptions }) => [
  {
    loader: 'style-loader',
    options: {attributes: {title: 'less'}}
  },
  {
    loader: 'css-loader',
    options: {
      modules: false,
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: postCssOptions,
    },
  },
  {
    loader: "less-loader",
    options: {
      lessOptions: {
        javascriptEnabled: true
      },
    },
  }
];

/**
 * @description 只有带?moduels的文件才会被css modules，这个文件由babelPluginAutoCssModules插件产生，所以必须配合使用
 */
module.exports = ({ postCssOptions }) => {
  return [
    {
      test: /\.less$/i,
      oneOf: [
        {
          resourceQuery: /modules/,
          use: getLessModuleLoaders({ postCssOptions: postCssOptions ?? {} })
        },
        {
          use: getLessNoModulesLoaders({ postCssOptions: postCssOptions ?? {} }),
        }
      ],
      exclude: /node_modules/
    },
    {
      test: /\.less$/i,
      use: getLessModuleLoaders({ postCssOptions: postCssOptions ?? {} }),
      include: /node_modules/
    },
  ];
};

