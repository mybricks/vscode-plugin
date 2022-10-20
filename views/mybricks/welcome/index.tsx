import React, {
  useState,
  useEffect,
  useCallback
} from "react";
import ReactDOM from "react-dom/client";

import Divider from "../../components/divider";

import "../../index.css";
import css from "./index.less";

function App (): JSX.Element {

  return (
    <div className={css.welComeContainer}>
      <CreateProject />
      <Divider />
      <QuickStart />
    </div>
  );
}

/**
 * 创建各类模版
 * @returns 
 */
function CreateProject (): JSX.Element {
  const onClick: () => void = useCallback(() => {
    vscode.postMessage({action: "create", type: "pcComlib"});
  }, []);

  return (
    <div
      data-mybricks-btn
      onClick={onClick}
    >
      <div>新建PC组件库</div>
    </div>
  );
}

/**
 * 快速开始
 * @returns 
 */
function QuickStart (): JSX.Element {
  const [recentProjectPaths, setRecentProjectPaths] = useState<string[]>(vscode.getState().recentProjectPaths || []);

  useEffect(() => {
    function messageEvent (event: MessageEvent<any>) {
      const { action, value } = event.data;
  
      switch (action) {
        case "invalidAddress":
          resetRecentProjectPaths(value);
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", messageEvent);
    
    return () => {
      window.removeEventListener("message", messageEvent);
    };
  }, []);

  const resetRecentProjectPaths: (dirName: string) => void = useCallback((dirName) => {
    setRecentProjectPaths(recentProjectPaths.filter(recentProjectPath => recentProjectPath !== dirName));
  }, [recentProjectPaths]);

  const onClick: (dirName: string) => void = useCallback((dirName) => {
    vscode.postMessage({action: 'openDir', value: dirName});
  }, []);

  return recentProjectPaths.length ? (
    <>
      <div data-mybricks-text>最近打开</div>
      {recentProjectPaths.map(recentProjectPath => {
        const dirName = recentProjectPath.split('/').pop();

        return dirName && (
          <div
            data-mybricks-btn
            key={recentProjectPath}
            onClick={() => onClick(recentProjectPath)}
          >
            <div>{dirName}</div>
          </div>
        );
      })}
    </>
  ) : <></>;
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(<App />);
