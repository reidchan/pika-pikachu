const Logger = require('../logger')

module.exports = class DatabaseProvider {
  constructor (name = 'default') {
    this.logger = new Logger(this.constructor.name)
    this.name = name
  }
  connect () {}
}
