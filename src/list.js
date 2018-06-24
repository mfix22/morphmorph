class List {
  constructor(xs) {
    this._ = xs
    this.concat = x => new List(xs.concat(x))
    // ----- Functor List
    this.map = fn => new List(xs.map(fn))
    this.chain = fn => xs.map(fn)
    this.join = () => xs
  }
  // inspect() { return `List(${inspect(this._)})` }
  // ----- Traversable List
  // sequence(of) { return this.traverse(of, identity); }
  // traverse(of, fn) {
  //   return this._.reduce(
  //     (f, a) => fn(a).map(b => bs => bs.concat(b)).ap(f),
  //     of(new List([])),
  //   );
  // }
}

// ----- Pointed List
List.of = xs => new List(xs)

module.exports = {
  List
}
