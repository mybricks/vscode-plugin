// [Mybricks Hack]
/**
 * 重写了一个专门for 作用域插槽的方法，原来的方法不会更新最新参数，导致schema slot不起作用，还会有各种神奇的bug
 */

import React, { version } from "react"
import { createPortal } from "react-dom"

// class Wrapper extends React.Component {
//   state = {}

//   componentWillUnmount() {
//     console.warn('componentWillUnmount')
//   }

//   render = () => {
//     const { children } = this.props;
//     return <>
//       {children}
//     </>
//   }
// }


// const ReactMajorVersion = parseInt(version)

export const applyReactScopeSlotInVue = (VueCreateElement, ReactComponentFunc, options) => {

  return VueCreateElement({
    render(createElement) {
      const { style, ...attrs } = options.react.componentWrapAttrs;
      return createElement(options.react.componentWrap, { ref: "react", attrs, style })
    },
    methods: {
      findReactWrapperRef() {
        let reactWrapperRef = options.wrapInstance

        if (!reactWrapperRef) {
          let parentInstance = this.$parent
          // 向上查找react包囊层
          while (parentInstance) {
            if (parentInstance.parentReactWrapperRef) {
              reactWrapperRef = parentInstance.parentReactWrapperRef
              break
            }
            if (parentInstance.reactWrapperRef) {
              reactWrapperRef = parentInstance.reactWrapperRef
              break
            }
            parentInstance = parentInstance.$parent
          }
        } else {
          reactWrapperRef = options.wrapInstance
          reactWrapperRef.vueWrapperRef = this
        }

        return reactWrapperRef;
      },
      mountReactComponent() {
        const container = this.$refs.react;

        const reactRootComponent = <ReactComponentFunc />;

        const reactWrapperRef = this.findReactWrapperRef();
        
        // 如果存在Wrapper层，则激活portal
        if (reactWrapperRef) {
          // 存储Wrapper层引用
          this.parentReactWrapperRef = reactWrapperRef
          // 存储portal引用
          this.reactPortal = () => {
            return createPortal(
            reactRootComponent,
            container,
          )}
          reactWrapperRef.pushReactPortal(this.reactPortal)
          return
        }
      }
    },
    beforeDestroy() {
      // 删除portal
      if (this.reactPortal) {
        this.parentReactWrapperRef && this.parentReactWrapperRef.removeReactPortal(this.reactPortal)
        return
      }
      
    },
    mounted() {
      this.mountReactComponent();
    },
    updated() {
    },
  });
}