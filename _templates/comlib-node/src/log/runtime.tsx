import { TContext } from "types"

export default function (data, inputs, outputs, context: TContext) {
  inputs.print(info => {
    context.logger.log(`日志组件打印：`)
    context.logger.log(info)
    outputs.then(true)
  })
}
