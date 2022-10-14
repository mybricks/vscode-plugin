export type NodeDepTypes = 'dependencies' | 'devDependencies';

export type MybricksConfigCom = 'string' | {
  visible: boolean;
  title: string;
  type: string;
  icon: string;
  comAry: MybricksConfigCom[];
};

export interface ComConfig {
  data: string;
  icon: string;
  title: string;
  author: string;
  version: string;
  editors: string;
  upgrade: string;
  runtime: string;
  preview: string;
  namespace: string;
  author_name: string;
  description: string;
  
  // TODO 插件内暂时不关心内部类型
  outputs: any[];
  inputs: any[];
  slots: any[];
};

export interface LaunchJson {
  version: string;
  configurations: Array<{
    type: string;
    request: string;
    name: string;
    program: string;
  }>
}
