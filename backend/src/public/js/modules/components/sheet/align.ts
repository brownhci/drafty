import { tableElement, tableFootElement, tableScrollContainer } from '../../dom/sheet';
import { getViewportWidth, getViewportHeight } from '../../utils/length';


export function placeElementInViewport(element: HTMLElement, x: number, y: number) {
  const { width: elementWidth, height: elementHeight } = element.getBoundingClientRect();
  //console.log("\nplaceElementInViewport()");
  // horizontal alignment
  const viewportWidth = getViewportWidth();
  if (x + elementWidth < viewportWidth) {
    // the element can be placed where its left is x
    element.style.left = `${x}px`;
  } else if (x - elementWidth >= 0) {
    // the element can be placed where its right is x
    element.style.left = `${x - elementWidth}px`;
  } else {
    // the element will be placed where its right is at the right of the viewport
    element.style.left = `${viewportWidth - elementWidth}px`;
  }

  // vertical alignment
  const viewportHeight = getViewportHeight();
  if (y + elementHeight < viewportHeight) {
    // the element can be placed where its top is y
    element.style.top = `${y}px`;
  } else if (y - elementHeight >= 0) {
    // the element can be placed where its bottom is y
    element.style.top = `${y - elementHeight}px`;
  } else {
    // the element will be placed where its bottom is at the bottom of the viewport
    element.style.top = `${viewportHeight - elementHeight}px`;
  }
}


export function alignElementHorizontally1(element: HTMLElement, targetDimensions: DOMRect) {
  // First  - horizontally shift table, then
  // Second - horizontally shift element

  const {left: leftLimit, right: rightLimit} = tableElement.getBoundingClientRect();
  let {left: targetLeft, right: targetRight} = targetDimensions;
  const elementWidth: number = element.getBoundingClientRect().width;

  const verticalScrollBarWidth = tableScrollContainer.offsetWidth - tableScrollContainer.clientWidth;
  const viewportWidth = getViewportWidth() - verticalScrollBarWidth;

  if (targetLeft + elementWidth <= rightLimit) { 
    if (targetLeft < 0) {
      // left border the form is to the left of viewport
      const leftShiftAmount: number = -targetLeft;
      targetLeft += leftShiftAmount;
      tableScrollContainer.scrollLeft -= leftShiftAmount;
      //console.log("   left shift amounts",leftShiftAmount);
    } else if (targetLeft + elementWidth > viewportWidth) {
      // right border of the form is to the right of viewport
      const rightShiftAmount: number = targetLeft + elementWidth - viewportWidth;
      targetLeft -= rightShiftAmount;
      tableScrollContainer.scrollLeft += rightShiftAmount;
      //console.log("   right shift amounts",rightShiftAmount);
    }
  } else if (targetRight - elementWidth >= leftLimit) {
    if (targetRight > viewportWidth) {
      // right border of the form is to the right of viewport
      const rightShiftAmount: number = targetRight - viewportWidth;
      targetRight -= rightShiftAmount;
      tableScrollContainer.scrollLeft += rightShiftAmount;
      //console.log("   right shift amounts",rightShiftAmount);
    } else if (targetRight - elementWidth < 0) {
      // left border of the form is to the left left of viewport
      const leftShiftAmount: number = elementWidth - targetRight;
      targetRight += leftShiftAmount;
      tableScrollContainer.scrollLeft -= leftShiftAmount;
      //console.log("   left shift amounts",leftShiftAmount);
    }
  }
}

/**
 * Align an element horizontally with respect to targetElement (either align to the left border or right border of targetElement).
 *
 * If the element can be aligned after scrolling the container, viewport will be adjusted.
 *
 * NOTE: This method works for elements inside tableScrollContainer.
 *
 * @param {HTMLElement} element - The element to be aligned.
 * @param {DOMRect} targetDimensions - The result of running getBoundingClientRect() on the element to align against.
 */
