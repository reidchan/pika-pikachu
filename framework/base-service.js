const Logger = require('./logger')

module.exports = class BaseService {
  constructor (app) {
    this.app = app
    this.logger = new Logger(this.constructor.name)
  }
}
