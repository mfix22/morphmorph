class Maybe {
  get isNothing() {
    return this.$value === null || this.$value === undefined
  }
  get isJust() {
    return !this.isNothing
  }
  constructor(x) {
    this.$value = x
  }
  // ----- Functor Maybe
  map(fn) {
    return this.isNothing ? this : Maybe.of(fn(this.$value))
  }
  join() {
    return this.isNothing ? this : this.$value
  }
  // inspect() { return `Maybe(${this.$value}`; }
  // ----- Applicative Maybe
  ap(f) {
    return this.isNothing ? this : f.map(this.$value)
  }
  // ----- Monad Maybe
  // chain(fn) { return this.map(fn).join() }
}
// ----- Pointed Maybe
Maybe.of = x => new Maybe(x)
Maybe.maybe = v => f => m => (m.isNothing ? v : f(m.$value))

module.exports = Maybe
