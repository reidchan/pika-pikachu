const KoaAdapter = require('./adapters/koa-adapter')
const createMiddlewares = require('./middlewares')
const koaJwt = require('koa-jwt')
const jwt = require('jsonwebtoken')
const bodyParser = require('koa-bodyparser')
const unless = require('koa-unless')
const _ = require('lodash')
const Logger = require('./logger')
const {isUndefined} = require('./utils')

module.exports = class Application {
  /**
   * @param {Koa} koa
   * @param {object} config
   * config: {
   *   prefix,
   *   jwt: {
   *     signOptions: {secret, expiresIn},
   *     verifyOptions: {secret},
   *     unless: {path: []}
   *   }
   * }
   */
  constructor (config = {}, koa) {
    this.config = config
    this.koa = koa || KoaAdapter.create()
    this.router = KoaAdapter.createRouter({
      prefix: config.prefix
    })
    this.prefix = config.prefix || '/'
    this.logger = new Logger('Application')

    this.exceptionHandlers = []

    this.init()
  }

  init () {
    const middlewares = createMiddlewares(this.exceptionHandlers)
    this.use(middlewares)
    this.jwtunless = this.config.jwt ? (this.config.jwt.unless || {path: []}) : {path: []}
    // setup jwt
    if (this.config && this.config.jwt) {
      if (!this.jwtunless.path) this.jwtunless.path = []
      this.use(koaJwt({secret: this.config.jwt.verifyOptions.secret}).unless(this.jwtunless))
      if (this.config.jwt.verifyOptions.validation) {
        this.config.jwt.verifyOptions.validation.unless = unless
        // 在使用 jwt 后使用 validation 中间件进行自定义校验
        this.use(this.config.jwt.verifyOptions.validation.unless(this.jwtunless))
      }
    }
    this.use(bodyParser())
    this.extendKoa()
  }

  addExceptionHandler (handler) {
    this.exceptionHandlers.push(handler)
  }

  jwtSign (user) {
    if (!this.config.jwt) {
      this.logger.warn('jwt does not setup, token will be empty')
      return ''
    }

    const signOptions = _.omit(this.config.jwt.signOptions, 'secret')
    return jwt.sign(_.assign(user, {
      tokenCreatedAt: new Date().getTime()
    }), this.config.jwt.signOptions.secret, signOptions)
  }

  extendKoa () {
    this.koa.context.jwtConfig = this.config.jwt
    this.koa.context.ok = function (data, message) {
      const existBody = isUndefined(this.body)
      if (existBody) this.body = {success: true}
      if (!isUndefined(message) && isUndefined(this.body.message)) this.body.message = message
      if (!isUndefined(data) && isUndefined(this.body.data)) this.body.data = data
    }
    this.koa.context.error = function (status, message, data) {
      this.status = status || 400
      this.body = {success: false, data, message}
    }
    this.koa.context.excel = function (data, filename) {
      const res = this.response
      this.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      res.attachment(`${filename || new Date().toString()}.xlsx`)
      this.body = data
    }
  }

  injectData (name, loader, injectCtx = false) {
    if (this[name]) {
      this.logger.warn(`${name} has been loaded`)
      return
    }
    this.logger.time(`${name} load success!`)
    const object = this[name] = loader.load()
    if (injectCtx) {
      this.koa.context[name] = object
    }
    this.logger.timeEnd(`${name} load success!`)
    return object
  }

  useRouterLoader (routersLoader) {
    if (this.routerInitilized) {
      this.logger.warn('router has been loaded')
      return
    }
    this.routersLoader = routersLoader
  }

  loadRouter () {
    if (this.routerInitilized) return
    this.logger.time('router load success!')
    // load routers
    this.routersLoader.load()
    this.use(this.router.middleware())
    this.routerInitilized = true
    this.logger.timeEnd('router load success!')
  }

  async connectDatabase (databaseProvider) {
    if (!this.db) this.db = {}
    let database
    if (databaseProvider.name) {
      database = this.db[databaseProvider.name] = await databaseProvider.connect()
    } else {
      database = this.db = await databaseProvider.connect()
    }
    return database
  }

  use (requestHandler) {
    return this.koa.use(requestHandler)
  }

  listen (port, ...args) {
    this.loadRouter()
    this.server = this.koa.listen(port, ...args)
    return this.server
  }

  listenAsync (port, hostname) {
    return new Promise((resolve) => {
      const server = this.listen(port, hostname, () => resolve(server))
    })
  }
}
