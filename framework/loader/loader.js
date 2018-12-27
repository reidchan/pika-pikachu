const Logger = require('../logger')

module.exports = class Loader {
  constructor () {
    this.logger = new Logger(this.constructor.name)
  }

  load () {}
}
