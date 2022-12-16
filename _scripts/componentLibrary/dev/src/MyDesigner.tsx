import React, {
  useRef,
  useState,
  useCallback,
  useLayoutEffect
} from 'react';
import { message } from "antd";
// @ts-ignore
import Designer from '@mybricks/designer';

import css from "./MyDesigner.less";

const localDataKey = '--mybricks--';

export default function MyDesigner () {
  const designerRef = useRef<{ dump: () => any }>();
  const [projectJson, setProjectJson] = useState();

  useLayoutEffect(() => {
    const pageContent = window.localStorage.getItem(localDataKey);
    setProjectJson(JSON.parse(pageContent || '{}'));
  }, []);

  const save = useCallback(() => {
    const json = designerRef.current?.dump();

    window.localStorage.setItem(localDataKey, JSON.stringify(json));
    message.info(`保存完成`);
  }, []);

  const clear = useCallback(() => {
    window.localStorage.removeItem(localDataKey);
    window.location.reload();
  }, []);

  const getConfig = useCallback(({projectJson}: any) => {
    return {
      comLibLoader() {
        return new Promise((resolve, reject) => {
          // scriptRequire(['./libEdt.js'], err => {
          //   reject(err)
          // }).then((styles) => {
          //   window['__comlibs_edit_'][0]._styleAry = styles;
          //   resolve(window['__comlibs_edit_'])
          // });
          resolve(['./libEdt.js']);
        });
      },
      editView: {},
      pageContentLoader() {//加载页面内容
        return new Promise((resolve) => {
          if (projectJson) {
            resolve(projectJson);
          } else {
            resolve(null);
          }
        });
      },
      com: {//组件运行配置
        env: {
          i18n(title: any) {//多语言
            return title;
          },
        },
      },
    };
  }, []);

  return (
    <>
      <div className={css.show}>
        <div className={css.toolbar}>
          <div className={css.tt}>&lt;定制您自己的无代码设计解决方案&gt;</div>
          <div className={css.btns}>
            {/*<button onClick={switchSlider}>激活连接器插件</button>*/}
          </div>
          <button className={css.primary} onClick={save}>保存</button>
          <button onClick={clear}>清空本地数据</button>
        </div>
        <div className={css.designer}>
          {
            projectJson && <Designer config={getConfig({ projectJson })} ref={designerRef}/>
          }
        </div>
      </div>
    </>
  );
}

// function scriptRequire(arr, onError) {
//   return new Promise((resolve, reject) => {
//     if (!(arr instanceof Array)) {
//       console.error("arr is not a Array");
//       return false;
//     }
  
//     var REQ_TOTAL = 0,
//       EXP_ARR = [],
//       REQLEN = arr.length;

//     const styles: any = [];
    
//     const _headAppendChild = document.head.appendChild;

//     document.head.appendChild = (ele) => {
//       if (ele && ele.tagName?.toLowerCase() === 'style') {
//         styles.push(ele);
//       };
//       _headAppendChild.call(document.head, ele);
//       return ele;
//     };
  
//     arr.forEach(function (req_item, index, arr) {
//       const script = createScript(req_item, index);
//       document.body.appendChild(script);
//       // getScriptStyle(req_item);
  
//       (function (script) {
//         script.onerror = (err) => {
//           REQ_TOTAL++;
//           onError(err);
//           if (REQ_TOTAL == REQLEN) {
//             document.head.appendChild = _headAppendChild;
//           }
//         };
//         script.onload = function () {
//           REQ_TOTAL++;
//           const script_index = script.getAttribute('index');
//           EXP_ARR[script_index] = this;
  
//           if (REQ_TOTAL == REQLEN) {
//             // resolve(EXP_ARR)
//             resolve(styles);
//             // callback && callback.apply(this, EXP_ARR);
//             document.head.appendChild = _headAppendChild;
//           }
//         };
//       })(script);
//     });
//   });
// }

// function createScript(src, index) {
//   var script = document.createElement('script');
//   script.setAttribute('src', src);
//   script.setAttribute('index', index);
//   return script;
// }
