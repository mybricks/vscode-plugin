import React, { useCallback, useRef, useState } from "react";
import styles from "./index.less";
interface SiderProps {
  children?: string | React.ReactNode;
  headStyle?: React.CSSProperties;
  title: string;
  position: "left" | "right";
  resizeAble?: boolean;
  style?: React.CSSProperties;
}
export default (props: SiderProps) => {
  const {
    title,
    position = "left",
    headStyle,
    style,
    resizeAble = true,
    children,
  } = props;
  const siderRef = useRef<HTMLDivElement>(null);
  const border =
    position === "left"
      ? { borderRight: "1px solid #eee" }
      : { borderLeft: "1px solid #eee" };
  const [wh, setWh] = useState<WType>();
  return (
    <div
      ref={siderRef}
      className={styles.sider}
      style={{ ...style, ...border, ...wh }}
    >
      <div className={styles.header} style={headStyle}>
        <h3>{title}</h3>
      </div>
      <div className={styles.content}>{children}</div>
      {resizeAble && (
        <Resizer
          direction={position === 'left' ? 'right' : 'left'}
          onResize={(value) => {
            setWh(value);
          }}
        />
      )}
    </div>
  );
};

type WType = { width: number };
type XType = { x: number };

const Resizer = ({
  direction = "left",
  onResize,
}: {
  direction: "left" | "right";
  onResize: (value: WType) => void;
}) => {
  const resizerRef = useRef<HTMLDivElement>(null);
  const previousDimension = useRef<WType>({} as WType);
  const previousPositionRef = useRef<XType>({} as XType);
  const mouseDownHandler = useCallback(
    (e: React.MouseEvent) => {
      if (!resizerRef.current) return;
      const styles = window.getComputedStyle(resizerRef.current.parentNode);
      previousDimension.current = {
        width: parseInt(styles.width, 10),
      };
      previousPositionRef.current = {
        x: e.clientX,
      };
      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    },
    [resizerRef.current]
  );

  const mouseMoveHandler = (e: MouseEvent) => {
    const dx =
      direction === "right"
        ? e.clientX - previousPositionRef.current.x
        : previousPositionRef.current.x - e.clientX;
    onResize({
      width: previousDimension.current.width + dx,
    });
  };

  const mouseUpHandler = () => {
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  return (
    <div
      ref={resizerRef}
      className={styles.resizer}
      style={direction === "left" ? { left: 0 } : { right: 0 }}
      onMouseDown={mouseDownHandler}
    />
  );
};