export function alignElementHorizontally(element: HTMLElement, targetDimensions: DOMRect) {
  //console.log("\nalignElementHorizontally...");
  const {left: leftLimit, right: rightLimit} = tableElement.getBoundingClientRect();
  let {left: targetLeft, right: targetRight} = targetDimensions;
  const elementWidth: number = element.getBoundingClientRect().width;

  const verticalScrollBarWidth = tableScrollContainer.offsetWidth - tableScrollContainer.clientWidth;
  const viewportWidth = getViewportWidth() - verticalScrollBarWidth;

  /**
   * set horizontal placement
   * two choices for horizontal placement
   *   1. left border of element stick to left border of target cell
   *     This option should be picked when right side of the element does not exceed table element's right bound (rightLimit)
   *   2. right border of element stick to right border of target cell
   *     This option should be picked when the first option isn't available and the left side of the element does not exceed table element's left bound (leftLimit)
   */
  let elementLeft: number;
  //console.log("left check",(targetLeft + elementWidth),rightLimit);
  //console.log("left check",(targetRight - elementWidth),leftLimit);
  if (targetLeft + elementWidth <= rightLimit) {
    // option 1
    //console.log("option 1...");
    if (targetLeft < 0) {
      // left border the form is to the left of viewport
      const leftShiftAmount: number = -targetLeft;
      targetLeft += leftShiftAmount;
      //tableScrollContainer.scrollLeft -= leftShiftAmount;
      //console.log("   left shift amounts",leftShiftAmount);
    } else if (targetLeft + elementWidth > viewportWidth) {
      // right border of the form is to the right of viewport
      const rightShiftAmount: number = targetLeft + elementWidth - viewportWidth;
      targetLeft -= rightShiftAmount;
      //tableScrollContainer.scrollLeft += rightShiftAmount;
      //console.log("   right shift amounts",rightShiftAmount);
    } else {
    //console.log("   no shift");
    }
    elementLeft = targetLeft;
  } else if (targetRight - elementWidth >= leftLimit) {
    // option 2
    //console.log("option 2...",targetRight,viewportWidth);
    if (targetRight > viewportWidth) {
      // right border of the form is to the right of viewport
      //console.log("   right border");
      const rightShiftAmount: number = targetRight - viewportWidth;
      targetRight -= rightShiftAmount;
      //tableScrollContainer.scrollLeft += rightShiftAmount;
      //console.log("   right shift amounts",rightShiftAmount);
    } else if (targetRight - elementWidth < 0) {
      // left border of the form is to the left left of viewport
      //console.log("   left border");
      const leftShiftAmount: number = elementWidth - targetRight;
      targetRight += leftShiftAmount;
      //tableScrollContainer.scrollLeft -= leftShiftAmount;
      //console.log("   left shift amounts",leftShiftAmount);
    } else {
    //console.log("   no shift");
    }
    elementLeft = targetRight - elementWidth;
  }
  
  // getViewportWidth() - is not consistent
  //console.log("\n",getViewportWidth());
  //console.log(document.documentElement.clientWidth, window.innerWidth);
  //console.log(verticalScrollBarWidth);
  //console.log("elementWidth",elementWidth);
  //console.log("getBoundingClientRect",element.getBoundingClientRect().width);
  //console.log(((getViewportWidth() - verticalScrollBarWidth) - elementWidth));

  //console.log("   final left =",elementLeft);
  element.style.left = `${elementLeft}px`;
}

/**
 * Align an element vertically with respect to targetElement (either bottom border align to the top border or top border align to the bottom border of targetElement).
 *
 * @param {HTMLElement} element - The element to be aligned.
 * @param {DOMRect} targetDimensions - The result of running getBoundingClientRect() on the element to align against.
 */
export function placeElementAdjacently(element: HTMLElement, targetDimensions: DOMRect, isSearchColumn: boolean = false) {
  if(isSearchColumn) {
    // sw: with recent CSS changes 
  // the height of the navbar and table header are fixed
    element.style.top = `90px`;
  } else {
    const topLimit = 0;
    const horizontalScrollBarHeight = tableScrollContainer.offsetHeight - tableScrollContainer.clientHeight;
    const bottomLimit: number = getViewportHeight() - horizontalScrollBarHeight;
    const { top: targetTop, bottom: targetBottom } = targetDimensions;
    const elementHeight = element.getBoundingClientRect().height;
    /**
     * Set vertical placement
     * two choices for vertical placement
     *    1. top border of element stick to the bottom border of target cell
     *    2. bottom border of element stick to the top border of target cell
     */
    let elementTop: number;
    if (targetBottom + elementHeight <= bottomLimit) {
      // option 1
      // sw: cell-editor-new is calling this
      elementTop = targetBottom;
    } else if (targetTop - elementHeight >= topLimit) {
      // option 2
      const autoCompleteHeight = element.getBoundingClientRect().height;
      const footerHeight = tableFootElement.getBoundingClientRect().height;
      elementTop = targetBottom - footerHeight - autoCompleteHeight;
    }
    element.style.top = `${elementTop}px`;
  }
}
