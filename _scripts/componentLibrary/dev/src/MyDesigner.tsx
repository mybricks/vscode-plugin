import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  useLayoutEffect
} from "react";
import { message } from "antd";
import toolsPlugin from "@mybricks/plugin-tools";
import servicePlugin, {call as callConnectorHttp} from "@mybricks/plugin-connector-http"; //连接器插件和运行时

import css from "./MyDesigner.less";

const localDataKey = "--mybricks--";

export default function MyDesigner () {
  const designerRef = useRef<{ dump: () => any, toJSON: () => any }>();
  const [projectJson, setProjectJson] = useState();
  const [SPADesigner, setSPADesigner] = useState(null);

  useLayoutEffect(() => {
    const pageContent = window.localStorage.getItem(localDataKey);
    setProjectJson(JSON.parse(pageContent || '{}'));
  }, []);

  useMemo(() => {
		(window as any).mybricks.SPADesigner && setSPADesigner((window as any).mybricks.SPADesigner);
	}, []);

  const save = useCallback(() => {
    const json = designerRef.current?.dump();

    window.localStorage.setItem(localDataKey, JSON.stringify(json));
    message.info("保存完成");
  }, []);

  const clear = useCallback(() => {
    window.localStorage.removeItem(localDataKey);
    window.location.reload();
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

  const getConfig = useCallback(({projectJson}: any) => {
    return {
      geoView: {
        scenes: false,
      },
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
        servicePlugin()
      ],
      comLibLoader() {
        return new Promise((resolve) => {
          // resolve(['./libEdt.js']); 
          // @ts-ignore
          resolve(window['__comlibs_edit_']);
        });
      },
      editView: {},
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
          callConnector(connector: any, params: any) {//调用连接器
            if (connector.type === 'http') {//服务接口类型
              return callConnectorHttp(connector, params, {
                // 发送请求前的钩子函数
                before(options) {
                  return {
                    ...options
                  };
                }
              });
            } else {
              return Promise.reject('错误的连接器类型.');
            }
          },
        },
      },
    };
  }, []);

  return (
    <>
      <div className={css.show}>
        <div className={css.toolbar}>
          <div className={css.tt}>&lt;定制您自己的无代码设计解决方案&gt;</div>
          <div className={css.btns}>
            {/*<button onClick={switchSlider}>激活连接器插件</button>*/}
          </div>
          <button className={css.primary} onClick={save}>保存</button>
          <button onClick={clear}>清空本地数据</button>
          <button onClick={preview}>预览</button>
        </div>
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
