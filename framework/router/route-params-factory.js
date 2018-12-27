const RouteParamtypes = require('../enums/route-paramtypes')
module.exports = class RouteParamsFactory {
  static exchangeKeyForValue (key, data, { ctx, next }) {
    switch (key) {
      case RouteParamtypes.NEXT: return next
      case RouteParamtypes.BODY: return data && ctx.request.body ? ctx.request.body[data] : ctx.request.body
      case RouteParamtypes.PARAM: return data ? ctx.params[data] : ctx.params
      case RouteParamtypes.QUERY: return data ? ctx.query[data] : ctx.query
      case RouteParamtypes.CONTEXT: return data ? ctx[data] : ctx
      case RouteParamtypes.USER: return data ? ctx.state.user[data] : ctx.state.user
      // case RouteParamtypes.HEADERS: return data ? ctx.headers[data] : ctx.headers;
      // case RouteParamtypes.SESSION: return req.session;
      default: return null
    }
  }
}
