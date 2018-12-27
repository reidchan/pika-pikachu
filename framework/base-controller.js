const RouterResolver = require('./router/router-resolver')
const KoaAdapter = require('./adapters/koa-adapter')
const Logger = require('./logger')

module.exports = class BaseController {
  constructor (app, _prefix) {
    this.app = app
    this._prefix = _prefix
    this.routerResolver = new RouterResolver()
    this.router = KoaAdapter.createJoiRouter()
    this.logger = new Logger(this.constructor.name)
    this.jwtUnless = []
    this.swaggerInfo = null

    this.setupRouters()
  }

  setupRouters () {
    this.routerResolver.resolve(this, this.constructor)
  }

  getRouter () {
    return this.router
  }

  setSwaggerInfo (swaggerInfo) {
    this.swaggerInfo = swaggerInfo
  }
}
