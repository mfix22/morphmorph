const Mapper = require('..')

const mapper = new Mapper()

it('should deeply get object fields', () => {
  const deepObjectNesting = {
    really: {
      really: {
        really: {
          deep: 'deep'
        }
      }
    }
  }
  expect(Mapper.get('really.really.really.deep')(deepObjectNesting)).toEqual(
    'deep'
  )
})

it('should deeply get object fields', () => {
  const shallowObj = {
    shallow: false
  }

  const deepify = Mapper.assign('really.really.deep')

  expect(deepify(shallowObj, true).really.really.deep).toEqual(true)
})

it('should be isomorphic', () => {
  const complexKey = 'a.b.c.d.e.f'
  const expected = 'ABCDEF'

  const get = Mapper.get(complexKey)
  const set = Mapper.assign(complexKey)

  const isomorph = Mapper.compose(get, set)

  expect(isomorph({}, expected)).toEqual(expected)
})

it('should work with basic string mappings', () => {
  const curr = {
    map: true,
    morph: false
  }

  const mappings = ['map', 'morph']

  const mapped = mapper.map(mappings, curr)

  expect(mapped.map).toEqual(true)
  expect(mapped.morph).toEqual(false)
})

it('should filter unmapped values', () => {
  const curr = {
    name: 'Mike',
    email: 'hi@dawnlabs.io',
    password: 'throw'
  }

  const mappings = ['name', 'email']
  const mapped = mapper.map(mappings, curr)

  expect(mapped).toEqual({ name: 'Mike', email: 'hi@dawnlabs.io' })
})

it('should handle deep transformations', () => {
  const curr = {
    here: {
      there: {
        anywhere: true
      }
    },
    now: false
  }

  const mappings = ['here.there.anywhere:here', 'now:maybe.later.never']

  expect(mapper.map(mappings, curr).here).toEqual(true)
  expect(mapper.map(mappings, curr).maybe.later.never).toEqual(false)
})

it('should allow you to compose a type function', () => {
  const curr = { beverage: Infinity }

  const ENUM = ['☕', '🍸', '🍹', '🍵', '🥛', '🍺', '🥃', '🍼', '🍷', '🍶', '🍾']

  // Or you can use your favorite functional library
  const bestBeverage = Mapper.compose(
    index => ENUM[index],
    key => Math.min(key, 0)
  )
  const mappings = [
    {
      field: 'beverage:coffee',
      type: bestBeverage
    }
  ]

  expect(mapper.map(mappings, curr).coffee).toEqual('☕')
})

it('should allow function composition for creating types', () => {
  const curr = { binary: '0001 0001' }

  const ENUM = {
    0: '$',
    1: '£',
    2: '₩',
    17: '¥'
  }

  // Contrived type
  const currencyEnumFromBinary = [
    v => ENUM[v] || '$',
    v => parseInt(v, 2),
    v => v.replace(/\s+/g, '')
  ]
  const mappings = [
    {
      field: 'binary:decimal',
      type: currencyEnumFromBinary
    }
  ]

  expect(mapper.map(mappings, curr).decimal).toEqual('¥')
})

it('should allow you to pass pre-mapping filters', () => {
  const curr = { possiblyNull: null }
  const USE_DEFAULT = (value, field) =>
    value === null || value === undefined ? field.default : value

  const mappings = [
    {
      field: 'possiblyNull:definitelyNotNull',
      default: 'NOT TODAY!'
    }
  ]

  const preFilterMapper = new Mapper({
    preFilters: [USE_DEFAULT]
  })

  const mapped = preFilterMapper.map(mappings, curr)
  expect(mapped.definitelyNotNull).toEqual('NOT TODAY!')
})

it('should allow you to pass post-mapping filters', () => {
  const curr = { possiblyNull: null }
  const USE_GLOBAL_DEFAULTS = (value, field, options) => {
    if (value === null || value === undefined) {
      return options.types && options.GLOBAL_DEFAULTS[field.type]
    }
    return value
  }

  const GLOBAL_DEFAULTS = {
    nonNullable: 'THIS IS JUST A GLOBAL DEFAULT'
  }

  const mappings = [
    {
      field: 'possiblyNull:definitelyNotNull',
      type: 'nonNullable'
    }
  ]

  const postFilterMapper = new Mapper({
    postFilters: [USE_GLOBAL_DEFAULTS],
    GLOBAL_DEFAULTS
  })

  expect(postFilterMapper.map(mappings, curr).definitelyNotNull).toEqual(
    'THIS IS JUST A GLOBAL DEFAULT'
  )
})
