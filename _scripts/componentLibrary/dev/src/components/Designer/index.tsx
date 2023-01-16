import React, { useImperativeHandle } from "react";
import Designer from "@mybricks/designer";
import toolsPlugin from "@mybricks/plugin-tools";
import servicePlugin, {
  call as callConnectorHttp,
} from "@mybricks/plugin-connector-http";
import { merge } from 'lodash'

export type DesignerConfig = Partial<{
  plugins: Array<any>;
  comLibLoader: () => Promise<any>;
  editView: Record<string, any>;
  pageContentLoader: () => Promise<any>;
  com: Record<string, any>;
  [k: string]: any;
}>;

interface Props {
  config?: DesignerConfig;
  localDataKey: string;
}

const DesignerHoc = ({ config, localDataKey }: Props, ref: any) => {
  const projectJson = window.localStorage.getItem(localDataKey);
  const defaultConfig: DesignerConfig = {
    plugins: [toolsPlugin(), servicePlugin()],
    comLibLoader() {
      return new Promise((resolve) => {
        resolve(["./libEdt.js"]);
      });
    },
    editView: {},
    pageContentLoader() {
      //加载页面内容
      return new Promise((resolve) => {
        if (projectJson) {
          resolve(projectJson);
        } else {
          resolve(null);
        }
      });
    },
    com: {
      //组件运行配置
      env: {
        i18n(title: any) {
          //多语言
          return title;
        },
        callConnector(connector: any, params: any) {
          //调用连接器
          if (connector.type === "http") {
            //服务接口类型
            return callConnectorHttp(connector, params, {
              // 发送请求前的钩子函数
              before(options) {
                return {
                  ...options,
                };
              },
            });
          } else {
            return Promise.reject("错误的连接器类型.");
          }
        },
      },
    },
  };

  useImperativeHandle(
    ref,
    () => ({
      dump() {
        return ref.current.dump();
      },
      toJson() {
        return ref.current.toJSON();
      },
    }),
    []
  );
  return <Designer config={merge(defaultConfig, config)} ref={ref} />;
};

export default React.forwardRef<any, Props>(DesignerHoc);
