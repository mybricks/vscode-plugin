const myplugin = require("./myplugin");
const ignoreWarningPlugin = require("./ignoreWarningPlugin");
const portFinderSync = require("portfinder-sync");

const basePort = 8000;
const openPort = portFinderSync.getPort(basePort);

if (basePort !== openPort) {
  console.log(`${basePort} 端口被占用，开启新端口 ${openPort}`.blue);
}

module.exports = {
  mode: "development",
  entry: process.env.entry,
  output: {
    filename: "bundle.js",
    libraryTarget: "umd",
    library: "[name]"
  },
  cache: {
    type: "filesystem",
    allowCollectingMemory: true,
  },
  stats: {
    colors: true,
    preset: 'normal'
  },
  resolve: {
    alias: {},
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  externals: [{
    "react": {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "React"
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "react-dom",
      root: "ReactDOM"
    }
  }],
  devtool: "cheap-source-map",
  devServer: {
    allowedHosts: "all",
    static: {
      // directory: outputPath,
    },
    // port: devPort,
    port: openPort,
    host: "0.0.0.0",
    client: {
      logging: "warn"
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
    },
    proxy: []
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react"
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", {"loose": true}]
              ],
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react"
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", {"loose": true}]
              ],
              cacheDirectory: true
            }
          },
          {
            loader: "ts-loader",
            options: {
                silent: true,
                transpileOnly: true,
            },
          },
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: "style-loader",
            options: {attributes: {title: "less"}}
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]-[hash:5]"
              }
            }
          },
          "less-loader"
        ]
      },
      {
        test: /\.d.ts$/i,
        use: [
          {loader: "raw-loader"}
        ]
      },
      {
        test: /\.(xml|txt|html|cjs|theme)$/i,
        use: [
          {loader: "raw-loader"}
        ]
      }
    ]
  },
  optimization: {
    concatenateModules: false
  },
  plugins: [
    new ignoreWarningPlugin(),
    new myplugin({entry: process.env.entry, docPath: process.env.docPath, configName: process.env.configName})
  ]
};
