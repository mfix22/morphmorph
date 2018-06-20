const { Either, either, left, fromNullable } = require('./src/either')

const id = _ => _
const always = a => () => a

const DEFAULTS = {
  types: {},
  objDelimiter: '.',
  mapDelimiter: ':',
  preFilters: [],
  postFilters: []
}

/* --- Functional Utilities --- */
const map = fn => x => (x.map ? x.map(fn) : fn(x)) // FIXME remove check
const join = m => m.join()
// const chain = fn => m => m.chain(fn)
const compose = (...fns) => (res, ...args) =>
  fns.reduceRight((accum, next) => next(accum, ...args), res)

const reduce = fn => zero => xs => xs.reduce(fn, zero)
/* ---------------------------- */

const split = d => s => s.split(d)

const createRootObj = compose(
  either(Object.create, Array),
  n => (isNaN(n) ? left(null) : Either.of(n)),
  Number
)

const normalizeField = delimiter => m =>
  fromNullable(m)
    .map(m => m.indexOf(delimiter) > -1)
    .map(b => (b ? m : m + delimiter + m))
    .map(split(delimiter))

const getMapSpec = delimiter => mapping =>
  fromNullable(mapping)
    .map(Array.isArray)
    .map(b => (b ? Either.of(mapping) : left(mapping)))
    .map(
      either(
        compose(join, normalizeField(delimiter)),
        reduce((spec, field) =>
          normalizeField(delimiter)(field)
            .map(([source, target]) => [[...spec[0], source], target])
            .join()
        )([[], null])
      )
    )

const normalizeMapping = mapping =>
  typeof mapping === 'string' ? { field: mapping } : mapping

const getMappingFilter = (type, types) => {
  if (Array.isArray(type)) return compose(...type)
  if (typeof type === 'function') return type
  if (Object.prototype.hasOwnProperty.call(types, type)) return types[type]
  return id
}

const getKey = reduce((accum, k) => (accum ? accum[k] : undefined))

const get = (key, delimiter = DEFAULTS.objDelimiter) => obj =>
  compose(
    either(always(obj), getKey(obj)),
    map(split(delimiter)),
    fromNullable
  )(key)

const setKey = value =>
  reduce((accum, key, i, array) => {
    if (i === array.length - 1) accum[key] = value
    else if (!accum[key]) accum[key] = createRootObj(array[i + 1])
    return accum[key]
  })

const assign = (key, delimiter = DEFAULTS.objDelimiter) => (obj, value) =>
  compose(
    always(obj),
    either(id, setKey(value)(obj)),
    map(split(delimiter)),
    fromNullable
  )(key)

class Mapper {
  constructor(options) {
    this.config = Object.assign({}, DEFAULTS, options)
  }

  map(mappings, curr, next = Object.create(null)) {
    return mappings.map(normalizeMapping).reduce(
      (accum, mapping) =>
        fromNullable(mapping.field)
          .chain(getMapSpec(this.config.mapDelimiter))
          .chain(([sourceField, targetField]) =>
            Either.of(sourceField)
              .map(map(field => get(field, this.config.objDelimiter)(curr)))
              .map(_ =>
                compose(
                  /* End user-land transforms */
                  ...this.config.postFilters,
                  getMappingFilter(mapping.type, this.config.types),
                  ...this.config.preFilters
                  /* Begin user-land transforms */
                )(_, mapping, this.config, curr, accum)
              )
              .map(fromNullable)
              .chain(
                either(
                  always(accum),
                  assign(targetField, this.config.objDelimiter).bind(
                    this,
                    accum
                  )
                )
              )
          ),
      next
    )
  }
}

/* Static methods */
Mapper.get = get
Mapper.assign = assign
Mapper.compose = compose

exports.default = Mapper
module.exports = Mapper
