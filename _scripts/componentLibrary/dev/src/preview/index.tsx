import React from "react";
import ReactDOM from "react-dom/client";
import { call } from "@mybricks/plugin-connector-http";
// @ts-ignore
import { render as renderUI } from "@mybricks/render-web";

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

function Page() {
  return (
    <div>
      {
        renderUI(json, {
          env: {
            i18n(text: string) {
              return text;
            },
            callConnector: call,
            vars: { // 环境变量
              getQuery () { // 获取真实路由参数
                return {};
              },
            },
          },
        })
      }
    </div>
  );
}
