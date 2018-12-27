const DatabaseProvider = require('../database-provider')
const Redis = require('ioredis')

module.exports = class RedisProvider extends DatabaseProvider {
  constructor (config) {
    super('redis')
    this.config = config
    if (this.config && Number.isInteger(this.config.reconnectTime)) {
      this.reconnectTime = this.config.reconnectTime
    } else {
      // 默认最大出错重连次数为3
      this.reconnectTime = 3
    }
    // 当前出错重连次数
    this.connectCount = 0
  }

  async connect () {
    const config = this.config
    const client = this.client = new Redis(config.port, config.host, {
      password: config.password,
      db: config.db || 0,
      reconnectOnError: function (error) {
        console.error(error)
        if (this.connectCount < this.reconnectTime) {
          this.connectCount++
          return true
        } else {
          return false
        }
      }
    })
    client.on('connect', () => {
      this.logger.log('缓存链接成功')
    })
    client.on('disconnect', () => {
      this.logger.error('缓存服务器断开')
    })
    client.on('error', (e) => {
      this.logger.error('缓存组件出错')
      this.logger.error(e)
      // throw e
    })
    return client
  }

  getDatabase () {
    return this.client
  }
}
