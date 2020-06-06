import { ForwardingInstantiation } from  "./Instantiation";
import { NotImplemented } from "../../../utils/errors";


describe("set forwarding target", () => {
  const forwardingTarget = { id: "foo" };
  const instantiation = new ForwardingInstantiation({"id": {
    get(forwardingTo: any, thisArgument: ForwardingInstantiation) {
      return forwardingTo.id;
    },
    set(v: any, forwardingTo: any, thisArgument: ForwardingInstantiation) {
      forwardingTo.id = v;
    }
  }}, forwardingTarget);

  test("Initial get and set modifies the object", () => {
    expect((instantiation as any).id).toBe("foo");
    (instantiation as any).id = "bar";
    expect((instantiation as any).id).toBe("bar");
    expect(forwardingTarget.id).toBe("bar");
  });

  test("Change forwarding target", () => {
    const newForwardingTarget = document.createElement("div");
    instantiation.setForwardingTo__(newForwardingTarget);
    expect((instantiation as any).id).toBe("");
    (instantiation as any).id = "bar";
    expect((instantiation as any).id).toBe("bar");
    expect(newForwardingTarget.id).toBe("bar");
  });
});

describe("Unimplemented getter and setter", () => {
  const forwardingTarget = { id: "foo" };
  const instantiation = new ForwardingInstantiation({
    id: {},
  }, forwardingTarget);
  test("throwing NotImplemented error", () => {
    expect(() => (instantiation as any).id).toThrow(NotImplemented);
    expect(() => (instantiation as any).id = "foo").toThrow(NotImplemented);
  });
});
