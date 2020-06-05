import { Abstraction, Prop } from "./Abstraction";


export type Translator = (key: Prop) => Prop;
type TranslationTable = Map<Prop, Prop>;
interface TranslationTablePair {
  forward: TranslationTable;
  backward: TranslationTable;
}

export class ForwardingInstantiation extends Abstraction {
  private forwardingTo: any;

  private translationTablePair: TranslationTablePair;

  constructor(properties: Record<Prop, Translator>, globalTranslator: Translator = undefined, forwardingTo: any) {
    /** superProps will be registered in superclass */
    const superProps: Record<Prop, Partial<PropertyDescriptor>> = {};

    for (const propertyName in properties) {
      superProps[propertyName] = {
        get: () => {
          return this.forwardingTo[this.__translateForward(propertyName)];
        },
        set: (newValue: any) => {
          this.forwardingTo[this.__translateForward(propertyName)] = newValue;
        }
      };
    }

    super(superProps);

    this.setForwardingTo(forwardingTo);

    Object.defineProperty(this, "translationTablePair", {
        configurable: false,
        enumerable: false,
        value: ForwardingInstantiation.__buildTranslationTable(properties, globalTranslator),
        writable: false
    });
  }

  protected setForwardingTo(forwardingTo: any) {
    Object.defineProperty(this, "forwardingTo", {
        configurable: false,
        enumerable: false,
        value: forwardingTo,
        writable: true
    });
  }

  private __translateForward(propertyName: Prop): Prop {
    return this.translationTablePair.forward.get(propertyName);
  }

  private __translateBackward(propertyName: Prop): Prop {
    return this.translationTablePair.backward.get(propertyName);
  }

  private static __buildTranslationTable(properties: Record<Prop, Translator>, globalTranslator: Translator = undefined): TranslationTablePair {
    const forwardTranslationTable = new Map();
    const backwardTranslationTable = new Map();

    for (const [property, translator] of Object.entries(properties)) {
      let translatedProperty: Prop;
      if (translator) {
        translatedProperty = translator(property);
      } else if (globalTranslator) {
        translatedProperty = globalTranslator(property);
      } else {
        translatedProperty = property;
      }

      forwardTranslationTable.set(property, translatedProperty);
      backwardTranslationTable.set(translatedProperty, property);
    }

    return {
      forward: forwardTranslationTable,
      backward: backwardTranslationTable
    };
  }
}


export class ProxyInstantiation extends ForwardingInstantiation {

  constructor(properties: Record<string, any>) {
    /** superProps will be registered in superclass */
    const superProps: Record<string, Translator> = {};
    /** props will be registered in this class */
    const props: Record<string, PropertyDescriptor> = {};

    for (const propertyName in properties) {
      superProps[propertyName] = undefined;

      props[ProxyInstantiation.__concretizeKey(propertyName)] = {
        configurable: false,
        enumerable: false,
        value: properties[propertyName],
        writable: true
      };
    }

    super(superProps, ProxyInstantiation.__concretizeKey, undefined);
    this.setForwardingTo(this);
    Object.defineProperties(this, props);
  }

  /**
   * For each property passed to constructor, a pair of getter and setter is used to create a pseudo-property. The actual **concrete** property will be registered under the transformed key name. In other words, this pair of getter and setter becomes a proxy to access and modify the **concrete** property.
   *
   * @example
   *    Suppose `foo` is passed as a property, both methods below can access and modify the property:
   *      + the **concrete** property can be accessed and modified via `this[this.constructor.__concretizeKey('foo')]`
   *      + `this.foo` or `this['foo']` invokes the getter or setter of the pseudo-property, which is proxied to access or modify the **concrete** property
   *
   * @private
   * @static
   * @param {string} pseudoKey - The key under which getter and setter for this property are registered.
   * @return {string} The real **concrete** under which the property value is stored as a class field.
   */
  private static __concretizeKey(pseudoKey: string): string {
    return `$${pseudoKey}`;
  }

  /**
   * The reverse operation of {@see __concretizeKey}. Converting from a **concrete** property to the **virtual** property (used by getter and setter)
   *
   * @private
   * @static
   * @param {string} concreteKey - The real **concrete** under which the property value is stored as a class field.
   *
   * @return {string} The pseudo key under which getter and setter for this property are registered.
   */
  private static __virtualizeKey(concreteKey: string): string {
    return concreteKey.slice(1);
  }
}

export { Prop };
