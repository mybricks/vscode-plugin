import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  useLayoutEffect
} from "react";
import axios from "axios";
import { message } from "antd";
import toolsPlugin from "@mybricks/plugin-tools";
import servicePlugin, {call as callConnectorHttp} from "@mybricks/plugin-connector-http"; //连接器插件和运行时

import css from "./MyDesigner.less";
import loadContentPlugin from "./plugins/load-content-plugin";
import { getAiEncryptData } from "./get-ai-encrypt-data";
import { Toolbar } from "./components";

const localDataKey = `--mybricks--${MYBRICKS_JSON?.componentType ?? 'NONE'}`;

const isH5 = ['H5', 'KH5'].includes(MYBRICKS_JSON?.componentType);

export default function MyDesigner () {
  const designerRef = useRef<{ dump: () => any, toJSON: () => any }>();
  const [projectJson, setProjectJson] = useState();
  const [SPADesigner, setSPADesigner] = useState(null);

  useLayoutEffect(() => {
    const pageContent = window.localStorage.getItem(localDataKey);
    setProjectJson(JSON.parse(pageContent || '{}'));
  }, []);

  useMemo(() => {
    // if (isH5 && Array.isArray(MYBRICKS_JSON?.comlibs)) { // 临时在H5调试中添加H5基础组件库
    //   const scriptEle = document.createElement('script');
    //   scriptEle.src = '/assets/comlibs/mybricks.normal-h5-comlib.vue/0.0.14/edit.js';

    //   document.body.appendChild(scriptEle);

    //   scriptEle.onload = () => {
    //     (window as any).mybricks.SPADesigner && setSPADesigner((window as any).mybricks.SPADesigner);
    //   };
    //   return;
    // }
		// (window as any).mybricks.SPADesigner && setSPADesigner((window as any).mybricks.SPADesigner);

    const script = document.createElement("script");
    script.src = MYBRICKS_JSON?.designerUrl || "/assets/designer-spa/index.min.js";
    script.onload = () => {
      (window as any).mybricks.SPADesigner && setSPADesigner((window as any).mybricks.SPADesigner);
    };
    document.body.appendChild(script);
	}, []);

  const save = useCallback(() => {
    const json = designerRef.current?.dump();

    window.localStorage.setItem(localDataKey, JSON.stringify(json));
    message.info("保存完成");
  }, []);

  const clear = useCallback(() => {
    if (confirm("确认清空本地数据")) {
      window.localStorage.removeItem(localDataKey);
      window.location.reload();
    }
  }, []);

  const preview = useCallback(() => {
    const json = designerRef.current?.toJSON();

    window.localStorage.setItem("--preview--", JSON.stringify(json));

    const win = window.open("", "preview");

    if (win) {
      if (win.location.href === "about:blank") {
        window.open("/preview.html", "preview");
      } else {
        win.focus();
      }
    }
  }, []);

  /** 将 external 中的 css 文件注入到 geoView 中 */
  const externalCss = useMemo(() => {
    const cssFiles: any = [];
    const externals = MYBRICKS_JSON?.externals ?? [];
    if (Array.isArray(externals)) {
      externals.forEach((ex) => {
        (ex?.urls ?? []).forEach((url: string) => {
          if (url.includes('.css')) {
            cssFiles.push(url);
          }
        });
      });
    }
    return cssFiles;
  }, []);

  const h5GeoView = {
    type: "mobile",
    width: 375,
    height: 667,
    scenes: true,
    theme: {
      css: [
        "./assets/editor-h5-reset.css",
      ]
    },
    toolbarContainer: '#vscode_toolbar_center',
  };

  const pcGeoView = {
    scenes: true,
    theme: {
      css: !MYBRICKS_JSON.tags || MYBRICKS_JSON.tags === 'react' ? [
        // "./assets/4.21.6.antd.min.css",
        // "./assets/editor.d5c483a324024fb6.css",
        ...externalCss
      ] : [...externalCss]
    },
    toolbarContainer: '#vscode_toolbar_center',
  };

  const getConfig = useCallback(({projectJson}: any) => {
    return {
      geoView: isH5 ? h5GeoView : pcGeoView ,
      toplView: {
        title: '交互',
        cards: {
          main: {
            title: '页面'
          }
        },
        vars: {},
        fx: {}
      },
      plugins: [
        toolsPlugin(),
        servicePlugin({
          isPrivatization: false
        }),
        loadContentPlugin(),
      ],
      comLibLoader() {
        if (window.debugComlibUrl) {
          return new Promise((resolve) => {
            // resolve(['./libEdt.js']); 
            // @ts-ignore
            resolve([window.debugComlibUrl]);
          });
        }
        return new Promise((resolve) => {
          // resolve(['./libEdt.js']); 
          // @ts-ignore
          resolve(window['__comlibs_edit_']);
        });
      },
      editView: {
        // editorAppender(editConfig) {
        //   return PcEditor({editConfig})
        // }
      },
      // aiView: getAiView(true, {}),
      pageContentLoader() {//加载页面内容
        return new Promise((resolve) => {
          if (projectJson) {
            resolve(projectJson);
          } else {
            resolve(null);
          }
        });
      },
      com: {//组件运行配置
        env: {
          i18n(title: any) {//多语言
            return title;
          },
          callConnector(connector, params, connectorConfig = {}) {
            const plugin = designerRef.current?.getPlugin(connector.connectorName);
            if (plugin) {
              // console.log("env.callConnector => ", {
              //   connector, params, connectorConfig
              // })
              // 发送请求
              return plugin.callConnector({
                ...connector,
                useProxy: false
              }, params, {
                ...connectorConfig,
                before: options => {
                  // 接口发起请求前的钩子，可处理请求参数、header 等
                  return options;
                }
              });
            } else {
              return Promise.reject('错误的连接器类型.');
            }
          },
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
        },
      },
    };
  }, []);

  return (
    <>
      <div className={css.show}>
        <Toolbar
          onSave={save}
          onPreview={isH5 ? undefined : preview}
          onDelete={clear}
        />
        <div className={css.designer}>
          {
            // @ts-ignore
            projectJson && SPADesigner && <SPADesigner config={getConfig({ projectJson })} ref={designerRef}/>
          }
        </div>
      </div>
    </>
  );
}


