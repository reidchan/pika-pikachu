require('reflect-metadata')
const { iterate } = require('iterare')
const { isUndefined, validatePath, isNil, isConstructor, isFunction, createNullArray } = require('../utils')
const {
  PATH_METADATA,
  METHOD_METADATA,
  ROUTE_ARGS_METADATA,
  VALIDATE_METADATA,
  BEFORE_METADATA,
  AFTER_METADATA,
  MESSAGE_METADATA,
  IGNORE_JWT_METADATA,
  CONTROLLER_AFTER_ALL_METADATA,
  CONTROLLER_BEFORE_ALL_METADATA,
  CONTROLLER_IGNORE_JWT_ALL_METADATA
} = require('../constants')
const RouteParamsFactory = require('./route-params-factory')
const RouteMethodFactory = require('./route-method-factory')
const Logger = require('../logger')
const paramsRegex = /:[\w-]*/g

/**
 * 扫描 Controller 类，及其每个方法配置的装饰器
 * 并以此设置路由和中间件
 */
module.exports = class RouterResolver {
  constructor () {
    this.logger = new Logger(this.constructor.name)
  }

  pushJwtIgnore (controller, regexp) {
    controller.app.jwtunless.path.push(regexp)
  }

  validatePath (path) {
    if (!path) return ''
    if (path.length >= 1 && path[path.length - 1] === '/') path = path.slice(0, path.length - 1)
    return path
  }

  generateGlobalPathIgnore (controller) {
    let globalPrefix = controller.app.prefix || ''
    globalPrefix = this.validatePath(globalPrefix)
    const prefix = globalPrefix + controller._prefix
    return new RegExp(prefix.replace(/(\/)/g, '\\/'))
  }

  generatePathIgnore (controller, path) {
    const globalPrefix = this.validatePath(controller.app.prefix || '')
    let prefix = this.validatePath(globalPrefix + controller._prefix + path)
    const params = prefix.match(/:(\w+)/g)
    if (params && params.length > 0) {
      // :param 形式的字段忽略成任意字母可通过
      for (const param of params) {
        prefix = prefix.replace(param, '(\\w+)')
      }
    }
    // 替换 '/' 为 '\/' 以符合正则形式
    prefix = prefix.replace(/(\/)/g, '\\/')
    // 结尾可以有 '/' 也可以没有 '/'
    return new RegExp(`^${prefix}(\\/|)$`)
  }

  resolve (controller, Controller) {
    const afterAll = Controller ? Reflect.getMetadata(CONTROLLER_AFTER_ALL_METADATA, Controller) : null
    const beforeAll = Controller ? Reflect.getMetadata(CONTROLLER_BEFORE_ALL_METADATA, Controller) : null
    const ignoreJwtAll = Controller ? Reflect.getMetadata(CONTROLLER_IGNORE_JWT_ALL_METADATA, Controller) : false
    if (ignoreJwtAll) {
      this.pushJwtIgnore(controller, this.generateGlobalPathIgnore(controller))
    }

    const routers = this.scanForRouters(controller)
    if (!routers) return
    for (const route of routers) {
      const path = route.path
      const method = route.requestMethod
      const before = route.before
      const after = route.after
      const message = route.message
      const ignoreJwt = route.ignoreJwt

      let middlewares = [path]
      if (ignoreJwt) this.pushJwtIgnore(controller, this.generatePathIgnore(controller, path))
      if (beforeAll) middlewares = middlewares.concat(beforeAll)
      if (before) middlewares = middlewares.concat(before)

      const metadata = this.reflectCallbackMetadata(controller, route.targetCallback) || {}
      const keys = Object.keys(metadata)
      const argsLength = this.getArgumentsLength(keys, metadata)
      const paramsMetadata = this.exchangeKeysForValues(keys, metadata)

      const resolve = route.targetCallback.bind(controller)

      const resolver = async (ctx, next) => {
        let args = createNullArray(argsLength)
        await Promise.all(paramsMetadata.map(async (param) => {
          const { index, extractValue } = param
          // 获取参数元数据对应的数据
          const value = extractValue(ctx, next)
          // 将参数需要的数据放置到正确位置上
          args[index] = value
        }))
        if (args.length === 0) {
          args = [ctx, next, { body: ctx.request.body, query: ctx.query, params: ctx.params }]
        }
        // do what controller method wants
        const result = await resolve(...args)
        ctx.ok(result, message)
        if ((after && after.length > 0) ||
            (afterAll && afterAll.length > 0)) {
          await next()
        }
      }

      middlewares.push(resolver)
      if (after) middlewares = middlewares.concat(after)
      if (afterAll) middlewares = middlewares.concat(afterAll)
      // 如果最后一个 middleware 调用了 next，会导致接口被调用两次，所以这里放了一个空的作为最后，防止出现错误
      middlewares.push(async () => {})

      const router = controller.getRouter()
      const methodName = RouteMethodFactory.get(router, method)
      // this.logger.log(` setup router ${methodName} ${controller._prefix}${path}`)
      // 配置路由和中间件
      router[methodName](...middlewares)
    }
  }

  _replaceColon (path) {
    const matchs = paramsRegex.exec(path)
    if (!matchs) return path
    const pathItem = matchs[0].replace(':', '{') + '}'
    path = path.replace(matchs[0], pathItem)
    return this._replaceColon(path)
  }

  /**
   * 扫描类上的方法并返回其定义的元数据
   */
  scanForRouters (controller, prototype) {
    const controllerPrototype = isUndefined(prototype) ? Object.getPrototypeOf(controller) : prototype
    return this.scanFromPrototype(controller, controllerPrototype, (method) => this.exploreMethodMetadata(controller, controllerPrototype, method))
  }

  /**
   * 扫描方法元数据
   */
  scanFromPrototype (controller, prototype, callback) {
    return iterate(Object.getOwnPropertyNames(prototype)).filter((method) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, method)
      if (descriptor.set || descriptor.get) return false
      return !isConstructor(method) && isFunction(prototype[method])
    })
      .map(callback)
      .filter((metadata) => !isNil(metadata))
      .toArray()
  }

  /**
   * 获取方法元数据并返回
   */
  exploreMethodMetadata (controller, controllerPrototype, methodName) {
    const targetCallback = controllerPrototype[methodName]
    const routePath = Reflect.getMetadata(PATH_METADATA, targetCallback)
    if (isUndefined(routePath)) return null

    const requestMethod = Reflect.getMetadata(METHOD_METADATA, targetCallback)
    const validate = Reflect.getMetadata(VALIDATE_METADATA, targetCallback)
    const before = Reflect.getMetadata(BEFORE_METADATA, targetCallback)
    const after = Reflect.getMetadata(AFTER_METADATA, targetCallback)
    const message = Reflect.getMetadata(MESSAGE_METADATA, targetCallback)
    const ignoreJwt = Reflect.getMetadata(IGNORE_JWT_METADATA, targetCallback)

    return {
      requestMethod,
      path: this.validateRoutePath(routePath),
      validate,
      targetCallback,
      before,
      after,
      message,
      ignoreJwt
    }
  }

  /**
   * 获取方法中参数所带的元数据
   */
  reflectCallbackMetadata (instance, callback) {
    return Reflect.getMetadata(ROUTE_ARGS_METADATA, instance, callback.name)
  }

  getArgumentsLength (keys, metadata) {
    return Math.max(...keys.map(key => metadata[key].index)) + 1
  }

  /**
   * 将参数元数据转换成对应的数据
   */
  exchangeKeysForValues (keys, metadata) {
    return keys.map(key => {
      const type = this.mapParamType(key)
      const { index, data } = metadata[key]

      const extractValue = (ctx, next) => RouteParamsFactory.exchangeKeyForValue(type, data, { ctx, next })
      return { index, extractValue, type, data }
    })
  }

  mapParamType (key) {
    const keyPair = key.split(':')
    return Number(keyPair[0])
  }

  validateRoutePath (path) {
    if (isUndefined(path)) {
      this.logger.error('UnknownRequestMappingException')
    }
    return validatePath(path)
  }
}
