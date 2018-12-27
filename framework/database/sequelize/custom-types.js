
const {ABSTRACT} = require('sequelize').DataTypes
const {inherits} = require('../../utils')
const util = require('util')
const _ = require('lodash')

function OBJECT (length) {
  const options = (typeof length === 'object' && length) || {length}
  if (!(this instanceof OBJECT)) return new OBJECT(options)
  this.options = options
  this._length = options.length || ''
}
inherits(OBJECT, ABSTRACT)

OBJECT.prototype.key = OBJECT.key = 'OBJECT'
OBJECT.prototype.toSql = function toSql () {
  switch (this._length.toLowerCase()) {
    case 'tiny':
      return 'TINYTEXT'
    case 'medium':
      return 'MEDIUMOTEXT'
    case 'long':
      return 'LONGTEXT'
    default:
      return 'TEXT'
  }
}
OBJECT.prototype.validate = function validate (value) {
  if (!_.isString(value)) {
    throw new Error(util.format('%j is not a valid string', value))
  }

  return true
}

module.exports = {
  OBJECT
}
