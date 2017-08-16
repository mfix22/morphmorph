const Mapper = require('..')
const crypto = require('crypto')

/*
 * Create your own type system by passing a 'type:function' map spec to
 * new Mapper().
 */
const types = {
  bool: Boolean,
  string: String,
  int: v => parseInt(v, 10),
  hex: v => parseInt(v, 16),
  id: async () => {
    const id = await new Promise((resolve, reject) =>
      crypto.randomBytes(
        16,
        (err, buffer) => (err ? reject(err) : resolve(buffer.toString('hex')))
      )
    )
    return id
  }
}

module.exports = new Mapper({ types })

/* ...then import your custom Mapper and map away! */