const getAiView = (enableAI, option) => {
  const { model } = option ?? {};

  if (enableAI) {
    return {
      async request(messages) {
        // console.log(messages[0].content)
        // console.log(messages[messages.length - 1].content)

        let content = '处理失败'
        try {
          let res = await axios({
            method: 'POST',
            url: '//ai.mybricks.world/code',
            withCredentials: false,
            data: getAiEncryptData({
              model: !!model ? model : undefined,
              messages
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }).then((res) => res.data);

          content = res.choices[0].message.content;
          return content;
        } catch (e) {
          console.error(e);
        } finally {
          //     console.log(`prompts: ${prompts},
          // question: ${question},
          // 返回结果: ${content}`)
        }
      },
      async requestAsStream(messages, tools, { write, complete, error }) {
        try {
          // console.log(messages[0].content)
          // console.log(messages[messages.length - 1].content)

          // messages[0].1 = '你好'

          // 用于debug用户当前使用的模型
          window._ai_use_model_ = model;

          const response = await fetch('//ai.mybricks.world/stream', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              getAiEncryptData({
                model: !!model ? model : undefined,
                // model: 'qwen-max-latest',
                // model: 'qwen-plus-latest',
                // model: 'qwen-turbo-latest',
                // model: 'openai/gpt-4o-mini',
                messages,
              })
            ),
          });

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            write(chunk);
          }

          complete();
        } catch (ex) {
          error(ex);
        }
      },
    };
  }

  return void 0;
};