import React, {
  // useRef,
  // useMemo,
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
      {/* <QuickStart /> */}
    </div>
  );
}

/**
 * 创建各类模版
 * @returns 
 */
function CreateProject (): JSX.Element {
  const onCreate: any = useCallback((type: any) => {
    vscode.postMessage({action: "create", type});
  }, []);

  return (
    <>
      <div
        data-mybricks-btn
        onClick={() => { onCreate("pcComlib"); }}
      >
        <div>新建PC端组件库</div>
      </div>
      <div
        data-mybricks-btn
        onClick={() => { onCreate("mpComlib"); }}
      >
        <div>新建移动端组件库</div>
      </div>
      {/* <div
        data-mybricks-btn
        onClick={() => { onCreate("pcComlib-vue3"); }}
      >
        <div>新建PC组件库（Vue3）</div>
      </div> */}
      {/* <div
        data-mybricks-btn
        onClick={() => { onCreate("h5VueComlib"); }}
      >
        <div>新建H5组件库(Vue)</div>
      </div> */}
    </>
  );
}

/**
 * 快速开始
 * @returns 
 */
function QuickStart (): JSX.Element {
  const [vscodeState] = useState(vscode.getState());
  const [currentProjectPath] = useState<string>(vscodeState.currentProjectPath);
  const [recentProjectPaths, setRecentProjectPaths] = useState<string[]>(vscodeState.recentProjectPaths || []);

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

  return <></>;

  // return recentProjectPaths.length ? (
  //   <>
  //     <div data-mybricks-text>最近打开</div>
  //     {recentProjectPaths.map(recentProjectPath => {
  //       const dirName = recentProjectPath.split('/').pop();
  //       const isCurrent = currentProjectPath === recentProjectPath;

  //       return dirName && (
  //         <div
  //           data-mybricks-btn={isCurrent ? "debug" : true}
  //           key={recentProjectPath}
  //           onClick={() => onClick(recentProjectPath)}
  //         >
  //           {/* <Tooltip title={recentProjectPath}> */}
  //             <div>{isCurrent ? "(当前)" : ""}{dirName}</div>
  //           {/* </Tooltip> */}
  //         </div>
  //       );
  //     })}
  //   </>
  // ) : <></>;
}

// function Tooltip (props: React.PropsWithChildren<{title: string}>) {
//   const ref = useRef(null);

//   useEffect(() => {
//     console.log(props, 'props');
//     console.log(React.isValidElement(props.children));
//     console.log(props.children, props.children instanceof React.Component, 'children');

//     console.log(ref, 'ref');
//   }, []);

//   const RenderTool = useMemo(() => {
//     const { children } = props;

//     let renderDom = React.isValidElement(children) ? children : <span>{children}</span>;

//     renderDom = React.cloneElement(
//       renderDom,
//       { ref }
//     );

//     return renderDom;
//   }, []);

//   return RenderTool;
// }

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(<App />);
