<img width="100" src="http://pkdydm5fm.bkt.clouddn.com/pikachu.png"/>

<p>
  <img src="https://img.shields.io/badge/beta-0.0.2-ff69b4.svg"/>
</p

> 快速搭建一个基于Koa2的应用

# Example
```js
// controller/user.c.js
const { Get, Post, Put, Delete BaseController } = require('pika-pikachu')

class UserController extends BaseController {

  @Get('/:id')
  async getById (ctx, next, { params: { id } }) {
    return await this.app.service.user.getById(id)
  }

  @Post('/')
  async insert (ctx, next, { body: { name, phone } }) {
    return await this.app.service.user.insert({ name, phone })
  }

  @Put('/:id')
  async updateById (ctx, next, { params: { id }, body: { name, phone } }) {
    return await this.app.service.user.updateById(id, { name, phone })
  }

  @Delete('/:id')
  async deleteById (ctx, next, { params: { id } }) {
    return await this.app.service.user.deleteById(id)
  }

}

module.exports = StarCoinController
```

```js
// service/user.s.js
const { BaseService } = require('pika-pikachu')

class UserService extends BaseService {

  async getById (id) {
    return await DB.User.findById(id)
  }

  async insert (user) {
    return await DB.User.create(user)
  }

  async updateById (id, user) {
    return await DB.User.update(user, {
      where: { id }
    })
  }

  async deleteById (id) {
    return await DB.User.destroy({ where: { id } })
  }

}
```

```js
// models/user.js
class User {

  static options () {
    return {
      paranoid: true
    }
  }

  static fields (DataTypes) {
    return {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(50)
      },
      phone: {
        type: DataTypes.STRING(11)
      }
    }
  }

}

module.exports = User
```

```js
// bootstrap.js
const { Pikachu, PikaCore, PikaRouter, SequelizeProvider } = require('pika-pikachu')
const dbConfig = require('config').get('Database')

async function bootstrap () {
  const core = new PikaCore()
  const router = new PikaRouter(8012, '/api')
  const pikachu = await Pikachu(core, router)
  global.DB = await pikachu.connectDatabase(new SequelizeProvider(dbConfig, 'models'))
  return pikachu
}

module.exports = bootstrap
```

```js
// index.js
const bootstrap = require('./bootstrap')
bootstrap().catch(e => console.error(e))
```
