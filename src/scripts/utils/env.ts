import * as path from 'path';
import * as fes from 'fs-extra';
const DebugStatusPrefix = 'MYBRICKS_BUILD_ID_';

class DebugStatus {
  statusMap: any = {};

  initStatus(terminal: any, methods: any) {
    const envId = `${DebugStatusPrefix}${terminal.name}`;
    const statusMap = this.statusMap;
    const timeId = setInterval(() => {
      const envMap = fes.readJSONSync(path.join(__dirname, './.temp/mybricks_env.json'));
      const status = envMap[envId].status;
      const lastStatus = statusMap[envId].status;

      switch (status) {
        case 'build':
          if (lastStatus !== status) {
            console.log('构建中');
            statusMap[envId].status = status;
            methods.build();
          }
          break;
        case 'done':
          if (lastStatus !== status) {
            console.log('构建好了');
            statusMap[envId].status = status;
            methods.done(envMap[envId].url);
          }
          break;
        case 'close':
          console.log('关闭');
          clearInterval(timeId);
          this.statusMap[envId].terminal?.dispose?.();
          Reflect.deleteProperty(this.statusMap, envId);
          methods.close();
          break;
        default:
          break;
      }
    }, 1000);

    statusMap[envId] = {
      status: 'init',
      timeId,
      terminal
    };
  }

  close(id: any) {
    const envId = `${DebugStatusPrefix}${id}`;
    this.statusMap[envId].terminal?.dispose?.();
    clearInterval(this.statusMap[envId].timeId);
    Reflect.deleteProperty(this.statusMap, envId);
  }
}

export const debugStatus = new DebugStatus();
