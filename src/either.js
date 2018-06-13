class Either {
  constructor(x) {
    this._ = x
  }
}

class Left extends Either {
  constructor(x) {
    super(x)
    this.isLeft = true
    this.isRight = false
    // ----- Functor (Either a)
    this.map = () => this
    this.join = this.map
    // ----- Monad (Either a)
    this.chain = () => this
  }
  // ----- Applicative (Either a)
  // ap() { return this }
  // inspect() { return `Left(${this._})` }
  // ----- Traversable (Either a)
  // sequence(of) { return of(this) }
  // traverse(of, fn) { return of(this) }
}

class Right extends Either {
  constructor(x) {
    super(x)
    this._ = x
    this.isLeft = false
    this.isRight = true
    // ----- Functor (Either a)
    this.map = fn => Either.of(fn(x))
    this.join = () => x
    // ----- Monad (Either a)
    this.chain = fn => fn(x)
  }
  // ----- Applicative (Either a)
  // ap(f) { return f.map(this._) }
  // inspect() { return `Right(${this._})` }
  // ----- Traversable (Either a)
  // sequence(of) { return this.traverse(of, identity) }
  // traverse(of, fn) { fn(this._).map(Either.of) }
}

// ----- Pointed (Either a)
Either.of = x => new Right(x)

const either = (f, g) => e => (e.isLeft ? f(e._) : g(e._))
const left = x => new Left(x)

module.exports = {
  Either,
  either,
  left
}
