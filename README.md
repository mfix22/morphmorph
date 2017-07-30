# Morph Morph
##### Isomorphic transformations. Map, transform, filter, and morph your objects

## Getting Started
```bash
$ npm i --save morphmorph
```
and then
```javascript
const Mapper = require('morphmorph')

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
##### Options

| Field          | Type           | Default        |
| :------------- | :------------- | :------------- |
| `types`        | `Object`       | `{}`           |
| `objDelimiter` | `String`       | `"."`          |
| `mapDelimiter` | `String`       | `":"`          |
| `preFilters`   | `Array`        | `[]`           |
| `postFilters`  | `Array`        | `[]`           |

##### Example
```javascript
const mapper = new Mapper({
  objDelimiter: '|',
  mapDelimiter: '->',
  types: { bool: Boolean },
  preFilters: [ FILTER_NULL ],
  postFilters: [ REMOVE_PASSWORD ]
  // add other field to your config here
})
```


## Examples
See `test/index.spec.js` for more examples of how to use `MorphMorph`.
