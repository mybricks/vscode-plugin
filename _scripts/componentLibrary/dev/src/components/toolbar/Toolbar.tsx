import React from "react";
import css from "./Toolbar.less";


const preview_icon = (
  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="60146" width="15" height="15"><path d="M225 974.8c-18.3 0-36.6-4.8-53.3-14.5-33.4-19.3-53.3-53.8-53.3-92.4V156c0-38.6 19.9-73.1 53.3-92.4 33.4-19.3 73.3-19.3 106.7 0l616.6 356c33.4 19.3 53.3 53.8 53.3 92.4s-19.9 73.1-53.3 92.4l-616.6 356c-16.7 9.6-35 14.4-53.4 14.4z m0.1-840.2c-4.9 0-8.8 1.8-10.8 2.9-3.2 1.9-10.7 7.4-10.7 18.5v712c0 11.1 7.5 16.6 10.7 18.5 3.2 1.9 11.7 5.5 21.3 0l616.6-356c9.6-5.5 10.7-14.8 10.7-18.5 0-3.7-1-12.9-10.7-18.5l-616.6-356c-3.7-2.1-7.3-2.9-10.5-2.9z" fill="#2c2c2c" p-id="60147"></path></svg>
);

const delete_icon = (
  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8171" width="15" height="15"><path d="M779.52 1002.666667h-535.04A116.650667 116.650667 0 0 1 128 886.186667V170.666667h768v715.52c0 64.170667-52.309333 116.48-116.48 116.48zM213.333333 256v630.101333c0 17.237333 13.994667 31.232 31.146667 31.232h534.954667a31.232 31.232 0 0 0 31.146666-31.232V256h-597.333333z" fill="#2c2c2c" p-id="8172"></path><path d="M917.333333 256h-810.666666a42.666667 42.666667 0 1 1 0-85.333333h810.666666a42.666667 42.666667 0 1 1 0 85.333333z m-298.666666-128h-213.333334a42.666667 42.666667 0 1 1 0-85.333333h213.333334a42.666667 42.666667 0 0 1 0 85.333333z m-213.333334 597.333333a42.666667 42.666667 0 0 1-42.666666-42.666666V426.666667a42.666667 42.666667 0 1 1 85.333333 0v256a42.666667 42.666667 0 0 1-42.666667 42.666666z m213.333334 0a42.666667 42.666667 0 0 1-42.666667-42.666666V426.666667a42.666667 42.666667 0 1 1 85.333333 0v256a42.837333 42.837333 0 0 1-42.666666 42.666666z" fill="#2c2c2c" p-id="8173"></path></svg>
);

interface ToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
  onDelete?: () => void;
}

export default function Toolbar(props: ToolbarProps) {
  return (
    <div className={css.toolbar}>
      <div className={css.left}>
        <span className={css.title}>MyBricks开发者工具</span>
        <a href="https://docs.mybricks.world/docs/component-extension/component-extend/" target="_blank">文档中心</a>
      </div>
      <div id="vscode_toolbar_center"></div>
      <div className={css.right}>
        {props.onSave && <button className={`${css.button} ${css.mainButton}`} onClick={props.onSave}>保存</button>}
        {props.onPreview && <div className={css.action_btn} data-mybricks-tip={`{content:'预览',position:'bottom'}`} onClick={props.onPreview}>
          {preview_icon}
        </div>}
        {props.onDelete && <div className={css.action_btn} data-mybricks-tip={`{content:'清除',position:'bottom'}`} onClick={props.onDelete}>
          {delete_icon}
        </div>}
      </div>
    </div>
  );
}
