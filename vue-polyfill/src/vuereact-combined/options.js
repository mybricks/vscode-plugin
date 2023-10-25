import React, { useEffect } from "react";

const originOptions = {
  react: {
    // componentWrap: 'div',
    // slotWrap: 'div',
    // componentWrapAttrs: {
    //   __use_react_component_wrap: '',
    //   style: {
    //     all: 'unset'
    //   }
    // },
    // slotWrapAttrs: {
    //   __use_react_slot_wrap: '',
    //   style: {
    //     all: 'unset'
    //   }
    // }
  },
  // [Mybricks Hack]
  react: {
    componentWrap: 'div',
    slotWrap: 'div',
    componentWrapAttrs: {
      __use_react_component_wrap: '',
      style: {
        all: 'unset'
      }
    },
    slotWrapAttrs: {
      __use_react_slot_wrap: '',
      style: {
        all: 'unset'
      }
    }
  },
  // vue: {
  //   // 组件wrapper
  //   componentWrapHOC: (VueComponentMountAt, nativeProps = []) => {
  //     // 传入portals
  //     return function ({ portals = [] } = {}) {
  //       return (<div {...nativeProps}>{VueComponentMountAt}{portals.map(({ Portal, key }) => <Portal key={key}/>)}</div>)
  //     }
  //   },
  //   componentWrapAttrs: {
  //     'data-use-vue-component-wrap': '',
  //     style: {
  //       // all: 'unset',
  //       width: 'inherit',
  //       // width: 375,
  //       height: 'inherit',
  //     }
  //   },
  //   slotWrapAttrs: {
  //     'data-use-vue-slot-wrap': '',
  //     style: {
  //       all: 'unset'
  //     }
  //   }
  // },

  // [Mybricks Hack]
  vue: {
    componentWrapHOC: (VueComponentMountAt, nativeProps = []) => {
      // 传入portals
      return function ({ portals = [] } = {}) {
        // return (<>{VueComponentMountAt}{portals.map(({ Portal, key }) => <Portal key={key}/>)}</>);
        return (<div {...nativeProps}>{VueComponentMountAt}{portals.map(({ Portal, key }) => <Portal key={key}/>)}</div>);
      };
    },
    componentWrapAttrs: {
      'data-use-vue-component-wrap': '',
      style: {
        // all: 'inherit',
        width: '100%',
        height: '100%',
      }
    },
    slotWrapAttrs: {
      'data-use-vue-slot-wrap': '',
      style: {
        all: 'unset'
      }
    }
  }
}

export function setOptions (newOptions = {
  react: {},
  vue: {}
}, options = originOptions, clone) {
  if (!newOptions.vue) {
    newOptions.vue = {}
  }
  if (!newOptions.react) {
    newOptions.react = {}
  }
  const params = [options, {
    ...newOptions,
    react: {
      ...options.react,
      ...newOptions.react,
      componentWrapAttrs: {
        ...options.react.componentWrapAttrs,
        ...newOptions.react.componentWrapAttrs
      },
      slotWrapAttrs: {
        ...options.react.slotWrapAttrs,
        ...newOptions.react.slotWrapAttrs
      }
    },
    vue: {
      ...options.vue,
      ...newOptions.vue,
      componentWrapAttrs: {
        ...options.vue.componentWrapAttrs,
        ...newOptions.vue.componentWrapAttrs
      },
      slotWrapAttrs: {
        ...options.vue.slotWrapAttrs,
        ...newOptions.vue.slotWrapAttrs
      }
    }
  }]
  if (clone) {
    params.unshift({})
  }

  return Object.assign.apply(this, params)
}

export default originOptions
