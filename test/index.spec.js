const Mapper = require('..')

const mapper = new Mapper()

it('should return first value if key is undefined', () => {
  expect(Mapper.get()(true)).toBe(true)
  expect(Mapper.assign()(true)).toBe(true)
})

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

it('should deeply assign object fields', () => {
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

  const isomorph = Mapper.compose(
    get,
    set
  )

  expect(isomorph({}, expected)).toEqual(expected)
})

it('should not fail if key is invalid', () => {
  const obj = {
    user: {
      friends: [
        {
          name: 'Nick'
        }
      ]
    }
  }
  expect(Mapper.get('user.friends.1.name')(obj)).toBeUndefined()
})

it('should create an empty array for number keys', () => {
  const obj = {}
  const mapped = Mapper.assign('user.friends.0.name')(obj, 'Nick')
  expect(mapped.user.friends).toBeInstanceOf(Array)
  expect(mapped.user.friends[0].name).toBe('Nick')
})

it('should not override fields that already exist', () => {
  const obj = {
    user: {
      id: 123
    }
  }
  const mapped = Mapper.assign('user.name')(obj, 'Nick')
  expect(mapped.user.id).toBe(123)
  expect(mapped.user.name).toBe('Nick')
})

it.each([[undefined, {}], [null, { key: null }]])(
  'map(() => %s) => %s',
  (value, exp) => {
    expect(mapper.map([{ field: 'key', type: () => value }], {})).toEqual(exp)
  }
)

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

it('should not set key if undefined is returned', () => {
  const obj = { key: true }
  const mappings = [{ field: 'key', type: () => undefined }]

  expect(mapper.map(mappings, obj)).toEqual({})
})

it('should allow you to compose a type function', () => {
  const curr = { beverage: Infinity }

  const ENUM = [
    '☕',
    '🍸',
    '🍹',
    '🍵',
    '🥛',
    '🍺',
    '🥃',
    '🍼',
    '🍷',
    '🍶',
    '🍾'
  ]

  // Use, `Mapper.compose`, or your favorite functional library
  const bestBeverage = Mapper.compose(
    index => ENUM[index],
    key => Math.min(key, 0)
  )
  const mappings = [
    {
      field: 'beverage:bestBeverage',
      type: bestBeverage
    }
  ]

  expect(mapper.map(mappings, curr).bestBeverage).toEqual('☕')
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
      return options.GLOBAL_DEFAULTS && options.GLOBAL_DEFAULTS[field.type]
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
    /**
     * This field is not specific to this library, but allows you to build your
     * own mapping system
     */
    GLOBAL_DEFAULTS
  })

  expect(postFilterMapper.map(mappings, curr).definitelyNotNull).toEqual(
    'THIS IS JUST A GLOBAL DEFAULT'
  )
})

it('should allow you to specify a type system', () => {
  const types = {
    bool: Boolean,
    upper: s => s.toUpperCase()
  }

  const mapper = new Mapper({ types })

  const obj = { key: 'true' }

  expect(mapper.map([{ field: 'key', type: 'bool' }], obj).key).toBe(true)
  expect(mapper.map([{ field: 'key', type: 'upper' }], obj).key).toBe('TRUE')
})

it('should be able to reduce multiple values into one', () => {
  const obj = {
    user: {
      firstName: 'Mike',
      lastName: 'Fix',
      professionInfo: {
        title: 'Mr',
        occupation: 'Software Engineer'
      }
    }
  }

  const field = {
    field: [
      'user.firstName',
      'user.lastName',
      'user.professionInfo.title',
      'user.professionInfo.occupation',
      'description'
    ],
    type: ([name1, name2, title, occ]) =>
      `${title}. ${name1} ${name2} is a ${occ}`
  }
  expect(mapper.map([field], obj).description).toBe(
    'Mr. Mike Fix is a Software Engineer'
  )
})
