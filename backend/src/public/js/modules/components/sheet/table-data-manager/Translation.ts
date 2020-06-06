/**
 * Translates from a monitorable attribute {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit/attributeFilter} to a property of a JS equivalent of HTML element (@example, a HTMLTableCellElement)
 *
 * It contains the following special cases:
 *    + "class" => "className" {@link https://stackoverflow.com/questions/38996435/mutationobserver-with-specific-mutations} 
 *
 * @param {string} attribute - A monitorable attribute to be translated.
 * @return {string} An attribute on JS interface for HTML elements.
 */ 
export function translateFromMonitorableAttributeToElementAttribute(attribute: string): string {
  switch (attribute) {
    case "class":
      return "className";
    case "contenteditable":
      return "contentEditable";
    default:
      return attribute;
  }
}
