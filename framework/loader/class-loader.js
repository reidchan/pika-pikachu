const Loader = require('./loader')
const glob = require('glob')
const {camelize} = require('../utils')
const path = require('path')
const _ = require('lodash')
/**
 * 类加载器，文件的后缀必须为构造时传入的 suffix
 */
module.exports = class ClassLoader extends Loader {
  /**
   * @param {string} rootPath 根目录
   * @param {string} suffix 要识别的文件后缀，如'.service.js'
   * @param {string} namedBy 'dir' or 'file'
   */
  constructor (rootPath, suffix = '.js', namedBy = 'file') {
    super()
    // 统一路径格式为 / 分隔符
    if (rootPath) {
      rootPath = path.join(__dirname, '../../../../', rootPath)
    }
    this.rootPath = rootPath ? path.normalize(rootPath).split(path.sep).join('/') : undefined
    this.namedBy = namedBy
    this.suffix = suffix
  }

  createClassObject (Clazz) {
    // 可以自己实现 createClassObject 方法以生成需要注入的对象
    // 默认直接调用 new 方法
    return new Clazz()
  }

  load () {
    if (this.data) return this.data

    this.data = {}
    if (this.rootPath) {
      this.data = this.setupService(this.rootPath)
    } else {
      this.logger.warn(`没有配置 ${this.suffix} 根目录，数据将不会生效`)
    }
    return this.data
  }

  setupService (rootPath) {
    const object = {}
    const serviceFiles = glob.sync(this.rootPath + `/**/*${this.suffix}`)
    serviceFiles.forEach((filepath) => {
      const Clazz = require(filepath)
      const relativePath = filepath.replace(this.rootPath + '/', '')

      if (typeof Clazz !== 'function') {
        this.logger.warn(`注意! 文件 (${relativePath}) 可能不是期望的类型`)
        return
      }

      const clazz = this.createClassObject(Clazz)

      if (this.namedBy === 'file') {
        this.namedByFileName(relativePath, object, clazz)
      } else if (this.namedBy === 'dir') {
        const dirPath = this.getDirPath(filepath)
        if (this.dirHasSingleSerivceFile(dirPath, serviceFiles)) {
          this.namedByDir(relativePath, object, clazz)
        } else {
          this.namedByFileName(relativePath, object, clazz)
        }
      }
    })
    return object
  }

  dirHasSingleSerivceFile (dirPath, serviceFiles) {
    let count = 0
    for (const file of serviceFiles) {
      // if (this.getDirPath(file) === dirPath) count++
      if (file.indexOf(dirPath) >= 0) count++
      if (count >= 2) return false
    }
    return true
  }

  getDirPath (filePath) {
    return filePath.replace(/\/[\w|.]+.js/, '')
  }

  namedByDir (relativePath, object, value) {
    const objNames = relativePath.replace(new RegExp(`\\/(\\w+)${this.suffix}`), '').split('/')
    return this.createObject(object, objNames, value)
  }

  namedByFileName (relativePath, object, value) {
    const objNames = relativePath.replace(`${this.suffix}`, '').split('/')
    return this.createObject(object, objNames, value)
  }

  createObject (object, names, value) {
    if (!names || names.length === 0) return value
    names = names.map(name => camelize(name))
    _.set(object, names, value)
    return object
  }
}
