import {applyPureVueInReact} from 'veaury';

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

const useHasStringObj = (obj) => {

  const proxyObj = useMemo(() => {
    return new Proxy({}, {
      get(target, key) {
        if (key === 'toString') {
          return () => '_';
        }
        return obj[key];
      }
    });
  }, [obj]);

  return proxyObj;
};

function VUEHoc(com) {
  const Basic = applyPureVueInReact(com);
  return function ({ data, outputs, inputs, slots, style, env, logger }) {
    const vSlots = {};
    const _slots = {}; // slots不能直接丢进去，否则会触发bug
    for (const key in slots) {
      if (Object.prototype.hasOwnProperty.call(slots, key)) {
        vSlots[key] = (params) => <SlotRender slots={slots} name={key} params={params} />;
        _slots[key] = slots[key];
      }
    }

    const inputsProxy = useHasStringObj(inputs);
    const outputsProxy = useHasStringObj(outputs);

    return (
      <Basic
        // style={style}
        config={{ style }}
        env={env}
        logger={logger}
        data={{ ...data }}
        outputs={outputsProxy}
        inputs={inputsProxy}
        slots={_slots}
        v-slots={vSlots}
      />
    );
  };
}

(window as any).VUEHoc = VUEHoc;