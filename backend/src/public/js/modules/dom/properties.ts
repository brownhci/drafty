/**
 * @module
 * This module encapsulates utility function to manipulate **property** of any HTML element.
 *
 * A property is one of the following
 *    + a HTML attribute, regulated by functions like {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute}
 *    + a property defined on HTMLElement {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement} of the specific subclass of HTMLElement.
 *    + a custom property
 */

export function getProperty(element: HTMLElement, propertyName: string) {
  if (element.hasAttribute(propertyName)) {
    return element.getAttribute(propertyName);
  } else {
    return (element as { [key: string]: any })[propertyName];
  }
}

export function hasProperty(element: HTMLElement, propertyName: string) {
  return element.hasAttribute(propertyName) || propertyName in element;
}

export function setProperty(element: HTMLElement, propertyName: string, propertyValue: any) {
  if (element.hasAttribute(propertyName)) {
    element.setAttribute(propertyName, propertyValue);
  } else {
    (element as { [key: string]: any })[propertyName] = propertyValue;
  }
}
