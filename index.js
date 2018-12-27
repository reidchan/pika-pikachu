// 启用装饰器
require('babel-register')({
  plugins: [
    'transform-decorators-legacy'
  ]
})

const ApplicationFactory = require('./framework/application-factory')
const SequelizeProvider = require('./framework/database/sequelize/sequelize-provider')
const RedisProvider = require('./framework/database/redis/redis-provider')
const RedisLockProvider = require('./framework/database/redis/redis-lock-provider')
const ClassLoader = require('./framework/loader/class-loader')

const PikaController = require('./framework/base-controller')
const PikaService = require('./framework/base-service')

const {
  ALL,
  Get,
  Post,
  Delete,
  Head,
  Options,
  Patch,
  Put,
  Validate,
  Before,
  After,
  Message,
  IgnoreJwt
} = require('./framework/decorators/request-mapping')

const {
  BeforeAll,
  AfterAll,
  IgnoreJwtAll
} = require('./framework/decorators/controller-mapping')

class PikaCore {
  constructor () {
    this.service = true
    this.router = true
    this.jwt = true
  }
}

class PikaRouter {
  constructor (port, prefix) {
    this.port = port
    this.prefix = prefix
  }
}

class PikaConfig {
  constructor () {
    this.jwtConfig = undefined
  }
}

const Pikachu = async (core, router, config) => {
  const app = ApplicationFactory.create({
    services: core.service ? 'service' : undefined,
    controllers: core.router ? 'controller' : undefined,
    prefix: router.prefix ? router.prefix : undefined,
    jwt: core.jwt ? config.jwt : undefined
  })
  if (core.router) {
    const port = router.port
    await app.listenAsync(port)
  }
  return app
}

module.exports = {
  Pikachu,
  PikaCore,
  PikaRouter,
  PikaConfig,
  SequelizeProvider,
  RedisProvider,
  RedisLockProvider,
  ClassLoader,

  PikaController,
  PikaService,

  Get,
  Post,
  Delete,
  Head,
  Patch,
  Put,

  Before,
  After,
  Message,
  IgnoreJwt,

  BeforeAll,
  AfterAll,
  IgnoreJwtAll
}
