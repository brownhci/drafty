import MutationObserver from "./mutation-observer";
(global as any).MutationObserver = MutationObserver;
import { MutationReporter } from "./MutationReporter";
import { CharacterDataChangeEvent, ChildListChangeEvent, PropertyChangeEvent } from "./CustomEvents";

describe("Attribute Change", () => {
  let element: HTMLElement;
  beforeEach(() => {
    element = document.createElement("div");
    document.body.appendChild(element);
  });
  afterEach(() => {
    element.remove();
  });

  test("Attribute change and catch event", done => {
    let isFirst: boolean = true;

    element.addEventListener(PropertyChangeEvent.typeArg, function (event: PropertyChangeEvent) {
      const { attributeName, oldAttributeValue } = event.detail;
      expect(event.target).toBe(element);
      if (isFirst) {
        expect(attributeName).toBe("class");
        expect(oldAttributeValue).toBeFalsy();
        isFirst = false;
      } else {
        expect(attributeName).toBe("class");
        expect(oldAttributeValue).toBe("active");
        done();
      }
    });

    const reporter = new MutationReporter((correctedMutations, observer, mutations, _reporter) => {
      _reporter.report(correctedMutations);
    });

    reporter.observe(element, MutationReporter.createMutationObserverInit(true, false, true, false, ["class"]));
    element.classList.add("active");
    element.classList.add("inputting");
  });
});

describe("ChildList change", () => {
  let parent: HTMLElement;
  beforeEach(() => {
    parent = document.createElement("div");
    document.body.appendChild(parent);
  });
  afterEach(() => {
    parent.remove();
  });
  test("Append new child", done => {
    const child = document.createElement("div");
    const reporter = new MutationReporter((correctedMutations, observer, mutations, _reporter) => {
      expect(correctedMutations[0].type).toBe("childList");
      expect(correctedMutations[0].addedNodes.length).toBe(1);
      expect(correctedMutations[0].addedNodes[0]).toBe(child);
      expect(correctedMutations[0].removedNodes.length).toBe(0);
      done();
    });

    reporter.observe(parent, MutationReporter.createMutationObserverInit(false, false, true));
    parent.appendChild(child);
  });

  test("Remove child and catch event", done => {
    const child = document.createElement("div");
    parent.addEventListener(ChildListChangeEvent.typeArg, function (event: ChildListChangeEvent) {
      const { addedNodes, removedNodes, previousSibling, nextSibling } = event.detail;
      expect(addedNodes.length).toBe(0);
      expect(removedNodes.length).toBe(1);
      expect(previousSibling).toBeFalsy();
      expect(nextSibling).toBeFalsy();
      expect(removedNodes[0]).toBe(child);
      done();
    });

    const reporter = new MutationReporter((correctedMutations, observer, mutations, _reporter) => {
      expect(correctedMutations.length).toBe(1);
      _reporter.report(correctedMutations);
    });

    parent.appendChild(child);
    reporter.observe(parent, MutationReporter.createMutationObserverInit(false, false, true));
    child.remove();
  });
});

describe("Character Change", () => {
  let target: HTMLElement;
  beforeEach(() => {
    target = document.createElement("p");
    document.body.appendChild(target);
  });
  afterEach(() => {
    target.remove();
  });
  test("Append a text node", done => {
    const reporter = new MutationReporter((correctedMutations, observer, mutations, _reporter) => {
      expect(correctedMutations).toBeDefined();

      expect(correctedMutations.length).toBe(2);
      expect(mutations.length).toBe(1);

      const mutationTypes = new Set(correctedMutations.map(mutation => mutation.type));
      expect(mutationTypes).toEqual(new Set(["characterData", "childList"]));

      const characterMutation = correctedMutations[0].type === "characterData" ? correctedMutations[0] : correctedMutations[1];

      expect(characterMutation.target.textContent).toBe("foo");
      expect(characterMutation.oldValue).toBeFalsy();
      expect(mutations[0].type).toBe("childList");
      expect(_reporter).toBe(reporter);
      done();
    });

    reporter.observe(target, MutationReporter.createMutationObserverInit(false, true, false));
    target.textContent = "foo";
  });

  test("Replace a text node", done => {
    const reporter = new MutationReporter((correctedMutations) => {
      expect(correctedMutations[0].target.textContent).toBe("bar");
      expect(correctedMutations[0].oldValue).toBe("foo");
      done();
    });

    target.textContent = "foo";
    reporter.observe(target, MutationReporter.createMutationObserverInit(false, true, false));
    target.innerHTML = "bar";
  });

  test("Delete a text node", done => {
    const reporter = new MutationReporter((correctedMutations) => {
      expect(correctedMutations[0].oldValue).toBe("foo");
      expect(correctedMutations[0].target.textContent).toBe("");
      done();
    });

    target.textContent = "foo";
    reporter.observe(target, MutationReporter.createMutationObserverInit(false, true, false));
    target.firstChild.remove();
  });
});

describe("observing and unobserving", () => {
  let target: HTMLElement;
  beforeEach(() => {
    target = document.createElement("p");
    document.body.appendChild(target);
  });
  afterEach(() => {
    target.remove();
  });

  test("reobserve", done => {
    target.addEventListener(CharacterDataChangeEvent.typeArg, (event: CharacterDataChangeEvent) => {
      const { oldValue, newValue } = event.detail;
      expect(oldValue).toBe("ignored");
      expect(newValue).toBe("bar");
      done();
    });

    const reporter = new MutationReporter((correctedMutations, mutations, observer, reporter) => {
      reporter.report(correctedMutations);
      reporter.disconnect();
      expect(reporter.observing.size).toBe(0);
      target.appendChild(document.createTextNode("not watched"));
    });

    reporter.observe(target, MutationReporter.createMutationObserverInit(false, true, false));
    reporter.reconnectToExecute(() => target.textContent = "foo");
    reporter.reconnectToExecute(() => target.replaceChild(document.createTextNode("ignored"), target.firstChild));
    target.firstChild.nodeValue = "bar";
  });
});


