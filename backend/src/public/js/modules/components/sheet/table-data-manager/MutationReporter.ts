/**
 * @module
 *
 * This modules provides a MutationReporter class that extends MutationObserver which is capable both observing DOM mutation and reporting mutation as custom events.
 */

import { CharacterDataChangeEvent, ChildListChangeEvent, PropertyChangeEvent } from "./CustomEvents";


/**
 * Callback type for MutationObserver. {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver}
 *
 * @param {Array<MutationRecord>} mutations - An array of MutationRecord objects describing each change that occurred
 * @param {MutationObserver} observer - The MutationObserver which invoked the callback
 */
type MutationCallback = (mutations: Array<MutationRecord>, observer: MutationObserver) => void;

/**
 * Callback type for MutationReporter, which is invoked by the MutationObserver callback {@link MutationCallback}
 *
 * @param {Array<MutationRecord>} mutations - An array of MutationRecord objects describing each change that occurred. This array contains the corrected MutationRecord objects, like the CharacterData mutation contained in a ChildList mutation. {@link MutationReporter.correctMutationRecord}
 * @param {MutationObserver} observer - The MutationObserver which invoked the callback
 * @param {Array<MutationRecord>} originalMutations - The unmodified original array of MutationRecord objects.
 * @param {MutationReporter} reporter - The MutationReporter instance by which the mutations are observed. Provides a {@link MutationReporter#report} function to report mutation-related events.
 */
export type MutationReporterCallback = (mutations: Array<MutationRecord>, observer: MutationObserver, originalMutations: Array<MutationRecord>, reporter: MutationReporter) => void;


/**
 * MutationObserver provides the ability to watch for changes being made to the DOM tree while a MutationReporter provides these additional abilities:
 *
 *    + Receives additional arguments in registered callback.
 *    + Creates a MutationObserverInit based on which type(s) of mutations should be observed.
 *    + Identifies a CharacterData mutation from a ChildList mutation.
 *    + More fine-grained control in observing, unobserving one or multiple targets.
 *
 * @augments MutationObserver
 */
export class MutationReporter extends MutationObserver {
  /** NodeList equivalent of empty array */
  private static readonly emptyNodeList: NodeList = document.createElement("div").querySelectorAll("#empty-nodelist");
  /** A mapping from observed targets to their observing configuration (MutationObserverInit) */
  readonly observing: Map<Node, MutationObserverInit> = new Map();
  /**
   * The callback to be invoked when a mutation is observed
   *
   * @callback MutationReporter.callback
   * @param {Array<MutationRecord>} mutations - An array of MutationRecord objects describing each change that occurred
   * @param {MutationObserver} observer - The MutationObserver which invoked the callback
   */
  private callback: MutationCallback;

  /**
   * Creates a MutationReporter instance.
   *
   * Note:
   *
   *    + if a callback isn't provided, the default callback will call the {@link MutationReporte#report} method.
   *
   * @constructs MutationReporter
   */
  constructor(mutationReporterCallback?: MutationReporterCallback) {
    super(MutationReporter.buildCallback(mutationReporterCallback, () => this));
  }

  /**
   * Configures the MutationObserverInit dictionary used in {@link MutationReporter#observe} method.
   *
   * @param {boolean} shouldObserveAttributes - Set to true to watch for changes to the value of attributes on the node or nodes being monitored. Setting this to true also sets `attributeOldValue` to true which records the previous value of any attribute that changes when monitoring the node or nodes for attribute changes.
   * @param {boolean} shouldObserveCharacterData - Set to true to monitor the specified target node or subtree for changes to the character data contained within the node or nodes. Setting this to true also sets `characterDataOldValue ` to true which records the previous value of a node's text whenever the text changes on nodes being monitored.
   * @param {boolean} shouldObserveChildList - Set to true to monitor the target node (and, if `shouldObserveSubtree` is true, its descendants) for the addition of new child nodes or removal of existing child nodes.
   * @param {boolean} shouldObserveSubtree - Set to true to extend monitoring to the entire subtree of nodes rooted at target. All of the other MutationObserverInit properties are then extended to all of the nodes in the subtree instead of applying solely to the target node.
   * @param {Array<string>} attributeFilter - An array of specific attribute names to be monitored. If this property isn't included, changes to all attributes cause mutation notifications.
   * @return {MutationObserverInit} A MutationObserverInit dictionary describes the configuration of a mutation observer.
   */
  static createMutationObserverInit(shouldObserveAttributes: boolean, shouldObserveCharacterData: boolean, shouldObserveChildList: boolean, shouldObserveSubtree: boolean = false, attributeFilter: Array<string> = undefined): MutationObserverInit {
    const mutationObserverInit: MutationObserverInit = {};

    if (shouldObserveAttributes) {
      mutationObserverInit.attributes = true;
      mutationObserverInit.attributeOldValue = true;
    }

    if (attributeFilter) {
      mutationObserverInit.attributeFilter = attributeFilter;
    }

    if (shouldObserveCharacterData) {
      mutationObserverInit.characterData = true;
      mutationObserverInit.characterDataOldValue = true;
      /** {@link https://www.quirksmode.org/blog/archives/2017/11/mutation_observ.html} set childList to true to detect text change due to replacement of text node from innerText, innerHTML, textContent */
      mutationObserverInit.childList = true;
      mutationObserverInit.subtree = true;
    }

    if (shouldObserveChildList) {
      mutationObserverInit.childList = true;
    }

    if (shouldObserveSubtree) {
      mutationObserverInit.subtree = true;
    }

    return mutationObserverInit;
  }

