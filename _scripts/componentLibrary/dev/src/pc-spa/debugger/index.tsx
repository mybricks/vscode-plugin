import React, { useRef, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { message } from "antd";
import Designer from "../../components/Designer";
import Toolbar from "../../components/Toolbar";
import Button from "../../components/Button";

import styles from "./index.less";

const localDataKey = "--mybricks--";

const MyDesigner = () => {
  const designerRef = useRef<{ dump: () => any; toJSON: () => any }>();

  const save = useCallback(() => {
    const json = designerRef.current?.dump();
    window.localStorage.setItem(localDataKey, JSON.stringify(json));
    message.success("保存成功");
  }, []);

  const clear = useCallback(() => {
    window.localStorage.removeItem(localDataKey);
    window.location.reload();
  }, []);

  const preview = useCallback(() => {
    const json = designerRef.current?.toJSON();

    window.localStorage.setItem("--preview--", JSON.stringify(json));

    window.open("/spa-preview.html", "spa-preview");
  }, []);

  return (
    <div className={styles.container}>
      <Toolbar
        left={
          <div className={styles.title}>
            &lt;定制您自己的无代码设计解决方案-PC组件调试&gt;
          </div>
        }
        right={() => (
          <>
            <Button type="primary" onClick={save}>
              保存
            </Button>
            <Button onClick={clear}>清空本地数据</Button>
            <Button onClick={preview}>预览</Button>
          </>
        )}
      />
      <div className={styles.designer}>
        <Designer ref={designerRef} localDataKey={localDataKey} />
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<MyDesigner />);
