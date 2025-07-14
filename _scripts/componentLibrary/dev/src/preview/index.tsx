import React from "react";
import ReactDOM from "react-dom/client";

import axios from "axios";
import { call } from "@mybricks/plugin-connector-http";
// @ts-ignore
import { render as renderUI } from "@mybricks/render-web";
import mergeWith from "lodash/mergeWith";
import application from "@vscode/application";

//准备编译的数据，结构为 {slot,script}，根据 toJSON 导出
let json = localStorage.getItem("--preview--");

if (!json) {
  throw new Error("数据错误");
}

try {
  json = JSON.parse(json);
} catch (ex) {
  throw ex;
}

(async function init() {
  // const script = document.createElement("script");

  // script.src = "./libEdt.js";

  // script.onload = () => {
  //   const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

  //   root.render(<Page />);
  // };

  // document.body.appendChild(script);

  const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

  root.render(<Page />);
})();

const renderOptions = {
  env: mergeWith({
    i18n(text: string) {
      return text;
    },
    callConnector: call,
    vars: { // 环境变量
      getQuery () { // 获取真实路由参数
        return {};
      },
    },
    ajax(url: string, opts: any) {
      return new Promise((resolve, reject) => {
        if (typeof url !== 'string') {
          reject('url is undefined');
        }
        axios({url, ...opts}).then(resp => {
          if (resp && resp.status === 200) {
            resolve(resp.data);
          } else {
            reject(resp);
          }
        }).catch(error => {
          reject(error);
        });
      });
    }
  }, application?.com?.env || {})
};

function Page() {
  return (
    <div style={{width: '100%', height: '100%'}}>
      {
        renderUI(json, renderOptions)
      }
    </div>
  );
}
