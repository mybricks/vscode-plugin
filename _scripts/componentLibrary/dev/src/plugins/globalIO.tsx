type T_EdtType =
  | "text"
  | "switch"
  | "select"
  | "textarea"
  | "code"
  | "richText"
  | "array"
  | "comSelector"
  | "style";

type T_TemporaryEdtType = T_EdtType | "code-js" | "code-json";

type Option = Record<string, any>;

type T_Values = {
  edtType: T_EdtType;
  temporaryEdtType: T_TemporaryEdtType;
  defaultValue: any;
  description: string;

  keep?: boolean;
  options?: Option | string;
  customEditorValue?: string;
  customIfVisible?: string;
};

const CODE_TEMPLATE = `
export default function () {
  return {

  }
}`;

const CODE_TEMPLATE_IFVISIBLE = `
export default function () {
  return true
}`;

const opToString = Object.prototype.toString;

export default () => ({
  name: "@mybricks/plugins/topl_globalio",
  title: "逻辑视图拓展",
  author: "LiangLihao",
  ["author.zh"]: "梁李昊",
  version: "1.0.0",
  description: "逻辑视图拓展",
  contributes: {
    toplView: {
      globalIO: {
        configs: {
          addInput: {
            title: "新建编辑项",
            type: "config",
            schema: { type: "string" },
            values: {
              edtType: "text",
              temporaryEdtType: "text",
              defaultValue: "",
              description: "",
            },
            editors: [
              {
                title: "编辑类型",
                type: "select",
                options: [
                  { label: "字符", value: "text" },
                  { label: "开关", value: "switch" },
                  { label: "下拉框", value: "select" },
                  { label: "文本域", value: "textarea" },
                  { label: "富文本", value: "richText" },
                  { label: "样式", value: "style" },
                  { label: "代码编辑(javascript)", value: "code-js" },
                  { label: "代码编辑(json)", value: "code-json" },
                  { label: "数组", value: "array" },
                  { label: "组件选择器", value: "comSelector" },
                ],
                value: {
                  get({ values }: { values: T_Values }) {
                    return values["temporaryEdtType"];
                  },
                  set(
                    { values }: { values: T_Values },
                    val: T_TemporaryEdtType
                  ) {
                    values["temporaryEdtType"] = val;

                    Reflect.deleteProperty(values, "customEditorValue");

                    switch (val) {
                      case "text":
                      case "textarea":
                      case "richText":
                        values["defaultValue"] = "";
                        delete values["options"];
                        values["edtType"] = val;
                        break;
                      case "code-js":
                        values["defaultValue"] = "";
                        values["options"] = {
                          theme: "light",
                          title: "默认值",
                          language: "javascript",
                          minimap: {
                            enabled: false,
                          },
                        };
                        values["edtType"] = "code";
                        break;
                      case "code-json":
                        values["defaultValue"] = "";
                        values["options"] = {
                          theme: "light",
                          title: "默认值",
                          language: "json",
                          minimap: {
                            enabled: false,
                          },
                        };
                        values["edtType"] = "code";
                        break;
                      case "select":
                        values["defaultValue"] = "";
                        values["options"] = [];
                        values["edtType"] = val;
                        break;
                      case "array":
                        values["defaultValue"] = [];
                        values["options"] = encodeURIComponent(
                          "export default function () {\n" +
                            "  return {\n" +
                            "    \n" +
                            "  }\n" +
                            "}"
                        );
                        values["edtType"] = val;
                        break;
                      case "style":
                        values["options"] = {
                          defaultOpen: true,
                          plugins: [],
                        };
                        values["edtType"] = val;
                        break;
                      case "comSelector":
                        values["defaultValue"] = "";
                        values["customEditorValue"] = encodeURIComponent(
                          "export default function () {\n" +
                            "  return {\n" +
                            "    \n" +
                            "  }\n" +
                            "}"
                        );
                        values["edtType"] = val;
                        break;
                      case "switch":
                        values["defaultValue"] = false;
                        delete values["options"];
                        values["edtType"] = val;
                        break;
                      default:
                        break;
                    }
                  },
                },
              },
              {
                title: "描述",
                type: "text",
                value: {
                  get({ values }: { values: T_Values }) {
                    return values["description"];
                  },
                  set({ values }: { values: T_Values }, val: string) {
                    values["description"] = val;
                  },
                },
              },
              {
                title: "默认值",
                type: "text",
                ifVisible({ values }: { values: T_Values }) {
                  return ["text", "select"].includes(values["edtType"]);
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    return values["defaultValue"];
                  },
                  set({ values }: { values: T_Values }, val: string) {
                    values["defaultValue"] = val;
                  },
                },
              },
              {
                title: "默认值",
                type: "switch",
                ifVisible({ values }: { values: T_Values }) {
                  return values["edtType"] === "switch";
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    return values["defaultValue"];
                  },
                  set({ values }: { values: T_Values }, val: boolean) {
                    values["defaultValue"] = val;
                  },
                },
              },
              {
                title: "选择项配置",
                type: "select",
                ifVisible({ values }: { values: T_Values }) {
                  return values["edtType"] === "style";
                },
                options: {
                  options: [
                    { label: "尺寸", value: "SIZE" },
                    { label: "内间距", value: "PADDING" },
                    { label: "字体", value: "FONT" },
                    { label: "边框", value: "BORDER" },
                    { label: "背景色", value: "BGCOLOR" },
                    { label: "背景图", value: "BGIMAGE" },
                    { label: "阴影", value: "SHADOW" },
                    { label: "文字阴影", value: "TEXTSHADOW" },
                  ],
                  mode: "multiple",
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    const { options } = values;
                    if (typeof options === "object") {
                      return options?.plugins || [];
                    }
                    return [];
                  },
                  set({ values }: { values: T_Values }, val: string[]) {
                    if (!values["options"]?.plugins) {
                      values["options"] = {
                        defaultOpen: true,
                        plugins: [],
                      };
                    }
                    values["options"].plugins = val;
                  },
                },
              },
              {
                title: "选择项配置",
                type: "array",
                ifVisible({ values }: { values: T_Values }) {
                  return values["edtType"] === "select";
                },
                options: {
                  getTitle: (item: { [key: string]: string }) => {
                    const { label = "未定义", value = "未定义" } = item;

                    return [`标签:${label}`, `值:${value}`];
                  },
                  items: [
                    {
                      title: "标签",
                      type: "textarea",
                      value: "label",
                    },
                    {
                      title: "值",
                      type: "textarea",
                      value: "value",
                    },
                  ],
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    const { options } = values;

                    if (Array.isArray(options)) {
                      return options;
                    }

                    return [];
                  },
                  set(
                    { values }: { values: T_Values },
                    val: Array<{ label: string; value: any }>
                  ) {
                    values["options"] = val;
                  },
                },
              },
              {
                title: "默认值",
                type: "textarea",
                ifVisible({ values }: { values: T_Values }) {
                  return values["edtType"] === "textarea";
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    return values["defaultValue"];
                  },
                  set({ values }: { values: T_Values }, val: string) {
                    values["defaultValue"] = val;
                  },
                },
              },
              // TODO 富文本编辑器通过ifVisible控制显隐时不符合预期
              // {
              //   title: '默认值',
              //   type: 'richText',
              //   ifVisible({values}: {values: T_Values}) {
              //     return values['edtType'] === 'richText'
              //   },
              //   value: {
              //     get({values}: {values: T_Values}) {
              //       return values['defaultValue']
              //     },
              //     set({values}: {values: T_Values}, val: string) {
              //       values['defaultValue'] = val
              //     }
              //   }
              // },
              {
                title: "默认值",
                type: "code",
                options: {
                  theme: "light",
                  title: "默认值",
                  language: "javascript",
                  minimap: {
                    enabled: false,
                  },
                },
                ifVisible({ values }: { values: T_Values }) {
                  return values["temporaryEdtType"] === "code-js";
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    return values["defaultValue"];
                  },
                  set({ values }: { values: T_Values }, val: string) {
                    values["defaultValue"] = val;
                  },
                },
              },
              {
                title: "默认值",
                type: "code",
                options: {
                  theme: "light",
                  title: "默认值",
                  language: "json",
                  minimap: {
                    enabled: false,
                  },
                },
                ifVisible({ values }: { values: T_Values }) {
                  return values["temporaryEdtType"] === "code-json";
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    return values["defaultValue"];
                  },
                  set({ values }: { values: T_Values }, val: string) {
                    values["defaultValue"] = val;
                  },
                },
              },
              {
                title: "配置项",
                type: "code",
                options: {
                  theme: "light",
                  title: "配置项",
                  language: "javascript",
                  minimap: {
                    enabled: false,
                  },
                  displayType: "button",
                },
                ifVisible({ values }: { values: T_Values }) {
                  return ["array"].includes(values["edtType"]);
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    return values["options"] || CODE_TEMPLATE;
                  },
                  set({ values }: { values: T_Values }, val: string) {
                    values["options"] = val;
                  },
                },
              },
              {
                title: "schema",
                type: "text",
                ifVisible({ values }: { values: T_Values }) {
                  return ["comSelector"].includes(values["edtType"]);
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    if (opToString.call(values.options) !== "[object Object]") {
                      values.options = {};
                    }
                    // @ts-ignore
                    return values.options.schema || "";
                  },
                  set({ values }: { values: T_Values }, val: string) {
                    if (opToString.call(values.options) !== "[object Object]") {
                      values.options = {};
                    }
                    // @ts-ignore
                    values.options.schema = val;
                  },
                },
              },
              {
                title: "自定义Get/Set",
                type: "code",
                options: {
                  theme: "light",
                  title: "自定义Get/Set",
                  language: "javascript",
                  minimap: {
                    enabled: false,
                  },
                  displayType: "button",
                },
                ifVisible({ values }: { values: T_Values }) {
                  return ["comSelector"].includes(values["edtType"]);
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    return values["customEditorValue"] || CODE_TEMPLATE;
                  },
                  set({ values }: { values: T_Values }, val: string) {
                    values["customEditorValue"] = val;
                  },
                },
              },
              {
                title: "自定义ifVisible",
                description:
                  "控制当前编辑项是否可见（true：可见，false：不可见）",
                type: "code",
                options: {
                  theme: "light",
                  title: "自定义ifVisible",
                  language: "javascript",
                  minimap: {
                    enabled: false,
                  },
                  displayType: "button",
                },
                value: {
                  get({ values }: { values: T_Values }) {
                    return values["customIfVisible"] || CODE_TEMPLATE_IFVISIBLE;
                  },
                  set({ values }: { values: T_Values }, val: string) {
                    values["customIfVisible"] = val;
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
});
