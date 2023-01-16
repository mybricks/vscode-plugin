import { useRef } from "react";
import ReactDOM from "react-dom/client";
import Designer, { DesignerConfig } from "../../components/Designer";
import Toolbar from "../../components/Toolbar";
import Button from "../../components/Button";
import GlobalIO from "../../plugins/globalIO";
import { localDataKey, localPreviewDataKey } from '../const'
import { getCloudComJson } from '../../utils/getCloudComJson'
import styles from "./index.less";

const MyDesigner = () => {
  const designerRef = useRef<any>(null);

  const config: DesignerConfig = {
    mode: "component",
    plugins: [GlobalIO()],
    toplView: {
      title: '交互',
      cards: {
        main: {
          title: '组件',
          ioEditable: true
        }
      }
    },
  };

  const onSave = () => {
    const json = designerRef.current?.dump();
    window.localStorage.setItem(localDataKey, JSON.stringify(json));
  };
  const onClear = () => {
    window.localStorage.removeItem(localDataKey);
    window.location.reload();
  };
  const onPreview = async () => {
    const dumpStr = designerRef.current?.dump();
    const previewContent = await getCloudComJson(dumpStr)
    window.localStorage.setItem(localPreviewDataKey, JSON.stringify(previewContent));
    window.open("/cloud-preview.html", "cloud-preview");
  };
  return (
    <div className={styles.container}>
      <Toolbar
        left={
          <div className={styles.title}>
            &lt;定制您自己的无代码设计解决方案-云组件搭建&gt;
          </div>
        }
        right={() => (
          <>
            <Button type="primary" onClick={onSave}>
              保存
            </Button>
            <Button onClick={onClear}>清空本地数据</Button>
            <Button onClick={onPreview}>预览</Button>
          </>
        )}
      />
      <div className={styles.designer}>
        <Designer
          ref={designerRef}
          localDataKey={localDataKey}
          config={config}
        />
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<MyDesigner />);
