/**
 * @module
 *
 * This module provide instantiations of Abstraction class:
 *
 * 		+ ForwardingInstantiation: allows access/modification to registered properties to be resolved with a registered target `forwardingTo_`. More, specifically, these operations are regulated by a ForwardingPropertyDescriptor, a descriptor which could contain callbacks that receives additional arguments including `forwardingTo_` and the Instantiation instance.
 * 		+ DOMForwardingInstantiation: extends ForwardingInstantiation with default descriptor that treat registered properties as a DOM attribute or JS property of the forwarding target.
 */

import { Abstraction, Prop } from "./Abstraction";
import { getProperty, setProperty } from "../../../dom/properties";

/**
 * Strips the getter-setter pair of functions from PropertyDescriptor so that access functions type annotations can be overriden.
 *
 * @see {@link https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_es5_d_.propertydescriptor.html PropertyDescriptor} {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty}
 */
type DataDescriptor = Omit<PropertyDescriptor, "get" | "set">;

/**
 * Extracts the getter-setter pair of functions form PropertyDescriptor.
 *
 *    PropertyDescriptor = AccessFunctions + DataDescriptor
 */
type AccessFunctions = Pick<PropertyDescriptor, "get" | "set">;

/**
 * Adds the access functions back into the {@link DataDescriptor} but with different annotations: the argument list will end with `forwardingTo` which contains the forwarding target and `thisArgument` which contains the `ForwardingInstantiation` instance.
 */
export interface ForwardingPropertyDescriptor extends DataDescriptor {
  get: (forwardingTo: any, thisArgument: ForwardingInstantiation) => any;
  set: (v: any, forwardingTo: any, thisArgument: ForwardingInstantiation) => void;
}

/**
 * A ForwardingInstantiation forwards access/modification operations to an underlying object.
 *
 * These core functionalities are exposed by the ForwardingInstantiation class:
 *
 *    + @public {@link ForwardingInstantiation#setForwardingTo__} change the forwarding target
 *    + @public {@link ForwardingInstantiation#registerProps__} registering/revoking properties
 *
 * @augments Abstraction
 */
export class ForwardingInstantiation extends Abstraction {
  /** The underlying target to which access and modification to registered properties will be forwarded */
  protected forwardingTo_: any;

  /**
   * Creates a ForwardingInstantiation instance.
   *
   * @public
   * @param {Record<Prop, Partial<ForwardingPropertyDescriptor>} props: An object containing mapping from properties to their descriptors.
   * @param {any} forwardingTo - A target to which access/modification operations are forwarded.
   * @constructs ForwardingInstantiation
   *
   * @example
   *    If you want to create a ForwardingInstantiation and set forwarding target/add properties later, you can invoke constructor like: `new ForwardingInstantiation({}, null);`
   */
  constructor(propsToForward: Record<Prop, Partial<ForwardingPropertyDescriptor>>, forwardingTo: any) {
    super({});
    this.setForwardingTo__(forwardingTo);
    this.registerProps__(propsToForward, false);
  }

  /**
   * Transform a ForwardingPropertyDescriptor into a PropertyDescriptor. More specifically, it creates wrapper getter and setter that invoke the ForwardingPropertyDescriptor's getter and setter by supplying additional arguments through scoping.
	 * @example
	 * 		To transform into an empty property descriptor, simply pass `{}` as `descriptor`.
   *
   * @param {Partial<ForwardingPropertyDescriptor>} descriptor - An object containing partial implementation of a ForwardingPropertyDescriptor.
   * @param {ForwardingInstantiation} thisArgument - The invoking context: an ForwardingInstantiation which provides a forwarding target.
   * @return {Partial<PropertyDescriptor>} A partial implementation of a property descriptor.
   */
  private static __transformPropertyDescriptor(descriptor: Partial<ForwardingPropertyDescriptor>, thisArgument: ForwardingInstantiation): Partial<PropertyDescriptor> {
    const accessFunctions: AccessFunctions = { };
		if ("get" in descriptor) {
      accessFunctions.get = () => {
        return descriptor.get(thisArgument.forwardingTo_, thisArgument);
      };
		}
		if ("set" in descriptor) {
			accessFunctions.set = (v: any) => {
        return descriptor.set(v, thisArgument.forwardingTo_, thisArgument);
			};
		}
    return Object.assign({}, descriptor, accessFunctions);
  }

  /**
   * Transforms all ForwardingPropertyDescriptor into PropertyDescriptor and remaps them under same properties.
   *
   * @see {@link ForwardingInstantiation.__transformPropertyDescriptor}
   * @param {Record<Prop, Partial<ForwardingPropertyDescriptor>>} props - A mapping from property name to property descriptor (ForwardingPropertyDescriptor).
   * @param {ForwardingInstantiation} thisArgument - The invoking context: an ForwardingInstantiation which provides a forwarding target.
   * @return {Record<Prop, Partial<PropertyDescriptor>>} A mapping from property name to property descriptor (PropertyDescriptor)
   */
  private static __transformPropertyDescriptors(props: Record<Prop, Partial<ForwardingPropertyDescriptor>>, thisArgument: ForwardingInstantiation): Record<Prop, Partial<PropertyDescriptor>> {
    const _props: Record<Prop, Partial<PropertyDescriptor>> = {};
    for (const property in props) {
			const descriptor = props[property];
      _props[property] = this.__transformPropertyDescriptor(descriptor, thisArgument);
    }
    return _props;
  }

