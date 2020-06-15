import { PartialViewScrollHandler as Handler } from "./PartialViewScrollHandler";
import { PartialView } from "./ViewFunction";

class PartialViewScrollHandler<T> extends Handler<T> {
  protected syncView() {
    const view: Array<T> = this.partialView.currentView;
    while (this.partialViewArea.firstChild) {
      this.partialViewArea.lastChild.remove();
    }
    view.forEach(viewElement => this.partialViewArea.appendChild(this.elementExtractor(viewElement)));
    this.setFillerHeights();
  }
}

function setupIntersectionObserverMock({
  observe = () => null,
  unobserve = () => null,
  disconnect = () => null,
} = {}) {
  class IntersectionObserver {
    observe = observe;
    unobserve = unobserve;
    disconnect = disconnect;
  }
  Object.defineProperty(
    window,
    "IntersectionObserver",
    { writable: true, configurable: true, value: IntersectionObserver }
  );
  Object.defineProperty(
    global,
    "IntersectionObserver",
    { writable: true, configurable: true, value: IntersectionObserver }
  );
}
setupIntersectionObserverMock();


describe("changing view", () => {
  const source: Array<HTMLLIElement> = [];
  for (let i = 0; i < 10000; i++) {
    const listItem = document.createElement("li");
    listItem.textContent = i.toString();
    source.push(listItem);
  }
  const elementExtractor = (viewElement: HTMLLIElement) => viewElement;
  const partialView = new PartialView<HTMLLIElement>(source, 0, 9, 10);
  const partialViewArea = document.createElement("ul");
  document.body.appendChild(partialViewArea);
  const scrollTarget = partialViewArea;
  const elementHeight = 100;
  const handler = new PartialViewScrollHandler<HTMLLIElement>({
    elementExtractor,
    partialView,
    partialViewArea,
    scrollTarget,
    elementHeight
  });
  const range = (startIndex: number) => Array.from(Array(10).keys()).map(v => v + startIndex);

  test("set view", () => {
    expect(handler.shouldPartialRender).toBe(true);
    expect(handler.topSentinelIndex).toBeGreaterThanOrEqual(0);
    expect(handler.topSentinelIndex).toBeLessThan(10);
    expect(handler.bottomSentinelIndex).toBeGreaterThanOrEqual(0);
    expect(handler.bottomSentinelIndex).toBeLessThan(10);
    expect(handler.topFillerHeight).toBe(elementHeight * 0);
    expect(handler.bottomFillerHeight).toBe(elementHeight * (10000 - 10));
    expect(Array.from(partialViewArea.children).map(child => child.textContent)).toEqual(range(0).map(v => v.toString()));
    handler.setWindow(100);
    expect(partialViewArea.children.length).toBe(10);
    expect(Array.from(partialViewArea.children).map(child => child.textContent)).toEqual(range(100).map(v => v.toString()));
    expect(handler.topFillerHeight).toBe(elementHeight * 100);
    expect(handler.bottomFillerHeight).toBe(elementHeight * (10000 - 110));
  });
});
