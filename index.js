function id(_) {
  return _
}

const DEFAULTS = {
  types: {},
  objDelimiter: '.',
  mapDelimiter: ':',
  preFilters: [],
  postFilters: []
}

const compose = (...fns) => (res, ...args) =>
  fns.reduceRight((accum, next) => next(accum, ...args), res)

const createRootObj = compose(
  n => (isNaN(n) ? Object.create(null) : new Array(n)),
  Number
)

const normalizeField = delimiter => m => {
  if (m.indexOf(delimiter) > -1) {
    return m.split(delimiter)
  }

  return [m, m]
}

const getMapSpec = delimiter => {
  const normalizer = normalizeField(delimiter)

  return mapping => {
    if (!Array.isArray(mapping)) return normalizer(mapping)

    return mapping.reduce(
      (spec, field) => {
        const [source, target] = normalizer(field)
        return [[...spec[0], source], target]
      },
      [[], null]
    )
  }
}

const normalizeMapping = mapping =>
  typeof mapping === 'string' ? { field: mapping } : mapping

const getMappingFilter = (type, types) => {
  if (Array.isArray(type)) return compose(...type)
  if (typeof type === 'function') return type
  if (Object.prototype.hasOwnProperty.call(types, type)) return types[type]
  return id
}

const get = (key, delimiter = DEFAULTS.objDelimiter) => {
  if (key == null) return id

  const spec = key.split(delimiter)

  return obj => spec.reduce((a, k) => (a ? a[k] : undefined), obj)
}

const assign = (key, delimiter = DEFAULTS.objDelimiter) => {
  if (key == null) return id

  const spec = key.split(delimiter)
  return (obj, value) => {
    spec.reduce((accum, key, i, array) => {
      if (i === array.length - 1) accum[key] = value
      else if (!accum[key]) accum[key] = createRootObj(array[i + 1])
      return accum[key]
    }, obj)
    return obj
  }
}

class Mapper {
  constructor(options) {
    this.config = Object.assign({}, DEFAULTS, options)
    this.getMapSpec = getMapSpec(this.config.mapDelimiter)

    this.mapFn = compose(
      ...this.config.postFilters,
      (v, m, con, c, a) =>
        getMappingFilter(m.type, this.config.types)(v, m, con, c, a),
      ...this.config.preFilters
    )
  }

  map(mappings, curr, next = Object.create(null)) {
    return mappings.map(normalizeMapping).reduce((accum, mapping) => {
      const [sourceField, targetField] = this.getMapSpec(mapping.field)

      let value
      const fn = field => get(field, this.config.objDelimiter)(curr)
      if (Array.isArray(sourceField)) {
        value = sourceField.map(fn)
      } else {
        value = fn(sourceField)
      }

      value = this.mapFn(value, mapping, this.config, curr, accum)

      if (value === undefined) {
        return accum
      }

      return assign(targetField, this.config.objDelimiter)(accum, value)
    }, next)
  }
}

/* Static methods */
Mapper.get = get
Mapper.assign = assign
Mapper.compose = compose

exports.default = Mapper
module.exports = Mapper