  /**
   * @override
   * @public
   * @param {Record<Prop, Partial<ForwardingInstantiation>>} props - An object contains mapping from Prop to ForwardingPropertyDescriptor.
   * @param {boolean} [reset=false] - Whether existing props will be removed.
   * @description __override__ The overriding function allows access functions in ForwardingPropertyDescriptor to receive two additional arguments: `forwardingTo` and `thisArgument`.
   */
  registerProps__(props: Record<Prop, Partial<ForwardingPropertyDescriptor>>, reset: boolean = false) {
    /** props will be registered in {@link ./Abstraction.Abstraction} */
    super.registerProps__(ForwardingInstantiation.__transformPropertyDescriptors(props, this), reset);
  }

  /**
   * Set a target to which access and modification on registered properties will be forwarded.
   *
   * In essence, the current instance serves as a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy Proxy} which forwards all operations involving the registered properties to the underlying target.
   *
   * @example
   *    Suppose the registered property is `id` and the `forwardingTo` is an object. Then `this.id` is equivalent to `forwardingTo.id`.
   *
   * @public
   * @param {any} forwardingTo - A target to forward access / modification on regiserted properties.
   */
  setForwardingTo__(forwardingTo: any) {
    Object.defineProperty(this, "forwardingTo_", {
        configurable: false,
        enumerable: false,
        value: forwardingTo,
        writable: true
    });
  }
}


/**
 * A DOMForwardingInstantiation forwards access/modification operations to an underlying DOM element.
 *
 * The property will be resolved in the following order:
 *
 * 		1. a HTML attribute like `class` for a `<div class="active></div>`
 * 		2. a JS property like `classList`, `textContent`
 * 		3. a custom property
 *
 * Some caveats:
 *
 * 		+ The property has to be a string.
 * 		+ If the element does not have the DOM property {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute}, the operation will not stop, rather it will try to resolve the property as a JS property then a custom property. But suppose this DOM attribute comes into existence because of user action or script execution, next operation will resolve this property as a DOM attribute even if a same-named JS property or custom property exists. The opposite is also true where a DOM attribute no longer exists. To avoid such situations, you are recommended to
 * 			+ predefine the DOM attribute,
 * 				@example `element.class = ""`
 * 			+ use the JS property equivalent
 * 				@example `class` can be substituted with `className`
 * 		+ If you need to define a custom property, you should avoid clashing with potential HTML attributes and JS properties
 *
 * @augments ForwardingInstantiation
 */
export class DOMForwardingInstantiation extends ForwardingInstantiation {
  /**
   * Exposes `this.forwardingTo_`
   * @public
   */
  get element_(): HTMLElement {
    return this.forwardingTo_;
  }

  /**
   * Equivalent with `this.setForwardingTo__`
   * @public
   */
  set element_(element: HTMLElement) {
    this.setForwardingTo__(element);
  }

  /**
   * Creates a default access descriptor that
	 *
	 * 		+ for a [[GET]] operation, attempts to query same-named property from the HTML element that is the forward target {@link getProperty}
	 * 		+ for a [[SET]] operation, attempts to modify same-named property from the HTML element that is the forward target {@link setProperty}
   *
   * @param {string} property - Name of property.
   * @return {Partial<PropertyDescriptor>} A default partial implementation of ForwardingPropertyDescriptor that provides a getter and setter pair.
   */
  private static __defaultForwardingDescriptor(property: string): Partial<ForwardingPropertyDescriptor> {
    return {
        get(forwardingTo: HTMLElement): any {
					return getProperty(forwardingTo, property);
        },
        set(newValue: any, forwardingTo: HTMLElement) {
					setProperty(forwardingTo, property, newValue);
        }
      };
  }

	/**
	 * For each property, supplies default access descriptor if none has been provided.
	 *
	 * More specifically, it iterates through each property, descriptor pair and replace falsy descriptor value with default descriptor.
	 *
	 * @see {@link DOMForwardingInstantiation.__defaultForwardingDescriptor}
	 * @param {Record<string, Partial<ForwardingPropertyDescriptor>>} props - An object containing mapping from properties to their descriptors.
	 * @return An object containing mapping from properties to their descriptors where default descriptor has replaced falsy descriptor value.
	 */
	private static __fillDefaultDescriptor(props: Record<string, Partial<ForwardingPropertyDescriptor>>): Record<string, Partial<ForwardingPropertyDescriptor>> {
    const _props: Record<Prop, Partial<ForwardingPropertyDescriptor>> = {};
    for (const property in props) {
			const descriptor = props[property];
			_props[property] = descriptor ? descriptor : this.__defaultForwardingDescriptor(property);
    }
    return _props;
	}

  /**
   * @override
   * @public
   * @param {Record<string, Partial<ForwardingInstantiation>>} props - An object contains mapping from string to ForwardingPropertyDescriptor.
   * @param {boolean} [reset=false] - Whether existing props will be removed.
   * @description __override__ The overriding function will replace falsy descriptor values in `props` with default property descriptor {@link DOMForwardingInstantiation.__fillDefaultDescriptor}.
   */
  registerProps__(props: Record<string, Partial<ForwardingPropertyDescriptor>>, reset: boolean = false) {
    super.registerProps__(DOMForwardingInstantiation.__fillDefaultDescriptor(props), reset);
  }
}
