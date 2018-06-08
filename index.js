const DEFAULTS = {
  types: {},
  objDelimiter: '.',
  mapDelimiter: ':',
  preFilters: [],
  postFilters: []
}

const createRootObj = key =>
  isNaN(parseInt(key, 10)) ? Object.create(null) : new Array(parseInt(key, 10))

const assign = (key, delimiter = DEFAULTS.objDelimiter) => {
  const keys = key && key.split(delimiter)
  return (obj, value) => {
    if (keys == null) return obj

    keys.reduce((accum, key, i, array) => {
      if (i === array.length - 1) accum[key] = value
      else if (!accum[key]) accum[key] = createRootObj(array[i + 1])
      return accum[key]
    }, obj)

    return obj
  }
}

const get = (key, delimiter = DEFAULTS.objDelimiter) => {
  const keys = key && key.split(delimiter)
  return obj =>
    keys == null
      ? obj
      : keys.reduce((accum, key) => (accum ? accum[key] : undefined), obj)
}

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

const map = fn => x => (x.map ? x.map(fn) : fn(x))
const keep = current => next => (next === undefined ? current : next)

class Mapper {
  constructor(options) {
    this.config = Object.assign(DEFAULTS, options)
  }

  map(mappings, curr, next = Object.create(null)) {
    const options = this.config
    return mappings.map(normalizeMapping).reduce((accum, mapping) => {
      const [sourceField, targetField] = getMapSpec(
        mapping.field,
        options.mapDelimiter
      )

      const fn = compose(
        keep(accum),
        assign(targetField, options.objDelimiter).bind(this, accum),
        ...options.postFilters,
        getMappingFilter(mapping, options.types),
        ...options.preFilters,
        map(field => get(field, options.objDelimiter)(curr))
      )

      return fn(sourceField, mapping, options, curr, accum)
    }, next)
  }
}

/* Static methods */
Mapper.get = get
Mapper.assign = assign
Mapper.compose = compose

exports.default = Mapper
module.exports = Mapper
