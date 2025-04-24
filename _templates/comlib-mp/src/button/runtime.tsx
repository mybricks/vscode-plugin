import React from "react";
import { Button, Text } from "@tarojs/components";
import css from "./runtime.less";

export default function ({ env, data, outputs }) {
  const onClick = () => {
    if (env.runtime) {
      if (outputs["click"].getConnections().length) {
        outputs['click']();
      }
    }
  };

  return (
    <Button className={css.button} onClick={onClick}>
      <Text className={css.text}>{data.text}</Text>
    </Button>
  );
}
