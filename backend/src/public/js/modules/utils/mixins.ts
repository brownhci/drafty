/**
 * @module This modules contains Typescript's helper function for applying mixins {@link https://www.typescriptlang.org/docs/handbook/mixins.html}
 *
 * For other possible implementation of mixin, like using a function to return the wrapper class: @see {@link https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/}
 */

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
      );
    });
  });
}

export type Constructor<T = {}> = new (...args: any[]) => T;
