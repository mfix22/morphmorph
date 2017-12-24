const DEFAULTS = {
  types: {},
  objDelimiter: '.',
  mapDelimiter: ':',
  preFilters: [],
  postFilters: []
}

const createRootObj = key =>
  isNaN(parseInt(key, 10)) ? {} : Array(parseInt(key, 10))

const assign = (key, delimiter = DEFAULTS.objDelimiter) => (obj, value) => {
  key.split(delimiter).reduce((accum, key, i, array) => {
    if (i === array.length - 1) accum[key] = value
    else if (!accum[key]) accum[key] = createRootObj(array[i + 1])
    return accum[key]
  }, obj)

  return obj
}

const get = (key, delimiter = DEFAULTS.objDelimiter) => obj =>
  key
    .split(delimiter)
    .reduce((accum, key) => (accum ? accum[key] : undefined), obj)

const compose = (...fns) => (res, ...args) =>
  fns.reduceRight((accum, next) => next(accum, ...args), res)

const normalizeField = (mapping, delimiter) =>
  (mapping.indexOf(delimiter) > -1
    ? mapping
    : mapping + delimiter + mapping).split(delimiter)

const getMapSpec = (mapping, delimiter) => {
  if (Array.isArray(mapping)) {
    return mapping.reduce(
      (spec, field) => {
        const [source, target] = normalizeField(field, delimiter)
        return [[...spec[0], source], target]
      },
      [[], null]
    )
  }
  return normalizeField(mapping, delimiter)
}

const normalizeMapping = mapping =>
  typeof mapping === 'string' ? { field: mapping } : mapping

const getMappingFilter = (mapping, types) => {
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
    this.config = Object.assign(DEFAULTS, options)
  }

  map(mappings, curr, next = {}) {
    const options = this.config
    return mappings.map(normalizeMapping).reduce((accum, mapping) => {
      const [sourceField, targetField] = getMapSpec(
        mapping.field,
        options.mapDelimiter
      )

      const filter = compose(
        ...options.postFilters,
        getMappingFilter(mapping, options.types),
        ...options.preFilters
      )

      const source = Array.isArray(mapping.field)
        ? sourceField.map(field => get(field, options.objDelimiter)(curr))
        : get(sourceField, options.objDelimiter)(curr)

      const value = filter(source, mapping, options, curr, accum)
      return value === undefined
        ? accum
        : assign(targetField, options.objDelimiter)(accum, value)
    }, next)
  }
}

/* Static methods */
Mapper.get = get
Mapper.assign = assign
Mapper.compose = compose

exports.default = Mapper
module.exports = Mapper
