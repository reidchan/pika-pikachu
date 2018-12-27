require('reflect-metadata')

const {
  CONTROLLER_BEFORE_ALL_METADATA,
  CONTROLLER_AFTER_ALL_METADATA,
  CONTROLLER_IGNORE_JWT_ALL_METADATA } = require('../constants')

function createControllerMapping (metadata) {
  return (middlewares) => {
    return (target) => {
      const _middlewares = Reflect.getMetadata(metadata, target) || []
      middlewares = (middlewares instanceof Array) ? middlewares : [middlewares]
      middlewares = middlewares.concat(_middlewares)
      Reflect.defineMetadata(metadata, middlewares, target)
    }
  }
}

const createSingleDecorator = (metadata) => {
  return (value) => {
    return (target) => {
      Reflect.defineMetadata(metadata, value, target)
    }
  }
}

const createCoupleDecorator = (metadata) => {
  return (value1, value2) => {
    return (target, key, descriptor) => {
      Reflect.defineMetadata(metadata, {
        name: value2,
        description: value1
      }, target)
    }
  }
}

const BeforeAll = createControllerMapping(CONTROLLER_BEFORE_ALL_METADATA)
const AfterAll = createControllerMapping(CONTROLLER_AFTER_ALL_METADATA)
const IgnoreJwtAll = createSingleDecorator(CONTROLLER_IGNORE_JWT_ALL_METADATA)(true)

module.exports = {
  BeforeAll,
  AfterAll,
  IgnoreJwtAll
}
