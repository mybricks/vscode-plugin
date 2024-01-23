import React from "react";

/**
 * 用于导入 dump 的后门插件，组件库自动化测试专用。
 * 插件入口用样式隐藏了，UI 上无感知
 */
export default function loadContentPlugin() {
  return {
    name: "__nothing",
    title: "不展示",
    description: "不展示",
    data: {},
    contributes: {
      sliderView: {
        tab: {
          title: "不展示",
          icon: <div />,
          apiSet: ["project"],
          render(args: any) {
            return (
              <div>
                <textarea id="loadContentPlugin-textarea" />
                <button
                  id="loadContentPlugin-button"
                  onClick={() => {
                    const textarea = document.querySelector(
                      "#loadContentPlugin-textarea"
                    ) as HTMLTextAreaElement;
                    const content = textarea.value;
                    args.project.loadContent(JSON.parse(content));
                  }}
                >
                  导入
                </button>
              </div>
            );
          },
        },
      },
    },
  };
}
