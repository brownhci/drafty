export function getViewportWidth(): number {
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
}
export function getViewportHeight(): number {
  return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}
// width conversion
export function vw2px(vw: number) {
  return document.documentElement.clientWidth * vw / 100;
}
export function em2px(em: number, fontSize = 16, element: HTMLElement | null = null) {
  if (element === null) {
    return fontSize * em;
  } else {
    return em * parseFloat(getComputedStyle(element).fontSize);
  }
}

// measure text width
/* the element used to measure text width */
let textWidthMeasureElement: HTMLElement = document.getElementById("text-width-measure");
function getTextWidthMeasureElement(): HTMLElement {
  if (!textWidthMeasureElement) {
    // initialize text width measure
    textWidthMeasureElement = document.createElement("span");
    textWidthMeasureElement.id = "text-width-measure";
		const bodyElement = document.body;
		bodyElement.prepend(textWidthMeasureElement);
  }
  return textWidthMeasureElement;
}

/**
 * Changing the text content of textWidthMeasureElement and measure element width.
 *
 * @param {string} text - the text whose width will be measured.
 * @returns {number} The text width.
 */
export function measureTextWidth(text: string): number {
  // find or initialize a text width measure element
  const textWidthMeasureElement = getTextWidthMeasureElement();
  textWidthMeasureElement.textContent = text;
  return textWidthMeasureElement.offsetWidth;
}
