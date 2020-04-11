/**
 * This script will be used for all pages
 */
function copyToClipboard(element: HTMLElement) {
  if (window.getSelection) {
    const range = document.createRange();
    range.selectNode(element);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
  }
}