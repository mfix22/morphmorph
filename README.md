# MapLib
##### Map, transform, filter, and morph your objects

## Getting Started
```bash
$ npm i --save maplib
```
and then
```javascript
const Mapper = require('maplib')

const mapper = new Mapper(/* [config] */)

const old = {
  here: {
    there: {
      anywhere: 'Earth'
    }
  }
}

const mappings = [ 'here.there.anywhere:location' ]

const transformation = mapper.map(mappings, old)
// -> { location: 'Earth' }
```

## Config
You can pass in a config object to `Mapper` to create your own mapping system:
```javascript
const mapper = new Mapper({
  objDelimeter: '|',
  mapDelimeter: '->',
  types: { bool: Boolean },
  preFilters: [ FILTER_NULL ],
  postFilters: [ REMOVE_PASSWORD ]
  // add other field to your config here
})
```

| Field          | Type           | Default        |
| :------------- | :------------- | :------------- |
| `types`        | `Object`       | `{}`           |
| `objDelimeter` | `String`       | `"."`          |
| `mapDelimeter` | `String`       | `":"`          |
| `preFilters`   | `Array`        | `[]`           |
| `postFilters`  | `Array`        | `[]`           |
