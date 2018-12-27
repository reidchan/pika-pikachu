const Application = require('./application')
const ServicesLoader = require('./loader/services-loader')
const RoutersLoader = require('./loader/routers-loader')

class ApplicationFactory {
  /**
   * config: {
   *   controllers: string path or {path: string, name: 'dir' or 'file'},
   *   services: string path or {path: string, name: 'dir' or 'file'},,
   *   prefix,
   *   jwt: {
   *     signOptions: {secret, expiresIn},
   *     verifyOptions: {isRevoked, secret},
   *     unless: {path: []}
   *   }
   * }
   */
  create (config, koa, App = Application) {
    const app = new App(config, koa)

    const servicePath = typeof config.services === 'object' ? config.services.path : config.services
    const serviceName = typeof config.services === 'object' ? config.services.namedBy : 'file'

    const controllerPath = typeof config.controllers === 'object' ? config.controllers.path : config.controllers
    const controllerName = typeof config.controllers === 'object' ? config.controllers.namedBy : 'file'

    const servicesLoader = new ServicesLoader(app, servicePath, serviceName)
    const routersLoader = new RoutersLoader(app, controllerPath, controllerName)

    // 配置 service 加载器和 controller 加载器
    app.injectData('service', servicesLoader, true)
    app.useRouterLoader(routersLoader)
    return app
  }
}

module.exports = new ApplicationFactory()
