const DefaultExceptionHandler = require('../errors/default-exception-handler')
const exceptionHandler = new DefaultExceptionHandler()

module.exports = (exceptionHandlers = []) => async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    for (const handler of exceptionHandlers) {
      const stop = await handler.handle(ctx, e, next)
      if (stop) return
    }
    await exceptionHandler.handle(ctx, e)
  }
}
