const DatabaseProvider = require('../database-provider')
const ModelLoader = require('./sequelize-model-loader')

const Sequelize = require('sequelize')
const operatorsAliases = require('./operatorsAliases')(Sequelize.Op)
const path = require('path')

module.exports = class SequelizeProvider extends DatabaseProvider {
  constructor (config, modelRootPath) {
    super(config.providerName || 'sequelize')
    this.config = config
    this.modelRootPath = path.join(__dirname, '../../../../../', modelRootPath)

    this.initialize()
  }

  initialize () {
    this.createSequelize()
    ModelLoader.load(this.sequelize, this.modelRootPath).catch(e => this.logger.error(e))
  }

  createSequelize () {
    const config = {
      host: this.config.host,
      port: this.config.port,
      dialect: this.config.dialect,
      dialectOptions: {
        charset: 'utf8'
      },
      quoteIdentifiers: false,
      pool: {
        max: 10,
        min: 0,
        idle: 10000,
        acquire: 50000
      },
      logging: this.config.logging || false,
      benchmark: this.config.benchmark || false,
      operatorsAliases
    }
    if (this.config.timezone) {
      config.timezone = this.config.timezone
    }
    this.sequelize = new Sequelize(
      this.config.name,
      this.config.username,
      this.config.password, config)
  }

  async connect () {
    try {
      await this.sequelize.authenticate()
      this.logger.log('数据库连接成功')
    } catch (e) {
      this.logger.error('数据库连接失败')
      throw e
    }
    return this.sequelize
  }

  getDatabase () {
    return this.sequelize
  }
}
