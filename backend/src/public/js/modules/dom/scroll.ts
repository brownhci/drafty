/**
 * Finds the first scroll parent of a specified element. Scroll parent is defined to be the closest ancestor element that is scrollable.
 *
 * `document.scrollingParent` will be returned as the fallback value.
 *
 * @see {@link https://stackoverflow.com/questions/35939886/find-first-scrollable-parent}
 *
 * @param {HTMLElement} element - An element to finds its scroll parent.
 * @param {boolean} [includeHidden = false] - Whether an element with overflow(x|y) set to `hidden` will be considered as a scroll parent. {@link https://developer.mozilla.org/en-US/docs/Web/CSS/overflow}
 */
export function getScrollParent(element: HTMLElement, includeHidden: boolean = false) {
  const fallback = document.scrollingElement || document.body;
  let style = getComputedStyle(element);
  const excludeStaticParent = style.position === "absolute";
  const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

  if (style.position === "fixed") {
    return fallback;
  }

  for (let parent = element; (parent = parent.parentElement);) {
      style = getComputedStyle(parent);
      if (excludeStaticParent && style.position === "static") {
          continue;
      }
      if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
  }

  return fallback;
}
