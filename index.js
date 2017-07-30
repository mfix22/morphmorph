const DEFAULT_CONFIG = {
  types: {},
  objDelimiter: '.',
  mapDelimiter: ':',
  preFilters: [],
  postFilters: []
}

const _createRootObj = (obj, key) =>
  isNaN(parseInt(key, 10)) ? {} : Array(parseInt(key, 10))

const assign = (key, delimiter = DEFAULT_CONFIG.objDelimiter) => (
  obj,
  value
) => {
  key.split(delimiter).reduce((accum, key, i, array) => {
    if (i === array.length - 1) accum[key] = value
    else if (!accum[key]) accum[key] = _createRootObj(accum, array[i + 1])
    return accum[key]
  }, obj)

  return obj
}

const get = (key, delimiter = DEFAULT_CONFIG.objDelimiter) => obj =>
  key
    .split(delimiter)
    .reduce((accum, key) => (accum ? accum[key] : undefined), obj)

const compose = (...fns) => (res, ...args) =>
  fns.reverse().reduce((accum, next) => next(accum, ...args), res)

const _getMapSpec = (mapping, delimiter) =>
  (mapping.indexOf(delimiter) > -1
    ? mapping
    : mapping + delimiter + mapping).split(delimiter)

const _normalizeMapping = mapping =>
  typeof mapping === 'string' ? { field: mapping } : mapping

const _getMappingFilter = (mapping, types) => {
  if (mapping.type) {
    if (Array.isArray(mapping.type)) return compose(...mapping.type)
    if (typeof mapping.type === 'function') return mapping.type
    if (Object.prototype.hasOwnProperty.call(types, mapping.type))
      return types[mapping.type]
  }
  return _ => _
}

class Mapper {
  constructor(options) {
    this.config = Object.assign(DEFAULT_CONFIG, options)
  }

  map(mappings, curr, next = {}) {
    const options = this.config
    return mappings.map(_normalizeMapping).reduce((accum, mapping) => {
      const [alphaField, betaField] = _getMapSpec(
        mapping.field,
        options.mapDelimiter
      )

      const filter = compose(
        ...options.postFilters,
        _getMappingFilter(mapping, options.types),
        ...options.preFilters
      )
      const value = filter(
        get(alphaField, options.objDelimiter)(curr),
        mapping,
        options,
        curr,
        accum
      )
      return value === undefined
        ? accum
        : assign(betaField, options.objDelimiter)(accum, value)
    }, next)
  }
}

/* Static methods */
Mapper.get = get
Mapper.assign = assign
Mapper.compose = compose

exports.default = Mapper
module.exports = Mapper
