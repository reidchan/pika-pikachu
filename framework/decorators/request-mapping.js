require('reflect-metadata')
const {
  PATH_METADATA,
  METHOD_METADATA,
  VALIDATE_METADATA,
  AFTER_METADATA,
  BEFORE_METADATA,
  MESSAGE_METADATA,
  IGNORE_JWT_METADATA } = require('../constants')
const RequestMethod = require('../enums/request-method')
const defaultMetada = {
  [PATH_METADATA]: '/',
  [METHOD_METADATA]: RequestMethod.GET
}

const RequestMapping = (metadata = defaultMetada) => {
  const path = metadata[PATH_METADATA] || '/'
  const requestMethod = metadata[METHOD_METADATA] || RequestMethod.GET

  return (target, key, descriptor) => {
    Reflect.defineMetadata(PATH_METADATA, path, descriptor.value)
    Reflect.defineMetadata(METHOD_METADATA, requestMethod, descriptor.value)
    return descriptor
  }
}

/**
 * 创建路由注解的定义-请求方法和请求路由
 * @param {RequestMethod} method RequestMethod
 */
const createMappingDecorator = (method) => {
  return (path) => {
    return RequestMapping({
      [PATH_METADATA]: path,
      [METHOD_METADATA]: method
    })
  }
}

const createArrayDecorator = (metadata) => {
  return (value) => {
    return (target, key, descriptor) => {
      const _value = Reflect.getMetadata(metadata, descriptor.value) || []
      value = (value instanceof Array) ? value : [value]
      value = value.concat(_value)
      Reflect.defineMetadata(metadata, value, descriptor.value)
      return descriptor
    }
  }
}

const createSingleDecorator = (metadata) => {
  return (value) => {
    return (target, key, descriptor) => {
      Reflect.defineMetadata(metadata, value, descriptor.value)
      return descriptor
    }
  }
}

/**
 * @param {string} metadata
 * @param {string} context body, query or param or empty
 */
const createValidateDecorator = (metadata, context) => {
  return (value, type) => {
    return (target, key, descriptor) => {
      let validate = Reflect.getMetadata(metadata, descriptor.value) || {}
      if (type) validate.type = type

      switch (context) {
        case 'body':
          // value 代表 body,如果没传 type 则需要一个默认值 json
          validate.type = type || 'json'
          validate.body = value
          break
        case 'query':
          // value 代表 query
          validate.query = value
          break
        case 'params':
          // value 代表 params
          validate.params = value
          break
        default:
          validate = Object.assign(validate, value)
          break
      }
      Reflect.defineMetadata(metadata, validate, descriptor.value)
      return descriptor
    }
  }
}

// 创建 @Method(path) 路由映射方法装饰器
const ALL = createMappingDecorator(RequestMethod.ALL)
const Get = createMappingDecorator(RequestMethod.GET)
const Post = createMappingDecorator(RequestMethod.POST)
const Delete = createMappingDecorator(RequestMethod.DELETE)
const Head = createMappingDecorator(RequestMethod.HEAD)
const Options = createMappingDecorator(RequestMethod.OPTIONS)
const Patch = createMappingDecorator(RequestMethod.PATCH)
const Put = createMappingDecorator(RequestMethod.PUT)

// 创建 @Name(middleware) 中间件方法装饰器
const Before = createArrayDecorator(BEFORE_METADATA)
const After = createArrayDecorator(AFTER_METADATA)

// 创建其他方法装饰器
const Validate = createValidateDecorator(VALIDATE_METADATA)
Validate.Body = createValidateDecorator(VALIDATE_METADATA, 'body')
Validate.Query = createValidateDecorator(VALIDATE_METADATA, 'query')
Validate.Params = createValidateDecorator(VALIDATE_METADATA, 'params')

const Message = createSingleDecorator(MESSAGE_METADATA)

const IgnoreJwt = createSingleDecorator(IGNORE_JWT_METADATA)(true)

module.exports = {
  RequestMapping,
  // 路由
  ALL,
  Get,
  Post,
  Delete,
  Head,
  Options,
  Patch,
  Put,
  // 中间件
  Validate,
  Before,
  After,
  // Others
  Message,
  IgnoreJwt
}
