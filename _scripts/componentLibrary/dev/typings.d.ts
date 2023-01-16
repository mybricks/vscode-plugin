declare module "*.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.less" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "@mybricks/file-parser";

declare module "@mybricks/render-com" {
  const rederCom: { compile: (info: any, json: any) => any };
  export default rederCom;
}

declare module "@mybricks/designer";

declare module "@mybricks/render-web";
