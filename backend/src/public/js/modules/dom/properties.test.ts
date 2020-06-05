import { getProperty, hasProperty, setProperty } from "./properties";

let element: HTMLElement;

describe("DOM property", () => {
  beforeEach(() => {
    element = document.createElement("div");
  });

  test("non-existing property", () => {
    expect(getProperty(element, "contenteditable")).toBeFalsy();
    expect(hasProperty(element, "contenteditable")).toBe(false);
  });

  test("existing DOM property", () => {
    setProperty(element, "title", "A test div");
    expect(getProperty(element, "title")).toBe("A test div");
    expect(hasProperty(element, "title")).toBe(true);
  });

  test("setting a DOM property", () => {
    expect(hasProperty(element, "class")).toBe(false);
    element.className = "";
    setProperty(element, "class", "active");
    expect(getProperty(element, "class")).toBe("active");
    expect(hasProperty(element, "class")).toBe(true);
  });
});

describe("JS property", () => {
  beforeEach(() => {
    element = document.createElement("div");
  });

  test("has JS property", () => {
    expect(hasProperty(element, "textContent")).toBe(true);
    expect(hasProperty(document.createElement("tr"), "cells")).toBe(true);
    expect(hasProperty(element, "foo")).toBe(false);
  });

  test("set JS property", () => {
    setProperty(element, "textContent", "some text");
    expect(element.textContent).toBe("some text");
    expect(getProperty(element, "textContent")).toBe("some text");
  });
});

describe("custom property", () => {
  beforeEach(() => {
    element = document.createElement("div");
  });

  const customPropertyName = "isTestDiv";
  test("has custom property", () => {
    expect(hasProperty(element, customPropertyName)).toBe(false);
  });

  test("set custom property", () => {
    expect(getProperty(element, customPropertyName)).toBeFalsy();
    setProperty(element, customPropertyName, true);
    expect(hasProperty(element, customPropertyName)).toBe(true);
    expect(getProperty(element, customPropertyName)).toBe(true);
  });
});
