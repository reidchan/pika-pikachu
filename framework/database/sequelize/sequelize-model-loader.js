const glob = require('glob')
const Sequelize = require('sequelize')
const DataTypes = Sequelize.DataTypes
const CustomTypes = require('./custom-types')
const { Random } = require('mockjs')
const { isObject } = require('../../utils')
const _ = require('lodash')

const CREATE_MODEL = Symbol('Model#CREATE_MODEL')

const di = {
  STRIP_COMMENTS: /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
  ARGUMENT_NAMES: /([^\s,]+)/g,
  dependencies: {},
  register (obj) {
    for (const key in obj) {
      this.dependencies[key] = obj[key]
    }
  },
  unregister (...items) {
    items.forEach(item => Reflect.deleteProperty(this.dependencies, item))
  },
  getParamNames (func) {
    const fnStr = func.toString().replace(this.STRIP_COMMENTS, '')
    const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(this.ARGUMENT_NAMES)
    return result || []
  },
  resolve (func) {
    if (!(func instanceof Function)) return function () {}
    const self = this
    const args = []
    const paramNames = this.getParamNames(func)
    return function () {
      const a = Array.prototype.slice.call(arguments, 0)
      for (const paramName of paramNames) {
        args.push(self.dependencies[paramName] || a.shift())
      }
      return new.target ? Reflect.construct(func, args) : Reflect.apply(func, this, args)
    }
  }
}

/**
 * 修改 Model 方法
 */
class Model extends Sequelize.Model {
  /**
   * Mock 数据
   */
  static mock (...items) {
    return Promise.all(items.map(item => {
      const obj = (this.random ? this.random() : {}) || {}
      return this.create(Object.assign(obj, item))
    }))
  }

  /**
   * 创建一个 Model 表
   * @param {Object} Schema
   */
  static [CREATE_MODEL] (Schema) {
    const self = this
    Reflect.setPrototypeOf(Schema, this)
    Reflect.setPrototypeOf(Schema.prototype, this.prototype)
    const model = function () {
      return Reflect.construct(self, arguments, model)
    }
    Reflect.setPrototypeOf(model, Schema)
    Reflect.setPrototypeOf(model.prototype, Schema.prototype)
    Reflect.defineProperty(model, 'name', { value: Schema.name, writable: true })
    return model
  }
}

const handleFields = function (fields, options) {
  for (const key in fields) {
    const col = fields[key]
    if (isObject(col) && col.type && col.type.key === CustomTypes.OBJECT.key) {
      // object 的 defaultValue 不会保存到数据库中，只是用于替代空对象的处理
      const defaultValue = col.defaultValue
      delete col.defaultValue
      options = _.defaultsDeep(options || {}, {
        getterMethods: {
          [key]: function (_key, options) {
            try {
              return JSON.parse(this.dataValues[_key]) || defaultValue
            } catch (e) {
              return this.dataValues[_key]
            }
          }
        },
        setterMethods: {
          [key]: function (value, _key) {
            this.dataValues[_key] = JSON.stringify(value)
          }
        }
      })
    }
  }
  return options
}

module.exports = class ModelLoader {
  static async load (sequelize, rootPath) {
    const modelPath = rootPath
    const modelFiles = glob.sync(`${modelPath}/**/*.js`)
    // 依赖注入项
    di.register({ DataTypes, Random, CustomTypes })
    const models = await Promise.all(modelFiles.map(async file => {
      let Schema = Model[CREATE_MODEL](require(file))
      Schema.options = di.resolve(Schema.options)
      Schema.fields = di.resolve(Schema.fields)
      Schema.random = di.resolve(Schema.random)
      const fields = Schema.fields()
      const options = handleFields(fields, Schema.options())
      Schema = await Schema.init(fields, Object.assign(
        { sequelize: sequelize },
        options
      ))
      sequelize[Schema.name] = Schema
      // 所有 Model 名作为依赖注入项
      di.register({ [Schema.name]: Schema })
      return Schema
    }))
    if (!process.env.mock) {
      models.forEach(model => di.resolve(model.associate).call(model))
    }
  }
}
