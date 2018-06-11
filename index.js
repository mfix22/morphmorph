const { Identity, id } = require('./src/identity')
const { Maybe, maybe } = require('./src/maybe')
const { Right, Left, either } = require('./src/either')

const DEFAULTS = {
  types: {},
  objDelimiter: '.',
  mapDelimiter: ':',
  preFilters: [],
  postFilters: []
}

/* --- Functional Utilities --- */
const map = fn => x => x.map(fn)
const chain = fn => m => m.chain(fn)
const join = m => m.join()
const compose = (...fns) => (res, ...args) =>
  fns.reduceRight((accum, next) => next(accum, ...args), res)

const flip = fn => a => b => fn(b, a)
const reduce = fn => zero => xs => xs.reduce(fn, zero)
/* ---------------------------- */

const split = d => s => s.split(d)
const int = flip(parseInt)(10)
const handleArray = a => (Array.isArray(a) ? a : Identity.of(a))

const createRootObj = compose(
  join,
  x =>
    Identity.of(x).map(isNaN).map(b => (b ? Object.create(null) : Array.of(x))),
  int
)

const normalizeField = delimiter =>
  compose(
    join,
    chain(m =>
      Identity.of(m)
        .map(m => m.indexOf(delimiter) > -1)
        .map(b => (b ? m : m + delimiter + m))
        .map(split(delimiter))
    ),
    Identity.of
  )

const getMapSpec = (mapping, delimiter) =>
  Identity.of(mapping)
    .map(Array.isArray)
    .map(b => (b ? new Right(mapping) : new Left(mapping)))
    .map(
      either(
        normalizeField(delimiter),
        reduce((spec, field) => {
          const [source, target] = normalizeField(delimiter)(field)
          return [[...spec[0], source], target]
        })([[], null])
      )
    )
    .join()

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

const getKey = reduce((accum, k) => (accum ? accum[k] : undefined))

const get = (key, delimiter = DEFAULTS.objDelimiter) => obj =>
  compose(maybe(obj)(getKey(obj)), map(split(delimiter)), Maybe.of)(key)

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
        /* End user-land transforms */
        ...this.config.postFilters,
        getMappingFilter(mapping, this.config.types),
        ...this.config.preFilters,
        /* Begin user-land transforms */
        m => (Array.isArray(m) ? m : join(m)), // FIXME remove check?,
        map(field => get(field, this.config.objDelimiter)(curr)),
        handleArray
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
