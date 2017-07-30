const Mapper = require('..')

const mapper = new Mapper()

const useArrayMapper = (array, mapping) => {
  if (mapping.type === 'array') {
    return array.map(v => mapper.map(mapping.mappings, v))
  }
  return array
}

// Add post filter after mapper is instantiated
mapper.config.postFilters = [useArrayMapper]

const itemMappings = ['id', 'name:fullName']
const arrayMapping = { field: 'items', type: 'array', mappings: itemMappings }

const source = {
  items: [
    {
      id: 1,
      name: 'Mike',
      password: '223lkj3'
    },
    {
      id: 2,
      name: 'Nick',
      password: 'asdfssdf323'
    },
    {
      id: 3,
      name: 'Emily',
      password: 'oew0239'
    }
  ]
}
mapper.map([arrayMapping], source)
/*
{ items:
   [ { id: 1, fullName: 'Mike' },
     { id: 2, fullName: 'Nick' },
     { id: 3, fullName: 'Emily' } ] }
*/
