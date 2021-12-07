export function hasTextSelected(element: HTMLElement): boolean {
   const selection = window.getSelection();
   if (!selection) {
     return false;
   }
   if (selection.toString() === '') {
     return false;
   }
   const range = selection.getRangeAt(0);
   if (!range) {
     return false;
   }
  const textNode = range.commonAncestorContainer;
  if (!textNode) {
    return false;
  }

  return textNode.parentElement === element;
}

export function getTextSelected(): string {
  return window.getSelection().toString();
}
