import { onMac } from "./platform";
import { getTextSelected } from "./selection";


/** copy **/
let copyBuffer: HTMLTextAreaElement;
function getCopyBuffer(): HTMLTextAreaElement {
	if (!copyBuffer) {
		// initialize copy buffer
		copyBuffer = document.createElement("textarea");
		copyBuffer.id = "copy-buffer";
		copyBuffer.readOnly = true;
		copyBuffer.tabIndex = -1;
		copyBuffer.setAttribute("aria-label", "a textarea to support copy command");
		document.body.appendChild(copyBuffer);
	}
  return copyBuffer;
}
export function clearCopyBuffer() {
  getCopyBuffer().value = "";
}
export function copyTextToCopyBuffer(text: string) {
  getCopyBuffer().value = text;
}
export function copyCurrentSelectionToCopyBuffer() {
	copyTextToCopyBuffer(getTextSelected());
}
export function copyCopyBuffer() {
  getCopyBuffer().select();
  document.execCommand("copy");
}

export function copyElementTextToClipboard(element: HTMLElement) {
  if (window.getSelection) {
    const range = document.createRange();
    range.selectNode(element);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
  }
}
export function hasCopyModifier(event: KeyboardEvent) {
  if (onMac) {
    return event.metaKey;
  } else {
    return event.ctrlKey;
  }
}
