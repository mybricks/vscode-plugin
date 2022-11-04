import React, {
  useMemo,
  useState,
  useEffect,
  ReactNode,
  useCallback
 } from "react";
import ReactDOM from "react-dom/client";

import {
  VSCodeOption,
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeTextField
} from "@vscode/webview-ui-toolkit/react";
import { VSCodeUiDefaultStyle } from "../../const";
import { Loading } from "../../components/loading";

import css from "./index.less";

function App (): JSX.Element {
  const [files, setFiles] = useState<Array<{key: string, value: any}> | null>(null);
  const [childEvents] = useState<any>({});

  useEffect(() => {
    function messageEvent (event: MessageEvent<any>) {
      const { type, value } = event.data;

      if (type === "GET") {
        setFiles(value || []);
      } else if (type === "POST") {
        childEvents.submitButtonCallBack();
      }
    };

    window.addEventListener("message", messageEvent);

    // 获取初始化数据
    vscode.postMessage({type: "GET"});

    return () => {
      window.removeEventListener("message", messageEvent);
    };
  }, []);

  const Title: JSX.Element = useMemo(() => {
    return (
      <div className={css.title}>发布配置</div>
    );
  }, []);

  return (
    <div className={css.container}>
      <Loading
        render={(
          <>
            {Title}
            <ConfigurationArea files={files as Array<{key: string, value: any}>} childEvents={childEvents}/>
          </>
        )}
        loadStatus={!files}
      />
    </div>
  );
}

function ConfigurationArea ({files, childEvents}: {files: Array<{key: string, value: any}>, childEvents: any}): JSX.Element {

  const [file, setFile] = useState<string>("");
  const [config, setConfig] = useState({publishApi: "", publishConfig: {token: {key: "", value: ""}}});
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false);

  useMemo(() => {
    childEvents.submitButtonCallBack = () => {
      setSubmitButtonLoading(false);
    };
  }, []);

  const FileSelector: JSX.Element = useMemo(() => {
    const selections: string[] = [];
    const configMap: any = {};

    files.forEach(file => {
      const { key, value } = file;

      selections.push(key);
      configMap[key] = value;
    });

    const defaultSelection = selections[0];

    setFile(defaultSelection);
    setConfig(configMap[defaultSelection]);

    return (
      <ConfigItem
        label="配置文件"
        value={(
          <VSCodeDropdown position="below" style={VSCodeUiDefaultStyle} onChange={(e: any) => {
            setConfig(configMap[e.target.value]);
          }}>
            {selections.map(file => <VSCodeOption className={css.CustomVSCodeOption}>{file}</VSCodeOption>)}
          </VSCodeDropdown>
        )}
      />
    );
  }, []);

  const submit: () => void = useCallback(() => {
    vscode.postMessage({type: "POST", value: {key: file, value: config}});
  }, [config]);

  return (
    <>
      <div className={css.configurationArea}>
        {FileSelector}
        <ConfigItemDivider />
        <ConfigItem
          label="发布地址(保留字段:publishApi)"
          value={(
            <VSCodeTextField
              value={config.publishApi || ""}
              placeholder="请填写发布地址"
              style={VSCodeUiDefaultStyle}
              onChange={(e: any) => config.publishApi = e.target.value}
            />
          )}
        />
        <ConfigItem
          title="鉴权信息(例:{key:token,value:xxx})"
          label={(
            <VSCodeTextField
              value={config.publishConfig.token.key || ""}
              placeholder="key"
              style={VSCodeUiDefaultStyle}
              onChange={(e: any) => config.publishConfig.token.key = e.target.value}
            />
          )}
          value={(
            <VSCodeTextField
              value={config.publishConfig.token.value || ""}  
              placeholder="value"
              style={VSCodeUiDefaultStyle}
              onChange={(e: any) => config.publishConfig.token.value = e.target.value}
            />
          )}
        />
        <ConfigItem
          value={(
            <VSCodeButton onClick={submit} disabled={submitButtonLoading}>
              {submitButtonLoading ? "请稍后..." : "确认修改"}
            </VSCodeButton>
          )}
        />
      </div>
    </>
  );
}

function ConfigItem ({title, label, value}: {title?: ReactNode, label?: ReactNode, value: ReactNode}): JSX.Element {
  return (
    <div className={css.configItem}>
      {title && <div className={css.title}>{title}</div>}
      <div className={css.content}>
        <div className={css.configLabel}>
          {label}
        </div>
        <div className={css.configValue}>
          {value}
        </div>
      </div>
    </div>
  );
}

function ConfigItemDivider (): JSX.Element {
  return <VSCodeDivider style={{marginBottom: 16}}/>;
}

const root: ReactDOM.Root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(<App />);
