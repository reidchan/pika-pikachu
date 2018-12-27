const util = require('util')
const _ = require('lodash')
/**
 * like util.inherits, but also copies over static properties
 */
const inherits = function (constructor, superConstructor) {
  util.inherits(constructor, superConstructor) // Instance (prototype) methods
  _.extend(constructor, superConstructor) // Static methods
}

const isUndefined = (obj) => typeof obj === 'undefined'
const isFunction = (fn) => typeof fn === 'function'
const isObject = (fn) => typeof fn === 'object'
const isString = (fn) => typeof fn === 'string'
const isConstructor = (fn) => fn === 'constructor'
const validatePath = (path) => (path.charAt(0) !== '/') ? '/' + path : path
const isNil = (obj) => isUndefined(obj) || obj === null
const isEmpty = (array) => !(array && array.length > 0)
const bigCamelize = (str) => str.trim().replace(/(\w)/, first => first.toUpperCase()).replace(/[-_\s]+(.)?/g, (match, c) => c.toUpperCase())
const camelize = (str) => str.trim().replace(/[-_\s]+(.)?/g, (match, c) => c.toUpperCase())
const createNullArray = (length) => Array.apply(null, { length }).fill(null)

module.exports = {
  isUndefined,
  isFunction,
  isObject,
  isString,
  isConstructor,
  validatePath,
  isNil,
  isEmpty,
  bigCamelize,
  camelize,
  createNullArray,
  inherits
}
