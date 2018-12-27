const DatabaseProvider = require('../database-provider')
const Redis = require('ioredis')
const Redlock = require('redlock')

module.exports = class RedisLockProvider extends DatabaseProvider {
  constructor (config) {
    super('lock')
    this.config = config
  }

  async connect () {
    const config = this.config
    const client = this.client = new Redis(config.port, config.host, {
      password: config.password,
      db: config.db || 0
    })
    client.on('connect', () => {
      this.logger.log('Lock缓存链接成功')
    })
    client.on('disconnect', () => {
      this.logger.error('Lock缓存服务器断开')
    })
    client.on('error', (e) => {
      this.logger.error('Lock缓存组件出错')
      throw e
    })

    const redlock = this.redlock = new Redlock([client], {
      retryCount: 3,
      retryDelay: 200
    })
    return redlock
  }

  getDatabase () {
    return this.redlock
  }
}
