/**
 * es7草案不支持 ParamDecorator,不过typescript自己实现了
 * 所以该套方案只能在typescript中使用
 */
require('reflect-metadata')
const RouteParamtypes = require('../enums/route-paramtypes')
const {ROUTE_ARGS_METADATA} = require('../constants')
const {isNil, isString} = require('../utils')

const assignMetadata = (
  args,
  paramtype,
  index,
  data
) => {
  const result = {
    [`${paramtype}:${index}`]: {
      index,
      data
    }
  }
  for (const key in args) {
    result[key] = args[key]
  }
  return result
}

/**
 * @param {RouteParamtypes} paramtype RouteParamtypes
 */
const createRouteParamDecorator = (paramtype) => {
  return (data) => (target, key, index) => {
    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, target, key) || {}
    const hasParamData = isNil(data) || isString(data)
    const paramData = hasParamData ? data : undefined
    const reflectData = assignMetadata(args, paramtype, index, paramData)
    Reflect.defineMetadata(
      ROUTE_ARGS_METADATA,
      reflectData,
      target,
      key
    )
  }
}

const Query = property => createRouteParamDecorator(RouteParamtypes.QUERY)(property)
const Context = property => createRouteParamDecorator(RouteParamtypes.CONTEXT)(property)
const Body = property => createRouteParamDecorator(RouteParamtypes.BODY)(property)
const Next = property => createRouteParamDecorator(RouteParamtypes.NEXT)(property)
const Param = property => createRouteParamDecorator(RouteParamtypes.PARAM)(property)
const User = property => createRouteParamDecorator(RouteParamtypes.USER)(property)

module.exports = {
  Query,
  Context,
  Body,
  Next,
  Param,
  User
}
