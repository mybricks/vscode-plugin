import { getJSONFromRXUIFile } from "@mybricks/file-parser";
import { compile } from "@mybricks/render-com";

const getCloudComJson = async (dumpJson: { title: string; content: any }) => {
  const toJson = getJSONFromRXUIFile(dumpJson.content);
  const inputsMap: Record<string, any> = {};
  toJson.inputs = toJson.inputs
    .filter((input: any) => {
      return input.type === "config";
    })
    .map((input: any) => {
      const { id, extValues } = input;
      const { edtType, temporaryEdtType, ...other } = extValues;
      inputsMap[id] = { editType: temporaryEdtType || edtType, ...other };
      return {
        ...input,
        type: "normal",
      };
    });
  const comJson = await compile(
    {
      title: "",
      version: "1.0.0",
      namespace: `_cloud_component__1.0.0`,
      icon: "",
      fileId: "",
      id: "",
    },
    toJson
  );
  let runtime = comJson.runtime.replace("function", "function RenderCom");
  let comdefsCode = "var comDefs = {};\n";
  runtime = comdefsCode + runtime;

  let useEffectCode = "";
  comJson.inputs.forEach((input: any) => {
    const { id } = input;
    input.id = id;
    const extValues = inputsMap[id];
    Object.keys(extValues).forEach((key) => {
      input[key] = extValues[key];
    });

    useEffectCode =
      useEffectCode +
      `
    React.useEffect(() => {
      if (typeof ctx.current.inputs["${id}"] === "function" && props.hasOwnProperty("${id}")) {
        ctx.current.inputs["${id}"](props["${id}"]);
      }
    }, [props["${id}"]]);
  `;
  });
  let returnFn = `\nreturn function (props) {
    var ctx = React.useRef(null);

    React.useMemo(() => {
      var inputs = ${JSON.stringify(comJson.inputs)};
      var outputs = ${JSON.stringify(comJson.outputs)};
      var inputsMap = {};
      var outputsMap = {};
      inputs.forEach(ipt => {
        var id = ipt.id;
        inputsMap[id] = props[id];
      });
      outputs.forEach(ipt => {
        var id = ipt.id;
        if (props.hasOwnProperty(id)) {
          const fn = props[id];
          if (typeof fn === "function") {
            outputsMap[id] = props[id];
          }
        }
      });
      ctx.current = {
        inputs: inputsMap,
        outputs: outputsMap
      }
    }, []);

    ${useEffectCode};

    React.useMemo(() => {
      const renderCom = config.env.renderCom;
      config.env.renderCom = (json, opts) => {
        return renderCom(json, {...opts, comDefs})
      }
    }, []);

    return React.createElement(RenderCom, {env: {}, data: {}, inputs: ctx.current.inputs, outputs: ctx.current.outputs, ...config});
  }`;
  return {
    toCode: encodeURIComponent(
      JSON.stringify({
        inputs: comJson.inputs,
        outputs: comJson.outputs,
        runtime: runtime + returnFn,
      })
    ),
  };
};

export { getCloudComJson };
