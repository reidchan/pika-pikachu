const RequestMethod = require('../enums/request-method')
module.exports = class RouteMethodFactory {
  static get (router, requestMethod) {
    switch (requestMethod) {
      case RequestMethod.ALL: return 'all'
      case RequestMethod.DELETE: return 'delete'
      case RequestMethod.GET: return 'get'
      case RequestMethod.HEAD: return 'head'
      case RequestMethod.OPTIONS: return 'options'
      case RequestMethod.PATCH: return 'patch'
      case RequestMethod.POST: return 'post'
      case RequestMethod.PUT: return 'put'
      default: return requestMethod
    }
  }

  static needBodyParse (requestMethod) {
    switch (requestMethod) {
      case RequestMethod.ALL: return true
      case RequestMethod.DELETE: return true
      case RequestMethod.GET: return false
      case RequestMethod.HEAD: return false
      case RequestMethod.OPTIONS: return true
      case RequestMethod.PATCH: return true
      case RequestMethod.POST: return true
      case RequestMethod.PUT: return true
      // case RequestMethod.COPY: return false
      default: return false
    }
  }
}
