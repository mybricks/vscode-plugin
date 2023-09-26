import { applyVueInReact } from './src/vuereact-combined';

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
  const props = params?.m ? { ...(params ?? {}), ...(params?.m ?? {}) } : params;
  return (
    <>
      {slots[name]?.render?.(props)}
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
//         if (target.hasOwnProperty(key)) {
//           return obj[key];
//         }
//         return obj[key];
//       }
//     });
//   }, [obj]);

//   return proxyObj;
// };

const useRawObject = (obj) => {
  return useMemo(() => {
    const rawObject = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        rawObject[key] = obj[key];
      }
    }
    return rawObject;
  }, [obj]);
};

function VUEHoc(com) {
  const Basic = applyVueInReact(com);
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

    const inputsProxy = useRawObject(inputs);
    const outputsProxy = useRawObject(outputs);

    const props = {
      id,
      title,
      env,
      _env,
      logger,
      data: { ...data },
      outputs: outputsProxy,
      inputs: inputsProxy,
      slots: _slots,
    };

    return (
      <Basic
        m={{ style, ...props }}
        {...props}
        $scopedSlots={vSlots}
      />
    );
  };
}

(window as any).VUEHoc = VUEHoc;