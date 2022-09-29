import * as path from 'path';
import * as fes from 'fs-extra';
const DebugStatusPrefix = 'MYBRICKS_BUILD_ID_';

class DebugStatus {
  // statusMap: any = {};
  methods: any = {};
  // envId: any;

  // initStatus(terminal: any, id: string, methods: any) {
  //   this.methods = methods;
  //   const envId = `${DebugStatusPrefix}${id}`;
  //   this.envId = envId;
  //   const statusMap = this.statusMap;
  //   const timeId = setInterval(() => {
  //     const envMap = fes.readJSONSync(path.join(__dirname, './.temp/mybricks_env.json'));
  //     const status = envMap[envId].status;
  //     const lastStatus = statusMap[envId].status;

  //     switch (status) {
  //       case 'build':
  //         if (lastStatus !== status) {
  //           console.log('构建中');
  //           statusMap[envId].status = status;
  //           methods.build();
  //         }
  //         break;
  //       case 'done':
  //         if (lastStatus !== status) {
  //           console.log('构建好了');
  //           statusMap[envId].status = status;
  //           methods.done(envMap[envId].url);
  //         }
  //         break;
  //       case 'close':
  //         console.log('关闭');
  //         clearInterval(timeId);
  //         // this.statusMap[envId].terminal?.dispose?.();
  //         Reflect.deleteProperty(this.statusMap, envId);
  //         methods.close();
  //         break;
  //       default:
  //         break;
  //     }
  //   }, 1000);

  //   statusMap[envId] = {
  //     status: 'init',
  //     timeId,
  //     terminal
  //   };
  // }

  // close(id: any) {
  //   const envId = `${DebugStatusPrefix}${this.envId}`;
  //   // this.statusMap[envId].terminal?.dispose?.();
  //   this.methods.close();
  //   clearInterval(this.statusMap[envId].timeId);
  //   Reflect.deleteProperty(this.statusMap, envId);
  // }

  initStatus({methods}: any) {
    this.methods = methods;
  }

  close() {
    this.methods.close();
  }

}

export const debugStatus = new DebugStatus();
