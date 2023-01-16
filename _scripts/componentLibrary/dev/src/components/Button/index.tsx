import React from "react";
import styles from "./index.less";

type ButtonProps = Partial<{
  type: "default" | "primary";
  className: string;
  children: string;
  onClick: (e: any) => void;
}>;

export default ({
  type = "default",
  children,
  className,
  onClick,
}: ButtonProps) => {
  return (
    <button
      className={`${styles.btn} ${styles[type]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
