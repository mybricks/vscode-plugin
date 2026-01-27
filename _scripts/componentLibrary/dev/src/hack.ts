const antd4 = (window as any).antd;
const antd5 = (window as any).antd_5_21_4;

class Hack {
  oriAntd5Message: any = antd5 ? Object.entries(antd5.message).reduce((pre: any, [key, value]) => {
    pre[key] = value;
    return pre;
  }, {}) : null;
  constructor() {
    this.useMessage(4);
  }

  useMessage(version: 4 | 5) {
    if (this.oriAntd5Message) {
      if (version === 4) {
        Object.entries(antd4.message).forEach(([key, value]) => {
          antd5.message[key] = value;
        });
      } else if (version === 5) {
        Object.entries(this.oriAntd5Message).forEach(([key, value]) => {
          antd5.message[key] = value;
        });
      }
    }
  }
}

export default new Hack();
