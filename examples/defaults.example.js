const Mapper = require('..')

/*
 * Use the mapping's default if value is null/undefined
 */
const USE_DEFAULT = (value, field) =>
  value === null || value === undefined ? field.default : value

/*
 * If the value is null/undefined, and no `default` is specified, the mapper
 * will fallback to these defaults for each type
 */
const USE_GLOBAL_DEFAULTS = (value, field, options) => {
  if (value === null || value === undefined) {
    return options.types && options.GLOBAL_DEFAULTS[field.type]
  }
  return value
}

const mapper = new Mapper({
  postFilters: [USE_GLOBAL_DEFAULTS, USE_DEFAULT],
  GLOBAL_DEFAULTS: {
    bool: false,
    number: 0
  }
})

const mappings = [
  { field: 'deleted', type: 'bool' },
  { field: 'enabled', type: 'bool', default: true },
  { field: 'level', type: 'number' }
]

mapper.map(mappings, {
  deleted: null,
  enabled: null
  // Assume level: undefined
})
// -> { deleted: false, enabled: true, level: 0 }
