import React, { Component } from "react";

import { VSCodeUiDefaultStyle } from "../../const";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

// 默认加载展示
function RenderLoading(): JSX.Element {
  return <VSCodeProgressRing style={VSCodeUiDefaultStyle}/>;
}

// 劫持调用该装饰器的函数，加入状态判断以及加载展示
export function T_loading(...args: any[]): void {
  const descriptor = args[2];
  const render = descriptor.value;

  descriptor.value = function () {
    const { loadStatus, renderLoading } = this.props;

    return !loadStatus ? render.apply(this) : (renderLoading || <RenderLoading />);
  };
}

/**
 * Loading所需参数
 * @param render        最终渲染的ReactNode
 * @param loadStatus    当前加载状态
 * @param renderLoading 加载中所需展示的ReactNode
 */
interface Props {
  render: JSX.Element

  loadStatus: boolean
  renderLoading?: JSX.Element
}

// Loading
export class Loading extends Component<Props> {
  @T_loading
  // @ts-ignore
  render() {
    return this.props.render;
  }
}
