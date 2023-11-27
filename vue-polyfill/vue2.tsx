import { applyVueInReact } from './src/vuereact-combined';
import React, { useEffect, useMemo, useRef, useState } from "react";


const SlotRender = ({ slots, name, params = {} }) => {
  const props = params?.m ? { ...(params ?? {}), ...(params?.m ?? {}) } : params;
  return (
    <>
      {slots[name]?.render?.(props)}
    </>
  );
};


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

    const inputsProxy = useValidProxy(inputs);
    const outputsProxy = useValidProxy(outputs);
    const envProxy = useValidProxy(env);

    const props = {
      id,
      title,
      env: envProxy,
      _env,
      logger,
      data: data,
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


/** vue添加eventBus */
if (window?.Vue) {
  window.Vue.prototype.$eventBus = new window.Vue();
}