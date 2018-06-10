class Either {
  constructor(x) {
    this.$value = x
  }
}

class Left extends Either {
  get isLeft() {
    return true
  }
  get isRight() {
    return false
  }
  // ----- Functor (Either a)
  map() {
    return this
  }
  join() {
    return this
  }
  // ----- Applicative (Either a)
  // ap() { return this }
  // ----- Monad (Either a)
  // chain() { return this }
  // inspect() { return `Left(${this.$value})` }
  // ----- Traversable (Either a)
  // sequence(of) { return of(this) }
  // traverse(of, fn) { return of(this) }
}

class Right extends Either {
  get isLeft() {
    return false
  }
  get isRight() {
    return true
  }
  // ----- Functor (Either a)
  map(fn) {
    return Either.of(fn(this.$value))
  }
  join() {
    return this.$value
  }
  // ----- Applicative (Either a)
  // ap(f) { return f.map(this.$value) }
  // ----- Monad (Either a)
  // chain(fn) { return fn(this.$value) }
  // inspect() { return `Right(${this.$value})` }
  // ----- Traversable (Either a)
  // sequence(of) { return this.traverse(of, identity) }
  // traverse(of, fn) { fn(this.$value).map(Either.of) }
}

// ----- Pointed (Either a)
Either.of = x => new Right(x)

const either = (f, g) => e => (e.isLeft ? f(e.$value) : g(e.$value))

module.exports = {
  Either,
  Right,
  Left,
  either
}