describe("implicit characterData in childList mutation", () => {
  let target: HTMLElement;
  let targetTextContent: string;
  let numTargetChildNode: number;
  beforeEach(() => {
    target = document.createElement("div");
    target.innerHTML = `
      Banana
      <p id="p1">Apples</p>
      <ul>
        <li>
          3
        </li>
        <li>
          5
        </li>
      </ul>
    `;

    document.body.appendChild(target);
    targetTextContent = target.textContent;
    numTargetChildNode = target.childNodes.length;
  });
  afterEach(() => {
    target.remove();
  });

  test("change entire observed node's HTML", done => {
    target.addEventListener(CharacterDataChangeEvent.typeArg, (event: CharacterDataChangeEvent) => {
      const { target, oldValue, newValue } = event.detail;
      expect(oldValue).toBe(targetTextContent);
      expect(newValue).toBe(target.textContent);
      done();
    });

    const reporter = new MutationReporter((mutations, observer, originalMutations, reporter) => {
      expect(mutations.length).toBe(2);
      const mutationTypes = new Set(mutations.map(mutation => mutation.type));
      expect(mutationTypes).toEqual(new Set(["characterData", "childList"]));
      const characterMutation = mutations[0].type === "characterData" ? mutations[0] : mutations[1];
      const childMutation = mutations[0].type === "childList" ? mutations[0] : mutations[1];
      expect(characterMutation.target).toBe(target);
      expect(childMutation.target).toBe(target);
      expect(childMutation.previousSibling).toBeNull();
      expect(childMutation.nextSibling).toBeNull();
      expect(childMutation.addedNodes.length).toBe(target.childNodes.length);
      expect(childMutation.removedNodes.length).toBe(numTargetChildNode);
      reporter.report(mutations);
    });
    reporter.observe(target, MutationReporter.createMutationObserverInit(false, true, false));
    target.innerHTML = `
      <p>Lemon</p>
      <p>Orange</p>
    `;
  });

  test("change to observed node's child node", done => {
    const paragraph = document.getElementById("p1");
    const previousSibling = paragraph.previousSibling;
    const nextSibling = paragraph.nextSibling;

    target.addEventListener(CharacterDataChangeEvent.typeArg, (event: CharacterDataChangeEvent) => {
      const { target, oldValue, newValue } = event.detail;
      expect(oldValue).toBe(targetTextContent);
      expect(newValue).toBe(target.textContent);
      done();
    });

    const reporter = new MutationReporter((mutations, observer, originalMutations, reporter) => {
      expect(mutations.length).toBe(2);
      const mutationTypes = new Set(mutations.map(mutation => mutation.type));
      expect(mutationTypes).toEqual(new Set(["characterData", "childList"]));
      const characterMutation = mutations[0].type === "characterData" ? mutations[0] : mutations[1];
      const childMutation = mutations[0].type === "childList" ? mutations[0] : mutations[1];
      expect(characterMutation.target).toBe(target);
      expect(childMutation.target).toBe(target);

      expect(childMutation.previousSibling).toBe(previousSibling);
      expect(childMutation.nextSibling).toBe(nextSibling);
      expect(childMutation.addedNodes.length).toBe(1);
      expect(childMutation.removedNodes.length).toBe(1);
      reporter.report(mutations);
    });
    reporter.observe(target, MutationReporter.createMutationObserverInit(false, true, false));
    const newParagraph = document.createElement("p");
    newParagraph.textContent = "Strawberry";
    target.replaceChild(newParagraph, paragraph);
  });
});


describe("observe all children", () => {
  let target: HTMLElement;
  beforeEach(() => {
    target = document.createElement("div");
    target.innerHTML = `
      <li>
        3
      </li>
      <li>
        5
      </li>
      <li>
        2
      </li>
      <li>
        1
      </li>
    `;

    document.body.appendChild(target);
  });
  afterEach(() => {
    target.remove();
  });

  test("observe all attribute change", done => {
    let victim1: HTMLElement;
    let victim3: HTMLElement;
    const mockCallback = jest.fn((event: PropertyChangeEvent) => {
      const { target, attributeName, oldAttributeValue } = event.detail;
      expect(oldAttributeValue).toBeFalsy();
      expect(attributeName).toBe("class");
      if (mockCallback.mock.calls.length === 2) {
        expect(target).toBe(victim3);
        done();
      } else if (mockCallback.mock.calls.length === 1) {
        expect(target).toBe(victim1);
      }
    });
    target.addEventListener(PropertyChangeEvent.typeArg, mockCallback);

    const reporter = new MutationReporter();
    const options = MutationReporter.createMutationObserverInit(true, false, false, false);
    Array.from(target.children).forEach(child => reporter.observe(child, options));

    // captured
    victim1 = target.children[1] as HTMLElement;
    victim1.classList.add("active");

    reporter.unobserve(target.children[2]);
    // ignored
    target.children[2].classList.add("active");

    victim3 = target.children[0] as HTMLElement;
    // captured
    victim3.classList.add("active");
  });
});
