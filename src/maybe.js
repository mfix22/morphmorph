class Maybe {
  constructor(x) {
    this.$value = x
    this.nil = x === undefined
    // ----- Functor Maybe
    this.map = fn => (this.nil ? this : Maybe.of(fn(x)))
    this.join = () => (this.nil ? this : x)
  }
  // inspect() { return `Maybe(${this.$value}`; }
  // ----- Applicative Maybe
  // ap(f) { return this.nil ? this : f.map(this.$value) }
  // ----- Monad Maybe
  // chain(fn) { return this.map(fn).join() }
  // ----- Traversable Maybe
  // sequence(of) { this.traverse(of, identity) }
  // traverse(of, fn) { return this.nil ? of(this) : fn(this.$value).map(Maybe.of) }
}
// ----- Pointed Maybe
Maybe.of = x => new Maybe(x)

const maybe = v => f => m => (m.nil ? v : f(m.$value))

module.exports = {
  Maybe,
  maybe
}
