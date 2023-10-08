import React from "react";

import css from "./index.less";

export default function Block ({ children, title }): JSX.Element {
  return <div className={css.block}>
    <div className={css.title}>
      {title}
    </div>
    {children}
  </div>;
}
