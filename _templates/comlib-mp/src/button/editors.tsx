export default {
  "@init"({ style, data, output }) {
    style.width = 120;
    style.height = 42;
  },
  "@resize": {
    options: ["width", "height"],
  },
  ":root": {
    "@dblclick": {
      type: "text",
      value: {
        get({ data }) {
          return data.text;
        },
        set({ data }, val) {
          data.text = val;
        },
      },
    },
    items: [
      {
        title: "按钮文案",
        type: "text",
        value: {
          get({ data }) {
            return data.text;
          },
          set({ data }, value: string) {
            data.text = value;
          },
        },
      },
      {
        title: "事件",
        items: [
          {
            title: "单击",
            type: "_event",
            options: {
              outputId: "click",
            },
          },
        ],
      },
    ],
  },
};
