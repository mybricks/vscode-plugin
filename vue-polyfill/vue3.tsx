import {applyPureVueInReact} from './src/veaury';

// import { applyPureVueInReact } from './veaury'
import React, { useMemo } from "react";

// if (window.Vue && window.veaury && window.Vue.use === undefined) {
//   window.__VueUseComponents = window.__VueUseComponents || [];
//   window.Vue.use = function(com) {
//     if (window.__VueUseComponents.indexOf(com) === -1) {
//       window.__VueUseComponents.push(com);
//       window.veaury.setVeauryOptions({
//         beforeVueAppMount: function(app) {
//           for (var i = 0; i < window.__VueUseComponents.length; i++) {
//             app.use(window.__VueUseComponents[i]);
//           }
//         }
//       });
//     }
//   };
// }

const SlotRender = ({ slots, name, params = {} }) => {
  return (
    <>
      {slots[name]?.render?.(params)}
    </>
  );
};

// const useHasStringObj = (obj) => {

//   const proxyObj = useMemo(() => {
//     return new Proxy({}, {
//       get(target, key) {
//         if (key === 'toString') {
//           return () => '_';
//         }
//         return obj[key];
//       }
//     });
//   }, [obj]);

//   return proxyObj;
// };

/**
 * 
 * @description 目前引擎IO的代理不完整，当Vue使用setAttribute的时候会发生隐式调用，调用Symbol.toPrimitive 方法，必须包含
 * @returns 
 */
const useValidProxy = (obj) => {
  return useMemo(() => {
    // if (!obj[Symbol.toPrimitive]) {
    //   obj[Symbol.toPrimitive] = function() {return '{}';};
    // }
    // if (obj.toString) {
    //   obj.toString = function() {return '{}';};
    // }
    return new Proxy({}, {
      has(target, key) {
        return key in obj;
      },
      ownKeys(target) {
        return Reflect.ownKeys(obj);
      },
      get(target, key) {
        if (key === Symbol.toPrimitive) {
          return  function() {return '{}';};
        }
        return obj[key];
      },
    });
  }, [obj]);
};

function VUEHoc(com) {
  const Basic = applyPureVueInReact(com, {
    
  });
  return function ({ data, outputs, inputs, slots, style, env, _env, logger, title, id }) {
    const vSlots = {};
    const _slots = {}; // slots不能直接丢进去，否则会触发bug
    for (const key in slots) {
      if (Object.prototype.hasOwnProperty.call(slots, key)) {
        vSlots[key] = (params) => {
          return <SlotRender slots={slots} name={key} params={params} />;
        };
        _slots[key] = slots[key];
        
        // 手动调用getter，触发设计器的size响应式
        _slots[key].size;
      }
    }

    const inputsProxy = useValidProxy(inputs);
    const outputsProxy = useValidProxy(outputs);
    const envProxy = useValidProxy(env);

    const props = {
      id,
      title,
      env: envProxy,
      _env,
      logger,
      data: JSON.parse(JSON.stringify(data)), // 深拷贝成js对象，同时触发所有getter用于
      outputs: outputsProxy,
      inputs: inputsProxy,
      slots: _slots,
    };

    return (
      <Basic
        // m={{ style, ...props }}
        {...props}
        v-slots={vSlots}
      />
    );
  };
}

(window as any).VUEHoc = VUEHoc;