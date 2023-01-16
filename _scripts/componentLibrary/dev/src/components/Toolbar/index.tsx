import React from "react";
import styles from "./index.less";

type RenderType = React.ReactNode | string | Function;

const Space = (props: any) => {
  return <div className={styles.space}>{props.children}</div>;
};

export default function Toolbar({
  left,
  right,
}: {
  left?: RenderType;
  right?: RenderType;
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <Space>{typeof left === "function" ? left() : left}</Space>
      </div>
      <div className={styles.right}>
        <Space>{typeof right === "function" ? right() : right}</Space>
      </div>
    </div>
  );
}
