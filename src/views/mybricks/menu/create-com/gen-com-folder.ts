import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import * as path from 'path';

const Template = {
  comJson: ({
    title,
    namespace,
    inputs = [],
    outputs = [],
    slots = []
  }) => {
    const comFile = {
      title,
      namespace,
      version: '1.0.0',
      description: '我是自动生成的描述',
      author: 'robot',
      author_name: 'robot',
      data: "./data.json",
      editors: "./editors.ts",
      runtime: './runtime.ts',
      inputs,
      outputs,
      slots,
    };
    return comFile;
  },
  editors: () => {

  },
  editorWrapper: (items: string) => {
    return `
export default {
  ':root': [${items}
  ]
}`;
  },
  editorItem: ({ key, title, type, }) => {
    return `
    {
      title: "${title}",
      type: "${type}",
      value: {
        get({ data }) {
          return data.${key};
        },
        set({ data }, value) {
          data.${key} = value;
        },
      },
    },`;
  },
  editorEventItem: ({ title, id }) => {
    return `
    {
      title: "${title}",
      type: "_event",
      options: {
        outputId: "${id}",
      },
    },
    `
  },
  runtime: (compPath: string) => {
    return`
import Component from './${compPath}';
const EMPTY_VALYE = Symbol('empty');

const BLACK_EVENT_LIST = ['show', 'hide', 'showOrHide'];
function Hoc (WrappedComponent) {
  return {
    data() {
      const { m } = this.$attrs;

      const inputValues = {}

      Object.keys(m.inputs).forEach(name => {
        if (!BLACK_EVENT_LIST.includes(name)) {
          inputValues[name] = EMPTY_VALYE; // 必须初始化，因为Vue里未定义的key是不会有响应式的
          m.inputs[name]?.((value) => {
            this.inputValues[name] = value
          })
        }
      })

      return {
        inputValues
      }
    },
    created() {
     
    },
    computed: {
      renderProps() {
        const { m } = this.$attrs;
        Object.keys(this.inputValues).forEach(key => {
          if (this.inputValues[key] !== EMPTY_VALYE) {
            m.data[key] = this.inputValues[key]
          }
        })
        
        return m.data
      }
    },
    render(createElement) {
      const { m } = this.$attrs;

      return createElement(WrappedComponent, {
        props: this.renderProps,
        on: m.outputs,
        scopedSlots: this.$scopedSlots,
      })
    }
  }
}

export default Hoc(Component);
    `;
  },
};

const getDataItemFromPropType = (prop) => {
  const { type, name, defaultValue } = prop ?? {};
  
  switch (true) {
    case type.name === 'string': {
      if (defaultValue?.func) {
        return `""`;
      }
      return defaultValue?.value ?? `""`;
    }
    case type.name === 'object': {
      if (defaultValue?.func) {
        return `{}`;
      }
      return defaultValue?.value ?? `{}`;
    }
    case type.name === 'boolean': {
      if (defaultValue?.func) {
        return; 
      }
      return defaultValue?.value;
    }
    case type.name === 'undefined': {
      return `undefined`;
    }
    default: {
      return `undefined`;
    }
  }
};

const getInputDefineFromProp = (prop) => {
  const { type, name, defaultValue } = prop ?? {};
  if (['object', 'array'].some(item => type?.name?.indexOf?.(item) >= 0)) {
    return {
      id: name,
      title: name,
    };
  }
  return;
};

const getOutputDefineFromEvent = (output) => {
  const { name } = output ?? {};
  return {
    id: name,
    title: name
  };
};


const getSlotstDefineFromSlots = (slot) => {
  const { name } = slot ?? {};
  return {
    id: name,
    title: name
  };
};


const getEditorItemFromProp = (prop) => {
  const { type, name, defaultValue } = prop ?? {};

  let editorType: any = null;

  switch (true) {
    case type.name === 'string': {
      editorType = 'text';
      break;
    }
    case type.name === 'boolean': {
      editorType = 'switch';
      break;
    }
    case type.name === 'number': {
      editorType = 'switch';
      break;
    }
  }

  return { key: name, title: name, type: editorType };
};


export default async (savePath, {
  schema
}) => {
  try {
    // let namespace = schema?.displayName;

    // if (!namespace) {
    //   namespace = await vscode.window.showInputBox({
    //     placeHolder: '当前组件没有name，请输入组件名称，英文和中划线表示'
    //   });
    // }

    // if (!namespace) {
    //   vscode.window.showErrorMessage('组件解析失败');
    //   return
    // }

    // const folderName = namespace.toLowerCase();
    // const folderPath = path.join(rootPath, folderName);

    const namespace = schema?.namespace;

    const folderPath = savePath;

    const isExist = fse.existsSync(folderPath);

    if (isExist) {
      return;
    }
    fse.ensureDirSync(folderPath);

    const comJsonPath = path.join(folderPath, 'com.json');
    const comJson = Template.comJson({ title: namespace, namespace, });
    // (schema?.props ?? []).forEach(prop => {
    //   const input = getInputDefineFromProp(prop);
    //   if (input) {
    //     comJson.inputs.push(input);
    //   }
    // });
    // (schema?.events ?? []).forEach(event => {
    //   const output = getOutputDefineFromEvent(event);
    //   if (output) {
    //     comJson.outputs.push(output);
    //   }
    // });
    // (schema?.slots ?? []).forEach(slot => {
    //   const _slot = getSlotstDefineFromSlots(slot);
    //   if (_slot) {
    //     comJson.slots.push(_slot);
    //   }
    // });
    fse.writeJSONSync(comJsonPath, comJson, { spaces: 2 });


    const dataJsonPath = path.join(folderPath, 'data.json');
    const dataJson: any = {};
    (schema?.props ?? []).forEach(prop => {
      const value = getValue(getDataItemFromPropType(prop));
      dataJson[prop.name] = value;
    });
    fse.writeJSONSync(dataJsonPath, dataJson, { spaces: 2 });
    

    const editorsPath = path.join(folderPath, 'editors.ts');
    let editorItems = '';
    // (schema?.props ?? []).forEach(prop => {
    //   const editorProps = getEditorItemFromProp(prop);
    //   if (!editorProps.type) {
    //     return
    //   }
    //   editorItems += Template.editorItem(editorProps);
    // });
    // comJson.outputs.forEach(output => {
    //   editorItems += Template.editorEventItem(output)
    // });
    
    fse.writeFileSync(editorsPath, Template.editorWrapper(editorItems), 'utf-8');


    const runtimePath = path.join(folderPath, 'runtime.ts');
    const relativePath = path.relative(path.dirname(runtimePath), schema.filePath);
    fse.writeFileSync(runtimePath, Template.runtime(relativePath), 'utf-8');

    const action = await vscode.window.showInformationMessage(`组件导入成功，已存储到${folderPath}中`, { modal: true });
  } catch (error) {
    console.log(error);
    vscode.window.showErrorMessage(error);
  }
};


function getValue (valueString: string) {
  return eval(`(function () { return ${valueString} })()`);
}