import * as path from 'path';
import * as fes from 'fs-extra';
const DebugStatusPrefix = 'MYBRICKS_BUILD_ID_';

class DebugStatus {
  statusMap: any = {};

  initStatus(id, methods) {
    const envId = `${DebugStatusPrefix}${id}`;
    const timeId = setInterval(() => {
      const envMap = fes.readJSONSync(path.join(__dirname, './.temp/mybricks_env.json'));
      const status = envMap[envId].status;
      const lastStatus = this.statusMap[envId].status;

      console.log({
        status,
        lastStatus
      })

      switch (status) {
        case 'build':
          console.log('构建中');
          break;
        case 'done':
          if (lastStatus !== status) {
            console.log('构建好了');
            methods.done();
          }
          break;
        case 'close':
          console.log('关闭');
          clearInterval(timeId);
          Reflect.deleteProperty(this.statusMap, envId);
          methods.close();
          break;
        default:
          break;
      }

      this.statusMap[envId].status = status;
    }, 1000);

    this.statusMap[envId] = {
      status: 'build',
      timeId
    };
  }
}

export const debugStatus = new DebugStatus();
