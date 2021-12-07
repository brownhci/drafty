/**
 * @module
 *
 * This modules defines a set of custom events {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent} and their additional `detail`.
 *
 * These events can be emitted from the {@link MutationReporter/MutationReporter#report} method when an observed target receives corresponding type of mutations.
 *
 *
 * | Mutation (Event Name) | Event                    | Event Detail                   | Triggering Example       |
 * | --------------------- | ------------------------ | ------------------------------ | ------------------------ |
 * | propertyChange        | PropertyChangeEvent      | PropertyChangeEventDetail      | el.id = "<newID>"        |
 * | characterDataChange   | CharacterDataChangeEvent | CharacterDataChangeEventDetail | el.textContent = "..."   |
 * | childListChange       | ChildListChangeEvent     | ChildListChangeEventDetail     | el.appendChild(newChild) |
 *
 * Similar as DOM events, these custom events
 *
 *    + can be listened by event listeners {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener}
 *    + have propagation phase, target phase, and bubbling phase {@link https://www.w3.org/TR/DOM-Level-3-Events/#event-flow}
 *
 * Different from DOM events, these custom events
 *
 *    + have a `detail` field which contains data describing the triggering mutation.
 */


/**
 * Interface describing the `detail` field of a {@link PropertyChangeEvent}
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord}
 */
export interface PropertyChangeEventDetail {
  /** the element whose attribute changed */
  target: Node;
  /** the local name of the changed attribute */
  attributeName: string;
  /** the value of the changed attribute before the change, `null` if current mutation initializes the attribute */
  oldAttributeValue: string;
}

/**
 * A custom event corresponds to a attribute mutation.
 *
 * Note:
 *
 *   + Attribute is associated with the element rather than the JS variable.
 *     @example `class` is a valid attribute while `classList` is not
 *   + An attribute mutation might be trigger from
 *     + user's interaction with the HTML page
 *     + direct manipulation of attribute through JS {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute}
 *     + manipulation of related JS property
 *       @example adding a class through `element.classList.add` will trigger an attribute mutation on the `class` attribute
 *
 * @event PropertyChangeEvent#propertyChange
 * @augments CustomEvent
 */
export class PropertyChangeEvent extends CustomEvent<PropertyChangeEventDetail> {
  static readonly typeArg: string = 'propertyChange';

  constructor(detail: PropertyChangeEventDetail = null) {
    super(PropertyChangeEvent.typeArg, {
      detail,
      bubbles: true,
      cancelable: true
    });
  }
}


/**
 * Interface describing the `detail` field of a {@link CharacterDataChangeEvent}
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord}
 */
export interface CharacterDataChangeEventDetail {
  /**
   * the element whose text content changed, either a Text Node or a Element Node whose text content is changed.
   */
  target: Node;
  /** the text content of the involved element before the mutation */
  oldValue: string;
  /** the text content of the involved element after the mutation */
  newValue: string;
}

/**
 * A custom event corresponds to a text content mutation.
 *
 * Note:
 *
 *   + A text content mutation might be triggered by
 *     + addition of text node
 *       @example `appendChild`...
 *     + removal of text node
 *       @example `removeChild`...
 *     + replacement of text node
 *       @example `replaceChild`, `innerHTML`, `innerText`, `textContent`...
 *     + modification of text node
 *       @example `nodeValue`, user inputting...
 *   + A text content mutation might happen together with a childList mutation, for example, as the result of `innerHTML`. The criterion for whether a childList mutation qualifies as a text content mutation is whether there is any text node added or removed.
 *
 * @event CharacterDataChangeEvent#characterDataChange
 * @augments CustomEvent
 */
export class CharacterDataChangeEvent extends CustomEvent<CharacterDataChangeEventDetail> {
  static readonly typeArg: string = 'characterDataChange';

  constructor(detail: CharacterDataChangeEventDetail = null) {
    super(CharacterDataChangeEvent.typeArg, {
      detail,
      bubbles: true,
      cancelable: true
    });
  }
}


/**
 * Interface describing the `detail` field of a {@link ChildListChangeEvent}
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord}
 */
export interface ChildListChangeEventDetail {
  /** The node whose children changed */
  target: Node;
  /** The nodes added. Will be an empty NodeList if no nodes were added. */
  addedNodes: NodeList;
  /** The nodes removed. Will be an empty NodeList if no nodes were removed. */
  removedNodes: NodeList;
  /** The previous sibling of the added or removed nodes, or null. */
  previousSibling: Node;
  /** The next sibling of the added or removed nodes, or null. */
  nextSibling: Node;
}

/**
 * A custom event corresponds to a child list mutation.
 *
 * @event ChildListChangeEvent#childListChange
 * @augments CustomEvent
 */
export class ChildListChangeEvent extends CustomEvent<ChildListChangeEventDetail> {
  static readonly typeArg: string = 'childListChange';

  constructor(detail: ChildListChangeEventDetail = null) {
    super(ChildListChangeEvent.typeArg, {
      detail,
      bubbles: true,
      cancelable: true
    });
  }
}
