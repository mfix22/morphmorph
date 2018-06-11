class Either {
  constructor(x) {
    this.$value = x
  }
}

class Left extends Either {
  constructor(x) {
    super(x)
    this.isLeft = true
    this.isRight = false
    // ----- Functor (Either a)
    this.map = () => this
    this.join = () => this
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
  constructor(x) {
    super(x)
    this.$value = x
    this.isLeft = false
    this.isRight = true
    // ----- Functor (Either a)
    this.map = fn => Either.of(fn(x))
    this.join = () => this.$value
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
