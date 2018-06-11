class Identity {
  constructor(x) {
    // ----- Functor Identity
    this.map = fn => Identity.of(fn(x))
    // ----- Monad Identity
    this.chain = fn => this.map(fn).join()
    this.join = () => x
  }
  // inspect() { return `Identity(${this._})` }
  // ----- Applicative Identity
  // ap(f) { return f.map(this._) }
  // ----- Traversable Identity
  // sequence(of) { return this.traverse(of, identity) }
  // traverse(of, fn) { return fn(this._).map(Identity.of) }
}

// ----- Pointed Identity
Identity.of = x => new Identity(x)

module.exports = {
  Identity,
  id: _ => _
}
