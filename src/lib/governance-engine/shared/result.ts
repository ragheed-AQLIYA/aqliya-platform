export class Ok<T> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): this is Err<never> {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  map<U>(fn: (value: T) => U): Ok<U> {
    return new Ok(fn(this.value));
  }

  mapErr<E>(_fn: (error: E) => E): Ok<T> {
    return this;
  }
}

export class Err<E> {
  readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  isOk(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  unwrap(): never {
    throw this.error;
  }

  map<U>(_fn: (value: never) => U): Err<E> {
    return this;
  }

  mapErr<F>(fn: (error: E) => F): Err<F> {
    return new Err(fn(this.error));
  }
}

export type Result<T, E = Error> = Ok<T> | Err<E>;