  /**
   * Generates the CharacterData mutation record from a ChildList mutation record.
   *
   * The key of this generation is to supply the `oldValue`: text content of the target before the child list mutation. Therefore, the procedure consists of two major steps:
   *
   *    1. gets the text content of all child nodes before the mutation.
   *        1. from the `mutation.previousSibling`, prepend all nodes that are not newly-added (not in `mutation.addedNodes`)
   *        2. append all removed nodes `mutation.removedNodes`
   *        3. from the `mutation.nextSibling`, append all nodes that are not newly-added (not in `mutation.addedNodes`)
   *    2. creates the aggregate text content by joining these text contents.
   *
   * The first major step relies on an important assumption:
   *
   *    removed nodes (added nodes) are consequtive
   *
   * In other words, for one mutation record, there will not be multiple nodes added / removed with nodes in between.
   *
   * @param {MutationRecord} mutationRecord - A ChildList mutation that involves a CharacterData mutation.
   * @returns {MutationRecord} A generated record for the CharacterData mutation.
   */
  private static childListToCharacterData(mutationRecord: MutationRecord): MutationRecord {
    const addedNodes: Set<Node> = new Set();
    for (const node of mutationRecord.addedNodes) {
      addedNodes.add(node);
    }

    let previousSibling = mutationRecord.previousSibling;
    const nodeTextContents: Array<string> = [];
    while (previousSibling) {
      if (!addedNodes.has(previousSibling)) {
        nodeTextContents.push(previousSibling.textContent);
      }
      previousSibling = previousSibling.previousSibling;
    }
    nodeTextContents.reverse();

    for (const removedNode of mutationRecord.removedNodes) {
      nodeTextContents.push(removedNode.textContent);
    }

    let nextSibling = mutationRecord.nextSibling;
    while (nextSibling) {
      if (!addedNodes.has(nextSibling)) {
        nodeTextContents.push(nextSibling.textContent);
      }
      nextSibling = nextSibling.nextSibling;
    }

    const oldValue: string = nodeTextContents.join("");

    /** {@link https://www.quirksmode.org/blog/archives/2017/11/mutation_observ.html} the childList change actually reflect a characterData change */
    return {
      type: "characterData",
      target: mutationRecord.target,
      addedNodes: this.emptyNodeList,
      removedNodes: this.emptyNodeList,
      previousSibling: null,
      nextSibling: null,
      attributeName: null,
      attributeNamespace: null,
      oldValue
    };
  }

  /**
   * Mutation Record {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord} emitted by MutationObserver might not best represent its type in the case of CharacterData mutation within ChildList mutation.
   *
   * @example A target's child list might be modified: a Text Node is replaced by another Text Node. In such case, besides child list, this target's text content is also modified.
   *
   * This function tries to identify such implicit CharacterData mutation from ChildList mutation.
   *
   * @param {MutationRecord} mutationRecord - A mutation record corresponds to a mutation.
   * @return {Array<MutationRecord>} An one-element array if the record is not corrected, a pair [CharacterData Mutation, ChildList Mutation] if the record is corrected.
   */
  private static correctMutationRecord(mutationRecord: MutationRecord): Array<MutationRecord> {
    switch (mutationRecord.type) {
      case "childList":
        for (const addedNode of mutationRecord.addedNodes) {
          if (addedNode.nodeType === Node.TEXT_NODE) {
            return [MutationReporter.childListToCharacterData(mutationRecord), mutationRecord];
          }
        }
        for (const removedNode of mutationRecord.removedNodes) {
          if (removedNode.nodeType === Node.TEXT_NODE) {
            return [MutationReporter.childListToCharacterData(mutationRecord), mutationRecord];
          }
        }
        // fallthrough
      default:
        return [mutationRecord];
    }
  }

