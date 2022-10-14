declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// type MessageType = 'RELOAD' | 'COMMON';

// interface Message {
//   type: MessageType;
//   payload?: any;
// }

// interface CommonMessage extends Message {
//   type: 'COMMON';
//   payload: string;
// }

// interface ReloadMessage extends Message {
//   type: 'RELOAD';
// }

type VSCode = {
  postMessage<T>(message: T): void;
  getState(): any;
  setState(state: any): void;
};

declare const vscode: VSCode;