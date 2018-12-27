const Koa = require('koa')
const Router = require('koa-router')
const JoiRouter = require('koa-joi-router')
module.exports = class KoaAdapter {
  static create () {
    return new Koa()
  }

  static createRouter (config = {}) {
    return new Router(config)
  }

  static createJoiRouter (config = {}) {
    return new JoiRouter(config)
  }
}
