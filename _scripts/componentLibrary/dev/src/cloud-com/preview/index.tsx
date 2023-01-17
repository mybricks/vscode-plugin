import React, { useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { render as renderWeb } from "@mybricks/render-web";
import { call as callConnectorHttp } from "@mybricks/plugin-connector-http";
import Toolbar from "../../components/Toolbar";
import Button from "../../components/Button";
import Config from "./Components/Config";
import Sider from "./Components/Sider";
import { createScript } from "../../utils/createScript";
import { localPreviewDataKey } from "../const";
import VirtualList from "rc-virtual-list";
import styles from "./index.less";

const Preview = () => {
  const jsonStr = window.localStorage.getItem(localPreviewDataKey);
  if (!jsonStr) {
    return <div className={styles.empty}>无预览数据</div>;
  }

  const [comp, setComp] = useState({});
  const [resList, setList] = useState<Array<Record<string, any>>>([]);
  const compRef = useRef<any>();
  const onRun = () => {
    setComp(compRef.current.getValues());
  };
  const onReset = () => {
    setComp({});
  };

  const { inputs, runtime, outputs } = JSON.parse(
    decodeURIComponent(JSON.parse(jsonStr).toCode)
  );

  const outputProps = {};
  outputs.forEach(({ id, title }: { id: string; title: string }) => {
    Object.assign(outputProps, {
      [id]: (value: any) => {
        setList([...resList, { id, title, value }]);
      },
    });
  });

  const Component: (props: any) => JSX.Element = new Function(
    "config",
    runtime
  )({
    env: {
      renderCom: (...args: any) => {
        return Promise.resolve(
          renderWeb(args[0], { ...args[1], comDefs: undefined })
        );
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
  });

  return (
    <div className={styles.container}>
      <Toolbar
        left={
          <div className={styles.title}>
            &lt;定制您自己的无代码设计解决方案-云组件开发调试&gt;
          </div>
        }
      />
      <div className={styles.main}>
        <Sider title="输入项" position="left">
          <Config input={inputs} ref={compRef} />
        </Sider>
        <div className={styles.content}>
          <div className={styles.bar}>
            <Button type="primary" onClick={onRun}>
              执行
            </Button>
            <Button onClick={onReset}>重置</Button>
          </div>
          <div className={styles.component}>
            <Component {...comp} {...outputProps} />
          </div>
        </div>
        <Sider title="输出项" position="right">
          <VirtualList
            height={document.body.clientHeight - 80}
            data={resList}
            itemKey={(item) => `${item.id}+${Math.random()}`}
            style={{ margin: -16 }}
          >
            {({ id, title, value }, index) => (
              <div key={index} className={styles["list-item"]}>
                <span>{`${title}(${id})`}</span>:
                <span>{JSON.stringify(value)}</span>
              </div>
            )}
          </VirtualList>
        </Sider>
      </div>
    </div>
  );
};

createScript("./libEdt.js", () => {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  root.render(<Preview />);
});
