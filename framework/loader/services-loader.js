const ClassLoader = require('./class-loader')

/**
 * Service加载器，Service文件的后缀必须为 '.service.js'
 */
module.exports = class ServicesLoader extends ClassLoader {
  /**
   * @param {Application} app
   * @param {string} rootPath 根目录
   * @param {string} namedBy 'dir' or 'file'
   */
  constructor (app, rootPath, namedBy = 'file') {
    super(rootPath, '.s.js', namedBy)
    this.app = app
  }

  createClassObject (Service) {
    return new Service(this.app)
  }
}
