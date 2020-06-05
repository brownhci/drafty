/**
 * @module
 *
 * This module provides an Abstraction class which encapsulates a set of properties.
 *
 * These properties, like regular properties defined on an object, can be accessed and modified using regular dot syntax or bracket syntax. However, their access/modification is channeled through property descriptor (more specifically, access descriptors which are getter and setter functions) {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor}, which can facilitate advanced mechanisms like proxy or aliasing.
 * Read {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get getter} and {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set setter} for inspiration.
 *
 */

import { NotImplemented } from "../../../utils/errors";
import { isSubset } from "../../../utils/Set";

/**
 * The key name of a property.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty}
 * @typedef {(string | number | symbol)} Prop
 */
export type Prop = string | number | symbol;

/**
 * These core functionalities are exposed by the Abstraction class:
 *    + @protected access to registered properties {@link Abstraction#propNames_}
 *    + @public iterate through property name, value pair {@link Abstraction#[Symbol.iterator]}
 *    + @public registering/revoking properties {@link Abstraction#registerProps__}
 *    + @public detecting whether another object (might be or might noe be an Abstraction) has same properties registered {@link Abstraction#hasSameShape__}
 *
 * These functionalities can be overriden:
 *    + @protected create a descriptor for a property given part of a complete property descriptor (usually just the getter and setter) {@link Abstraction.createDescriptor__}
 *
 * Its subclasses should follow these naming conventions:
 *    + registered properties should be intact (unmodified) and can be accessed directly
 *      @example Suppose `foo` is a registered property, it should be accessible from `this.foo`
 *    + implementation-specific variable will be preceded by one underscores if it is private, otherwise, it will be suffixed by one underscore
 *    + implementation-specific method (except methods like constructor or Symbol.iterator required by class) will be preceded by two underscores if it is private, otherwise, it will be suffixed by two underscores
 *
 * @classdesc An abstraction groups together a set of properties.
 */
export abstract class Abstraction {
  protected propNames_: Set<Prop>;

  /**
   * Creates an Abstraction instance.
   *
   * @param {Record<Prop, Partial<PropertyDescriptor>} props: An object containing mapping from properties to their descriptors.
   * @constructs Abstraction
   */
  constructor(props: Record<Prop, Partial<PropertyDescriptor>>) {
    this.registerProps__(props);
  }

  /**
   * Iterate over the registered properties as key value pairs.
   *
   * @public
   * @generator
   * @yields {<Prop, any>} Registered properties as key value pairs.
   */
  *[Symbol.iterator](): IterableIterator<[Prop, any]> {
    for (const propName of this.propNames_) {
      yield [propName, (this as any)[propName]];
    }
  }

  /**
   * Registers properties into current abstraction.
   *
   * All registered properties will have *proxied* access in that even though they are bound to the current instance and can be accessed using the dot syntax, their access and modification are regulated by {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty access descriptor}.
   *
   * You can think PropertyDescriptor as a Proxy that defines how access and modification to an attribute is eventually resolved. And the Abstraction has these props as pseudo-properties whose access/modification are proxied.
   *
   * This method can be used to
   *    + register properties to a fresh new instance
   *    + add properties to a instance with existing properties registered
   *    + remove all existing registered properties from an instance
   *    + replace all existing registered properties with new properties
   *
   * @example
   * Suppose `foo` is registered as a prop whose access descriptor is a function that always return `"foo"`. Then accessing `foo` using `this.foo` will invoke this descriptor and return `"foo"`.
   *
   * @public
   * @param {Record<Prop, Partial<PropertyDescriptor>>} props - An object contains mapping from Prop to PropertyDescriptor.
   * @param {boolean} [reset=false] - Whether existing props will be removed.
   */
  registerProps__(props: Record<Prop, Partial<PropertyDescriptor>>, reset: boolean = false) {
    if (reset && this.propNames_) {
      for (const propName of this.propNames_) {
        delete this[propName as keyof this];
      }
      this.propNames_.clear();
    }

    if (this.propNames_) {
      // merging with existing propNames
      for (const propName in props) {
        this.propNames_.add(propName);
      }
    } else {
      // initialize this.propNames_
      Object.defineProperty(this, "propNames_", {
        configurable: false,
        enumerable: false,
        value: new Set(Object.keys(props)),
        writable: false
      });
    }
    this.__setPropertyDescriptors(props);
  }

  /**
   * Checks whether current instance has same **shape** with another instance.
   *
   * Another instance has the same **shape** with current instance when it has same properties registered.
   *
   * Note:
   *    + property does not need to be registered as an own property in the other instance, rather it can be a property registered in the prototype chain.
   *
   * @public
   * @param {any} other - The other instance to compare with.
   * @return {boolean} True if two instances have same shape.
   *
   * @example
   * // @return {boolean} true
   *    Suppose current instance has `foo`, `bar` registered as properties, then it has same shape with
   *    `{foo: 'some foo value', bar: 'some bar value'}
   *    or
   *    `{foo: 'some foo value', bar: 'some bar value', 'zoo': 'some zoo value'}
   */
  hasSameShape__(other: any): boolean {
    if (other instanceof Abstraction) {
      return isSubset(this.propNames_, other.propNames_);
    } else {
      // treat other as an object
      for (const propName of this.propNames_) {
        // use the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in in} operator to look through the prototype chain
        if (!(propName in other)) {
          return false;
        }
      }
      return true;
    }
  }

  /**
   * Creates a default descriptor that
   *    + is configurable (so that it can be replaced or revoked in {@link Abstraction#registerProps__}
   *    + is enumerable
   *    + will report NotImplemented error when uses [[Get]] or [[Set]] to access the property
   *
   * @param {Prop} property - Name of property.
   * @return {PropertyDescriptor} A descriptor that can be used as argument in {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty Object.defineProperty()}.
   * @throws {NotImplemented} When getter or setter is not provided but access/modification is performed.
   */
  private static __defaultDescriptor(property: Prop): PropertyDescriptor {
    return {
        configurable: true,
        enumerable: true,
        get(): any {
          throw new NotImplemented(`Getter for ${property.toString()} has not been implemented`);
        },
        set(newValue: any) {
          throw new NotImplemented(`Setter for ${property.toString()} has not been implemented: received ${newValue}`);
        }
      };
  }

  /**
   * Create a descriptor by overriding default descriptor in {@link Abstraction.__defaultDescriptor}.
   *
   * Notes:
   *    + Passing null / undefined to descriptor will result in a clone of default descriptor
   *
   * @param {Prop} property - Name of property.
   * @param {Partial<PropertyDescriptor>} descriptor - An object containing overrides to default descriptor.
   * @return {PropertyDescriptor} A descriptor that can be used as argument in {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty Object.defineProperty()}.
   */
  protected static createDescriptor__(property: Prop, descriptor: Partial<PropertyDescriptor>): PropertyDescriptor {
    return Object.assign({}, this.__defaultDescriptor(property), descriptor);
  }

  /**
   * Registers properties on current instance.
   *
   * @param {Record<Prop, Partial<PropertyDescriptor>>} props - An object whose keys represent the names of properties to be defined or modified and whose values are objects describing those properties. Each value in props must provide a descriptor or contain overrides to default descriptor.
   */
  private __setPropertyDescriptors(props: Record<Prop, Partial<PropertyDescriptor>>) {
    for (const [property, descriptor] of Object.entries(props)) {
      Object.defineProperty(this, property, Abstraction.createDescriptor__(property, descriptor));
    }
  }
}
