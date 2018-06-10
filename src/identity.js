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
  // ----- Traversable Identity
  // sequence(of) { return this.traverse(of, identity) }
  // traverse(of, fn) { return fn(this.$value).map(Identity.of) }
}

// ----- Pointed Identity
Identity.of = x => new Identity(x)

module.exports = {
  Identity,
  id: _ => _
}
