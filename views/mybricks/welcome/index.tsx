import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import "../../index.css";
import css from "./index.less";

function App (): JSX.Element {

  const onClick: () => void = useCallback(() => {
    vscode.postMessage({action: "create", type: "pcComlib"});
  }, []);

  return (
    <div className={css.publishContainer}>
      <div
        data-mybricks-btn
        onClick={onClick}
      >
        <div>新建PC组件库</div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(<App />);
