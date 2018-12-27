const Loader = require('./loader')
const BaseController = require('../base-controller')
const glob = require('glob')
const path = require('path')

/**
 * 路由加载器，Controller 文件的后缀必须为 '.controller.js'
 */
module.exports = class RoutersLoader extends Loader {
  /**
   * @param {Application} app
   * @param {string} rootPath 根目录
   * @param {string} namedBy 'dir' or 'file'
   */
  constructor (app, rootPath, namedBy = 'file') {
    super()
    this.router = app.router
    this.app = app
    if (rootPath) {
      rootPath = path.join(__dirname, '../../../../', rootPath)
    }
    // 统一路径格式为 / 分隔符
    this.rootPath = rootPath ? path.normalize(rootPath).split(path.sep).join('/') : undefined

    this.namedBy = namedBy
  }

  load () {
    if (this.rootPath && this.router) {
      this.setupRouters(this.router)
      this.app.koa.use(this.router.middleware())
    } else {
      this.logger.warn(`没有配置路由根目录，路由将不会生效`)
    }
  }

  setupRouters (router) {
    const routerFiles = glob.sync(this.rootPath + '/**/*.c.js')
    routerFiles.forEach(filepath => {
      const Controller = require(filepath)
      if (typeof Controller !== 'function' || !(Controller.prototype instanceof BaseController)) {
        this.logger.warn(`注意! 文件 (${filepath.replace(this.rootPath, '')}) 不是期望的 BaseController 类型`)
        return
      }

      let _prefix
      if (this.namedBy === 'file') {
        _prefix = filepath.replace(this.rootPath, '').replace(/.c.js/, '').replace(/\/index/, '')
      } else {
        _prefix = filepath.replace(this.rootPath, '').replace(/\/(\w+).c.js/, '')
      }

      const controller = new (Controller)(this.app, _prefix)

      this.router.use(_prefix, controller.getRouter().middleware())
    })
  }
}
