import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import Divider from "../../components/divider";
import Block from "../../components/block";

import "../../index.css";
import css from "./index.less";

type DebuggerStatus = "dev" | "check" | "debug";

const typeToInfoMap = {
  dev: {
    label: "调试",
    action: "debug"
  },
  check: {
    label: "配置文件校验...",
    action: "dev"
  },
  debug: {
    label: "调试中(点击停止)",
    action: "dev"
  }
};

function App (): JSX.Element {

  return (
    <div className={css.developContainer}>
      <Debugger />
      <Divider />
      <Publish />
      {/* <Divider />
      <Block title={'实验性功能'}>
        <ImportComponent />
        <ImportSetting />
      </Block> */}
    </div>
  );
}

function Debugger (): JSX.Element {
  const [status, setStatus] = useState<DebuggerStatus>(vscode.getState().debuggerStatus || "dev");

  const onClick: () => void = useCallback(() => {
    vscode.postMessage({action: typeToInfoMap[status].action});
  }, [status]);

  useEffect(() => {
    function messageEvent (event: MessageEvent<any>) {
      const action = event.data.action;
  
      switch (action) {
        case "dev":
        case "check":
        case "debug":
          setStatus(action);
          break;
        default:
          setStatus("dev");
          break;
      }
    };

    window.addEventListener("message", messageEvent);

    return () => {
      window.removeEventListener("message", messageEvent);
    };
  }, []);

  return (
    <div
      data-mybricks-btn={status}
      onClick={onClick}
    >
      <div>{typeToInfoMap[status].label}</div>
    </div>
  );
}

function Publish (): JSX.Element {
  const onClick: () => void = useCallback(() => {
    vscode.postMessage({action: 'publish'});
  }, []);

  return (
    <div className={css.publish}>
      <div data-mybricks-btn onClick={onClick}>
        <div>发布</div>
      </div>
      {/* <div data-mybricks-btn onClick={() => {
        vscode.postMessage({action: 'settings'});
      }}>
        <div>配置发布信息</div>
      </div> */}
    </div>
    
  );
}

/**
 * 导入组件
 * @returns 
 */
function ImportComponent (): JSX.Element {
  const onClick: () => void = useCallback(() => {
    vscode.postMessage({action: "import", type: "component"});
  }, []);

  return (
    <div
      data-mybricks-btn
      onClick={onClick}
    >
      <div>导入：组件</div>
    </div>
  );
}

function ImportSetting () {
  const [saveFolder, setSaveFolder] = useState(window.importComSaveFolderPath);

  const handleSelectSaveFolder = useCallback(() => {
    vscode.postMessage({action: "import.setSaveFolderPath"});
  }, []);

  useEffect(() => {
    function messageEvent (event: MessageEvent<any>) {
      const action = event.data.action;

      if (action === 'setSaveFolder') {
        setSaveFolder(event.data.value);
      }
    };

    window.addEventListener("message", messageEvent);

    return () => {
      window.removeEventListener("message", messageEvent);
    };
  }, []);

  return (
    <div className={css.importSetting}><span className={css.text}>导入后的组件存储位置：</span><span className={css.uri} onClick={handleSelectSaveFolder}>{saveFolder || '请配置'}</span></div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(<App />);
