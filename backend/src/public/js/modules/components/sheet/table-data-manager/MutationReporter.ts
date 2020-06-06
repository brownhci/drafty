import { CharacterDataChangeEvent, ChildListChangeEvent, PropertyChangeEvent } from "./CustomEvents";


type MutationCallback = (mutations: Array<MutationRecord>, observer: MutationObserver) => void;
type MutationReporterCallback = (mutations: Array<MutationRecord>, originalMutations: Array<MutationRecord>, observer: MutationObserver, reporter: MutationReporter) => void;

export class MutationReporter extends MutationObserver {
  static readonly emptyNodeList: NodeList = document.createElement("div").querySelectorAll("#empty-nodelist");
  readonly observing: Map<Node, MutationObserverInit> = new Map();

  constructor(mutationReporterCallback?: MutationReporterCallback) {
    super(MutationReporter.buildCallback(mutationReporterCallback));
  }

  static createMutationObserverInit(shouldObserveAttributes: boolean, shouldObserveCharacterData: boolean, shouldObserveChildList: boolean, attributeFilter: Array<string> = undefined): MutationObserverInit {
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

    return mutationObserverInit;
  }

  private static correctMutationRecord(mutationRecord: MutationRecord): MutationRecord {
    switch (mutationRecord.type) {
      case "childList":
        for (const addedNode of mutationRecord.addedNodes) {
          if (addedNode.nodeType === Node.TEXT_NODE) {
            break;
          }
        }
        for (const removedNode of mutationRecord.removedNodes) {
          if (removedNode.nodeType === Node.TEXT_NODE) {
            break;
          }
        }
        // fallthrough
      default:
        return mutationRecord;
    }

    /** {@link https://www.quirksmode.org/blog/archives/2017/11/mutation_observ.html} the childList change actually reflect a characterData change */
    return {
      type: "characterData",
      target: mutationRecord.addedNodes[0],
      addedNodes: this.emptyNodeList,
      removedNodes: this.emptyNodeList,
      previousSibling: null,
      nextSibling: null,
      attributeName: null,
      attributeNamespace: null,
      oldValue: mutationRecord.removedNodes[0].nodeValue
    };
  }

  private static buildCallback(mutationReporterCallback: MutationReporterCallback): MutationCallback {
    return function(mutations, observer) {
      const correctedMutations = mutations.map(MutationReporter.correctMutationRecord);
      mutationReporterCallback(correctedMutations, mutations, observer, this);
    };
  }

  observe(target: Node, options: MutationObserverInit) {
    this.observing.set(target, options);
    super.observe(target, options);
  }

  unobserve(target: Node) {
    if (!this.observing.delete(target)) {
      // nothing needed ton be done if the target is not being observed
      return;
    }

    super.disconnect();
    this.reconnect();
  }

  disconnect() {
    this.observing.clear();
    super.disconnect();
  }

  reconnect() {
    for (const [node, options] of this.observing) {
      super.observe(node, options);
    }
  }

  reobserveToExecute(callback: () => void, target: Node, options?: MutationObserverInit) {
    if (!options) {
      options = this.observing.get(target);
    }

    this.unobserve(target);
    callback();
    this.observe(target, options);
  }

  reconnectToExecute(callback: () => void) {
    super.disconnect();
    callback();
    this.reconnect();
  }

  report(mutation: MutationRecord) {
    let event: Event;
    switch (mutation.type) {
      case "attributes":
        event = new PropertyChangeEvent({
          attributeName: mutation.attributeName,
          oldAttributeValue: mutation.oldValue
        });
        break;
      case "characterData":
        event = new CharacterDataChangeEvent({
          oldValue: mutation.oldValue,
          newValue: mutation.target.nodeValue
        });
        break;
      case "childList":
        event = new ChildListChangeEvent({
          addedNodes: mutation.addedNodes,
          removedNodes: mutation.removedNodes,
          previousSibling: mutation.previousSibling,
          nextSibling: mutation.nextSibling
        });
        break;
    }
    mutation.target.dispatchEvent(event);
  }
}
