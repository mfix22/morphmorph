function id(_) {
  return _
}

const DEFAULTS = {
  types: Object.create(null),
  objDelimiter: '.',
  mapDelimiter: ':',
  preFilters: [],
  postFilters: []
}

const compose = (...fns) => (i, ...args) =>
  fns.reduceRight((a, n) => n(a, ...args), i)

const createRootObj = n =>
  isNaN(n) ? Object.create(null) : new Array(Number(n))

const normalizeField = delimiter => m =>
  m.indexOf(delimiter) > -1 ? m.split(delimiter) : [m, m]

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
    this.config = Object.assign(Object.create(null), DEFAULTS, options)
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

      const getter = field => get(field, this.config.objDelimiter)(curr)

      let value = Array.isArray(sourceField)
        ? sourceField.map(getter)
        : getter(sourceField)

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
