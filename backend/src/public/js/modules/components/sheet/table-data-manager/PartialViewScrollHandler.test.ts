import { PartialViewScrollHandler } from './PartialViewScrollHandler';
import { PartialView } from './ViewFunction';

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
    'IntersectionObserver',
    { writable: true, configurable: true, value: IntersectionObserver }
  );
  Object.defineProperty(
    global,
    'IntersectionObserver',
    { writable: true, configurable: true, value: IntersectionObserver }
  );
}
setupIntersectionObserverMock();


describe('changing view', () => {
  const source: Array<HTMLLIElement> = [];
  for (let i = 0; i < 10000; i++) {
    const listItem = document.createElement('li');
    listItem.textContent = i.toString();
    source.push(listItem);
  }
  const partialView = new PartialView<HTMLLIElement>(source, 0, 9, 10);
  const target = document.createElement('ul');
  document.body.appendChild(target);
  const elementLength = 100;
  const handler = new PartialViewScrollHandler<HTMLLIElement>({
    partialView,
    target,
    elementLength,
  });
  const range = (startIndex: number) => Array.from(Array(10).keys()).map(v => v + startIndex);

  test('set view', () => {
    expect(handler.startSentinelIndex).toBeGreaterThanOrEqual(0);
    expect(handler.startSentinelIndex).toBeLessThan(10);
    expect(handler.endSentinelIndex).toBeGreaterThanOrEqual(0);
    expect(handler.endSentinelIndex).toBeLessThan(10);
    expect(handler.startFillerLength).toBe(elementLength * 0);
    expect(handler.endFillerLength).toBe(elementLength * (10000 - 10));
    expect(Array.from(target.children).map(child => child.textContent)).toEqual(range(0).map(v => v.toString()));
    handler.setWindow(100);
    expect(Array.from(target.children).map(child => child.textContent)).toEqual(range(100).map(v => v.toString()));
    expect(handler.startFillerLength).toBe(elementLength * 100);
    expect(handler.endFillerLength).toBe(elementLength * (10000 - 110));
  });
});
