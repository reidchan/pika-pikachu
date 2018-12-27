const ExceptionHandler = require('./exception-handler')

module.exports = class extends ExceptionHandler {
  async handle (ctx, e, next) {
    if (!e.status) this.logger._error(e, {autoTag: true, showLine: true, deep: 0, stack: e.stack})
    else this.logger._error(e.message, {autoTag: true, showLine: true, deep: 0, stack: e.stack})
    ctx.error(e.status || 500, e.message, e.data)
  }
}
