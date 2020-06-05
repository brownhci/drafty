import { Abstraction, Prop } from "./Abstraction";

/**
 * Strips the getter-setter pair of functions from PropertyDescriptor so that access functions type annotations can be overiden.
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
  private _forwardingTo: any;

  /**
   * Creates an Abstraction instance.
   *
   * @param {Record<Prop, Partial<ForwardingPropertyDescriptor>} props: An object containing mapping from properties to their descriptors.
   * @param {any} setForwardingTo - A target to which access/modification operations are forwarded.
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
   *
   * @param {Partial<ForwardingPropertyDescriptor>} descriptor - An object containing partial implementation of a ForwardingPropertyDescriptor.
   * @param {ForwardingInstantiation} thisArgument - The invoking context: an ForwardingInstantiation which provides a forwarding target.
   * @return {Partial<PropertyDescriptor>} A partial implementation of a property descriptor.
   */
  private static __transformPropertyDescriptor(descriptor: Partial<ForwardingPropertyDescriptor>, thisArgument: ForwardingInstantiation): Partial<PropertyDescriptor> {
    const accessFunctions: AccessFunctions = {
      get: () => {
        return descriptor.get(thisArgument._forwardingTo, thisArgument);
      },
      set: (v: any) => {
        return descriptor.set(v, thisArgument._forwardingTo, thisArgument);
      }
    };
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
    for (const [property, descriptor] of Object.entries(props)) {
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
    Object.defineProperty(this, "_forwardingTo", {
        configurable: false,
        enumerable: false,
        value: forwardingTo,
        writable: true
    });
  }
}
