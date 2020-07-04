import { Abstraction } from "./Abstraction";
import { NotImplemented } from "../../../utils/errors";

class TestInstantiation extends Abstraction {
}

describe("Testing Prop", () => {
  let value: any = null;
  const mockGetter = jest.fn(() => value).mockName("Getter");
  const mockSetter = jest.fn((newValue: any) => value = newValue).mockName("Setter");
  const instantiation = new TestInstantiation({
    field: {
      get: mockGetter,
      set: mockSetter
    }
  });

  test("Prop Existence", () => {
    expect(Object.keys(instantiation)).toEqual(["field"]);
    expect("field" in instantiation).toBe(true);
  });

  test("getter and setter", () => {
    expect((instantiation as any).field).toBeNull();
    (instantiation as any).field = "foo";
    expect((instantiation as any).field).toBe("foo");
    expect(mockGetter.mock.calls.length).toBe(2);
    expect(mockSetter.mock.calls.length).toBe(1);
  });

  test("Iteration", () => {
    for (const [propName, propValue] of instantiation) {
      expect(propName).toBe("field");
      expect(propValue).toBe("foo");
    }
  });
});

describe("Unimplemented getter and setter", () => {
  const instantiation = new TestInstantiation({
    id: {},
  });
  test("throwing NotImplemented error", () => {
    expect(() => (instantiation as any).id).toThrow(NotImplemented);
    expect(() => (instantiation as any).id = "foo").toThrow(NotImplemented);
  });
});

describe("Register and Revoke Props", () => {
  const instantiation = new TestInstantiation({
    id: {},
  });
  test("initial register", () => {
    expect(Object.keys(instantiation)).toEqual(["id"]);
  });
  test("register additional props", () => {
    instantiation.registerProps__({
      textContent: {}
    }, false);
    expect(Object.keys(instantiation)).toEqual(expect.arrayContaining(["id", "textContent"]));
  });
  test("replace props", () => {
    instantiation.registerProps__({
      classList: {}
    }, true);
    expect(Object.keys(instantiation)).toEqual(["classList"]);
  });
  test("revoke existing props", () => {
    instantiation.registerProps__({
    }, true);
    expect(Object.keys(instantiation)).toEqual([]);
  });
});

describe("Testing Shape", () => {
  const instantiation = new TestInstantiation({
    id: {},
    className: {},
    textContent: {}
  });
  test("Abstraction properties is subset of another object", () => {
    expect(instantiation.hasSameShape__(document.createElement("div"))).toBe(true);
    expect(instantiation.hasSameShape__({id: undefined, className: undefined, textContent: undefined})).toBe(true);
  });
  test("Abstraction properties is subset of another abstraction", () => {
    expect(instantiation.hasSameShape__(instantiation)).toBe(true);
    const other = new TestInstantiation({
      id: {},
      className: {},
      textContent: {},
      contentEditable: {}
    });
    expect(instantiation.hasSameShape__(other)).toBe(true);
  });
  test("different shape", () => {
    expect(instantiation.hasSameShape__({})).toBe(false);
    const other = new TestInstantiation({
      id: {},
      children: {}
    });
    expect(instantiation.hasSameShape__(other)).toBe(false);
  });
});
