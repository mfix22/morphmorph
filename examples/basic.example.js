const Mapper = require('..')

const mapper = new Mapper({
  mapDelimiter: '->'
})

const filterMapping = ['id', 'fullName->name']

const source = {
  id: '1',
  fullName: 'Bobbi Jene',
  password: '32j33j24@323903' // Probably shouldn't return this!
}

mapper.map(filterMapping, source)
// -> { id: '1', name: 'Bobbi Jene' }
