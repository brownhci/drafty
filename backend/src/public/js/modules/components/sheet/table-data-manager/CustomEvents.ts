import { ViewModel } from "./ViewModel";

export interface PropertyChangeEventDetail {
  attributeName: string;
  oldAttributeValue: string;
}

export class PropertyChangeEvent extends CustomEvent<PropertyChangeEventDetail> {
  static readonly typeArg: string = "propertyChange";

  constructor(detail: PropertyChangeEventDetail = null) {
    super(PropertyChangeEvent.typeArg, {
      detail,
      bubbles: true,
      cancelable: true
    });
  }
}

export interface CharacterDataChangeEventDetail {
  oldValue: string;
  newValue: string;
}

export type CharacterDataChangeDetail = Omit<CharacterDataChangeEventDetail, "targetViewModel">;

export class CharacterDataChangeEvent extends CustomEvent<CharacterDataChangeEventDetail> {
  static readonly typeArg: string = "characterDataChange";

  constructor(detail: CharacterDataChangeEventDetail = null) {
    super(CharacterDataChangeEvent.typeArg, {
      detail,
      bubbles: true,
      cancelable: true
    });
  }
}

export interface ChildListChangeEventDetail {
  addedNodes: NodeList;
  removedNodes: NodeList;
  previousSibling: Node;
  nextSibling: Node;
}

export class ChildListChangeEvent extends CustomEvent<ChildListChangeEventDetail> {
  static readonly typeArg: string = "childListChange";

  constructor(detail: ChildListChangeEventDetail = null) {
    super(ChildListChangeEvent.typeArg, {
      detail,
      bubbles: true,
      cancelable: true
    });
  }
}