  /**
   * A function to build a MutationCallback that invokes the provided MutationReporterCallback. More specifically, this function make sure the MutationCallback which is invoked by MutationObserver on desired mutations calls the MutationReporterCallback with additional arguments.
   *
   * @param {MutationReporterCallback} mutationReporterCallback - A callback that expects additional arguments including the corrected mutations and a MutationReporter instance.
   * @param {() => MutationReporter} thisWrapper - A function that returns a MutationReporter instance.
   * @return {MutationCallback} A callback to be used to initialize the MutationObserver.
   */
  private static buildCallback(mutationReporterCallback: MutationReporterCallback, thisWrapper: () => MutationReporter): MutationCallback {
    let callback: MutationCallback;

    if (mutationReporterCallback) {
      // invokes provided callback
      callback = (mutations, observer) => {
        const correctedMutations: Array<MutationRecord> = [];
        for (const mutation of mutations) {
          correctedMutations.push(...MutationReporter.correctMutationRecord(mutation));
        }
        mutationReporterCallback(correctedMutations, observer, mutations, thisWrapper());
      };
    } else {
      /** default callback: invoke {@link MutationReporter#report} */
      callback = (mutations) => thisWrapper().report(mutations.reduce((accumulator, mutation) => accumulator.concat(MutationReporter.correctMutationRecord(mutation)), []));
    }

    return thisWrapper().callback = callback;
  }

  /**
   * Configures the MutationObserver callback to begin receiving notifications of changes to the DOM that match the given options.
   *
   * The difference from {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe} is the observing target and observing options will be stored in `this.observing`.
   */
  observe(target: Node, options: MutationObserverInit) {
    this.observing.set(target, options);
    super.observe(target, options);
  }

  /**
   * Tells the observer to stop watching for mutations.
   *
   * The difference from {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/disconnect} is the option to clear records in `this.observing`.
   *
   * @param {boolean} [clearMemory = true] - Whether memory of previous observed targets should be cleared.
   */
  disconnect(clearMemory: boolean = true) {
    if (clearMemory) {
      this.observing.clear();
    }
    super.disconnect();
  }

  /**
   * Tells the observer to stop watching for mutations for specified node.
   *
   * Note:
   *
   *    + If a mutation happens in the very short interval when the observer is restarted to observe the remaining targets, it might be dropped.
   *
   * @param {Node} target - The node to stop watching for mutations. If the node is not observed, nothing will happen. Otherwise, it will no longer be observed.
   */
  unobserve(target: Node) {
    if (!this.observing.delete(target)) {
      // nothing needed to be done if the target is not being observed
      return;
    }

    const mutations = super.takeRecords();
    this.disconnect(false);
    this.reconnect();
    this.callback(mutations, this);
  }

  /**
   * Tells the observer to start watching for target mutations according to options for every pair of target and options in `this.observing`.
   */
  reconnect() {
    for (const [node, options] of this.observing) {
      super.observe(node, options);
    }
  }

  /**
   * Tells the observer to:
   *
   *    + stop watching for all targets
   *    + executes a callback
   *    + resume watching for all existing target
   *
   * Note:
   *
   *    + If a mutation happens in the very short interval when the observer is restarteds, it might be dropped.
   *
   * @param {() => void} callback - A callback to be executed after the observer has disconnected and before the observer is reconnected.
   * @example If needs to reobserve with different options, set the corresponding options in `this.observing` before calling this function.
   */
  reconnectToExecute(callback: () => void) {
    const mutations = super.takeRecords();
    this.disconnect(false);
    callback();
    this.reconnect();
    this.callback(mutations, this);
  }

  /**
   * For every mutation, dispatches a corresponding event {@link ./CustomEvents} at mutation's target.
   *
   * @param {Array<MutationRecord>} mutations - An array of MutationRecord objects describing each change that occurred.
   * @fires PropertyChangeEvent#propertyChange for attribute mutation
   * @fires CharacterDataChangeEvent#characterDataChange for text content mutation
   * @fires ChildListChangeEvent#childListChange for children mutation
   */
  report(mutations: Array<MutationRecord>) {
    for (const mutation of mutations) {
      let event: Event;
      const target: Node = mutation.target;
      switch (mutation.type) {
        case "attributes":
          event = new PropertyChangeEvent({
            target,
            attributeName: mutation.attributeName,
           oldAttributeValue: mutation.oldValue
          });
          break;
        case "characterData":
          event = new CharacterDataChangeEvent({
            target,
            oldValue: mutation.oldValue,
            newValue: mutation.target.nodeValue
          });
          break;
        case "childList":
          event = new ChildListChangeEvent({
            target,
            addedNodes: mutation.addedNodes,
            removedNodes: mutation.removedNodes,
            previousSibling: mutation.previousSibling,
            nextSibling: mutation.nextSibling
          });
          break;
      }
      target.dispatchEvent(event);
    }
  }
}
