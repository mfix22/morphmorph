class Maybe {
  constructor(x) {
    this._ = x
    this.nil = x === undefined
    // ----- Functor Maybe
    this.map = fn => (this.nil ? this : Maybe.of(fn(x)))
    this.join = () => (this.nil ? this : x)
    // ----- Monad Maybe
    this.chain = fn => this.map(fn).join()
  }
  // inspect() { return `Maybe(${this._}`; }
  // ----- Applicative Maybe
  // ap(f) { return this.nil ? this : f.map(this._) }
  // ----- Traversable Maybe
  // sequence(of) { this.traverse(of, identity) }
  // traverse(of, fn) { return this.nil ? of(this) : fn(this._).map(Maybe.of) }
}
// ----- Pointed Maybe
Maybe.of = x => new Maybe(x)

const maybe = v => f => m => (m.nil ? v : f(m._))

module.exports = {
  Maybe,
  maybe
}
