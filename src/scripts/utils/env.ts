const fs = require('fs');
const path = require('path');
const DebugStatusPrefix = 'MYBRICKS_BUILD_ID_';

class DebugStatus {
  statusMap: any = {};

  initStatus(id, methods) {
    const envId = `${DebugStatusPrefix}${id}`;
    const timeId = setInterval(() => {
      const f = fs.existsSync(path.join(__dirname, `${envId}.txt`));

      if (f) {
        console.log('构建完成')
        methods.done();
      } else {
        methods.close();
        clearInterval(timeId);
        this.statusMap[id] = null;
        console.log('关闭')
      }

      console.log(process.env[envId], 'process.env[envId]', envId)

      switch (process.env[envId]) {
        case 'build':
          console.log('构建中')
          methods.build();
          break;
        case 'done':
          console.log('构建完成')
          methods.done();
          break;
        case 'close':
          methods.close();
          clearInterval(timeId);
          this.statusMap[id] = null;
          console.log('关闭')
          break;
        default:
          break;
      }
    }, 1000);

    this.statusMap[id] = {
      status: 'build',
      timeId
    };
  }
}

export const debugStatus = new DebugStatus();
