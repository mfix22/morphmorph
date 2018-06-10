const Identity = require('./src/identity')
const Maybe = require('./src/maybe')

const { maybe } = Maybe

const DEFAULTS = {
  types: {},
  objDelimiter: '.',
  mapDelimiter: ':',
  preFilters: [],
  postFilters: []
}

const id = _ => _
const flip = fn => a => b => fn(b, a)
const map = fn => x => (x.map ? x.map(fn) : fn(x))
const split = d => s => s.split(d)

const reduce = fn => zero => xs => xs.reduce(fn, zero)

const compose = (...fns) => (res, ...args) =>
  fns.reduceRight((accum, next) => next(accum, ...args), res)

const createRootObj = key =>
  Identity.of(key)
    .map(flip(parseInt)(10))
    .chain(x =>
      Identity.of(x)
        .map(isNaN)
        .map(b => (b ? Object.create(null) : Array.of(x)))
    )
    .join()

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

const getKey = reduce((accum, k) => (accum ? accum[k] : undefined))

const get = (key, delimiter = DEFAULTS.objDelimiter) => obj =>
  compose(maybe(obj)(getKey(obj)), map(split(delimiter)), Maybe.of)(key)

const normalizeField = (mapping, delimiter) =>
  Identity.of(mapping)
    .map(m => m.indexOf(delimiter) > -1)
    .map(b => (b ? mapping : mapping + delimiter + mapping))
    .map(split(delimiter))
    .join()

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
  return id
}

const keep = current => next => (next === undefined ? current : next)

class Mapper {
  constructor(options) {
    this.config = Object.assign({}, DEFAULTS, options)
  }

  map(mappings, curr, next = Object.create(null)) {
    return mappings.map(normalizeMapping).reduce((accum, mapping) => {
      const [sourceField, targetField] = getMapSpec(
        mapping.field,
        this.config.mapDelimiter
      )

      const fn = compose(
        keep(accum),
        assign(targetField, this.config.objDelimiter).bind(this, accum),
        ...this.config.postFilters,
        getMappingFilter(mapping, this.config.types),
        ...this.config.preFilters,
        map(field => get(field, this.config.objDelimiter)(curr))
      )

      return fn(sourceField, mapping, this.config, curr, accum)
    }, next)
  }
}

/* Static methods */
Mapper.get = get
Mapper.assign = assign
Mapper.compose = compose

exports.default = Mapper
module.exports = Mapper
