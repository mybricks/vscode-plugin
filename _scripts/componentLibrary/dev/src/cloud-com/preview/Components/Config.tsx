import React, { useImperativeHandle } from "react";
import { Form, Input, InputNumber, Radio, message } from "antd";
import CodeEditor from "@uiw/react-textarea-code-editor";
type Input = {
  id: string;
  title: string;
  defaultValue?: any;
  description?: string;
  editType: EditType;
  schema?: any;
};

type EditType =
  | "text"
  | "switch"
  | "number"
  | "array"
  | "code-json"
  | "code-js"
  | "style";

const codeType = ["array", "code-json", "code-js", "style"]

interface Props {
  input: Array<Input>;
}
const Comp = ({ input }: Props, ref: any) => {
  const [form] = Form.useForm();
  useImperativeHandle(
    ref,
    () => ({
      getValues() {
        const values = form.getFieldsValue()
        input.forEach((item) => {
          const { id, editType } = item
          if (codeType.includes(editType) && !!values[id]) {
            try {
              values[id] = JSON.parse(values[id])
            } catch (error) {
              message.error('请输入正确的json格式数据')
            }

          }
        })
        return values;
      },
    }),
    [input]
  );

  const itemAdapter = (type: EditType) => {
    if (type === "text") {
      return <Input allowClear />;
    }
    if (type === "switch") {
      return (
        <Radio.Group>
          <Radio value={true}>true</Radio>
          <Radio value={false}>false</Radio>
        </Radio.Group>
      );
    }
    if (type === "number") {
      return <InputNumber />;
    }
    if (codeType.includes(type)) {
      return <EditorInput />;
    }
    return <Input allowClear />;
  };

  return (
    <Form form={form} layout="vertical">
      {input.map(
        ({ id, title, description, defaultValue, editType }, index) => (
          <Form.Item
            key={`${id}-${index}`}
            name={id}
            label={title}
            extra={description}
            initialValue={defaultValue}
          >
            {itemAdapter(editType)}
          </Form.Item>
        )
      )}
    </Form>
  );
};

export default React.forwardRef<any, Props>(Comp);

function EditorInput({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [code, setCode] = React.useState(value);
  const _onChange = (value: string) => {
    setCode(value);
    typeof onChange === "function" && onChange(value);
  };
  return (
    <CodeEditor
      value={code}
      language="json"
      placeholder="Please enter code"
      onChange={(evn) => _onChange(evn.target.value)}
      padding={12}
      style={{
        fontSize: 12,
        backgroundColor: "#fff",
        fontFamily:
          "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
        border: "1px solid #d9d9d9",
        borderRadius: 2,
      }}
    />
  );
}
