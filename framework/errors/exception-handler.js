const Logger = require('../logger')

module.exports = class ExceptionHandler {
  constructor () {
    this.logger = new Logger(this.constructor.name)
  }

  async handle (ctx, e, next) {}
}
