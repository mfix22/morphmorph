class Identity {
  constructor(x) {
    this.$value = x
  }
  // ----- Functor Identity
  map(fn) {
    return Identity.of(fn(this.$value))
  }
  // ----- Monad Identity
  chain(fn) {
    return this.map(fn).join()
  }
  join() {
    return this.$value
  }
  // inspect() { return `Identity(${this.$value})` }
  // ----- Applicative Identity
  // ap(f) { return f.map(this.$value) }
}

// ----- Pointed Identity
Identity.of = x => new Identity(x)

module.exports = Identity
