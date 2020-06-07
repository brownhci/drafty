import { CharacterDataChangeEvent, ChildListChangeEvent, PropertyChangeEvent } from "./CustomEvents";


type MutationCallback = (mutations: Array<MutationRecord>, observer: MutationObserver) => void;
type MutationReporterCallback = (mutations: Array<MutationRecord>, originalMutations: Array<MutationRecord>, observer: MutationObserver, reporter: MutationReporter) => void;

export class MutationReporter extends MutationObserver {
  static readonly emptyNodeList: NodeList = document.createElement("div").querySelectorAll("#empty-nodelist");
  readonly observing: Map<Node, MutationObserverInit> = new Map();

  constructor(mutationReporterCallback?: MutationReporterCallback) {
    super(MutationReporter.buildCallback(mutationReporterCallback, () => this));
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

  private static childListToCharacterData(mutationRecord: MutationRecord): MutationRecord {
    let oldValue: string = null;
    if (mutationRecord.removedNodes.length === 1) {
      oldValue = mutationRecord.removedNodes[0].nodeValue;
    }
    let target: Node = mutationRecord.target;
    if (mutationRecord.addedNodes.length === 1) {
      target = mutationRecord.addedNodes[0];
    }

    /** {@link https://www.quirksmode.org/blog/archives/2017/11/mutation_observ.html} the childList change actually reflect a characterData change */
    return {
      type: "characterData",
      target,
      addedNodes: this.emptyNodeList,
      removedNodes: this.emptyNodeList,
      previousSibling: null,
      nextSibling: null,
      attributeName: null,
      attributeNamespace: null,
      oldValue
    };
  }

  private static correctMutationRecord(mutationRecord: MutationRecord): MutationRecord {
    switch (mutationRecord.type) {
      case "childList":
        for (const addedNode of mutationRecord.addedNodes) {
          if (addedNode.nodeType === Node.TEXT_NODE) {
            return MutationReporter.childListToCharacterData(mutationRecord);
          }
        }
        for (const removedNode of mutationRecord.removedNodes) {
          if (removedNode.nodeType === Node.TEXT_NODE) {
            return MutationReporter.childListToCharacterData(mutationRecord);
          }
        }
        // fallthrough
      default:
        return mutationRecord;
    }
  }

  private static buildCallback(mutationReporterCallback: MutationReporterCallback, thisWrapper: () => MutationReporter): MutationCallback {
    return function(mutations, observer) {
      const correctedMutations = mutations.map(MutationReporter.correctMutationRecord);
      mutationReporterCallback(correctedMutations, mutations, observer, thisWrapper());
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

  report(mutations: Array<MutationRecord>) {
    for (const mutation of mutations) {
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
}
