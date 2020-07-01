import { activeClass } from "../../constants/css-classes";
import { getMinimumColumnWidth, updateTableCellWidth } from "./column-width";
import { isColumnLabel, isFirstTableCell, isLastTableCell } from "../../dom/sheet";
import { getLeftTableCellElement, getRightTableCellElement } from "../../dom/navigate";

const distanceConsideredNearToBorder = 10;

const resizeVisualCue: HTMLElement = document.getElementById("resize-visual-cue");
function activateResizeVisualCue() {
  resizeVisualCue.classList.add(activeClass);
}
function deactivateResizeVisualCue() {
  resizeVisualCue.classList.remove(activeClass);
}
let isResizing: boolean = false;
let resizeStartX: number = null;
let tableHeadAtMouseLeft: HTMLTableCellElement;
let tableHeadAtMouseRight: HTMLTableCellElement;

const nearLeftBorderClass = "near-left-border";
const nearRightBorderClass = "near-right-border";

function setTableHeadAtMouseLeft(tableCellElement: HTMLTableCellElement) {
	tableHeadAtMouseLeft = tableCellElement;
	tableCellElement.classList.add(nearRightBorderClass);
}
function setTableHeadAtMouseRight(tableCellElement: HTMLTableCellElement) {
	tableHeadAtMouseRight = tableCellElement;
	tableCellElement.classList.add(nearLeftBorderClass);
}

function nearElementLeftBorder(element: HTMLElement) {
  return element.classList.contains(nearLeftBorderClass);
}
function nearElementRightBorder(element: HTMLElement) {
  return element.classList.contains(nearRightBorderClass);
}
/**
 * Determines the allowed leftmost position for the visual cue. This position is decided by the minimum width for the resize element.
 *
 * Formula:
 *
 *    resizeElement's left position + resizeElement's minimum width
 *
 * @param {HTMLTableCellElement} - The element to be resized. More specifically, the position of the visual cue determines the element's new width.
 */
function getAllowedLeftmostPosition(resizeElement: HTMLTableCellElement) {
  const elementLeft = resizeElement.getBoundingClientRect().left;
  return elementLeft + getMinimumColumnWidth(resizeElement.cellIndex);
}


function repositionResizeVisualCue(resizeElement: HTMLTableCellElement, newXPos: number) {
  if (resizeElement) {
    const minX = getAllowedLeftmostPosition(resizeElement);
    newXPos = Math.max(minX, newXPos);
  }
  resizeVisualCue.style.left = `${newXPos}px`;
}

function resetTableHeadNearMouse() {
	if (tableHeadAtMouseLeft) {
		tableHeadAtMouseLeft.classList.remove(nearRightBorderClass);
		tableHeadAtMouseLeft = null;
	}

	if (tableHeadAtMouseRight) {
		tableHeadAtMouseRight.classList.remove(nearLeftBorderClass);
		tableHeadAtMouseRight = null;
	}
}

/**
 * Handle mouse move near the borders of elements.
 *
 * @param {ResizableHTMLTableCellElement} tableCellElement - An resizable table cell element.
 * @param {MouseEvent} event - The invoking mouse event.
 */
function handleMouseMoveOnColumnLabel(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
		resetTableHeadNearMouse();
    const {left: elementLeft, right: elementRight} = tableCellElement.getBoundingClientRect();
    const mouseX = event.clientX;
    const distanceFromLeftBorder = mouseX - elementLeft;
    const distanceFromRightBorder = elementRight - mouseX;
    if (distanceFromLeftBorder <= distanceConsideredNearToBorder && distanceFromLeftBorder < distanceFromRightBorder && !isFirstTableCell(tableCellElement)) {
      // near left border
			setTableHeadAtMouseRight(tableCellElement);
			setTableHeadAtMouseLeft(getLeftTableCellElement(tableCellElement));
    } else if (distanceFromRightBorder <= distanceConsideredNearToBorder && distanceFromRightBorder <= distanceFromLeftBorder) {
      // near right border
			setTableHeadAtMouseLeft(tableCellElement);

      if (!isLastTableCell(tableCellElement)) {
        // last table column does not have a right border
				setTableHeadAtMouseRight(getRightTableCellElement(tableCellElement));
      }
    }
}

export function tableHeadOnMouseMove(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (isResizing) {
    repositionResizeVisualCue(tableHeadAtMouseLeft, event.clientX);
  } else {
    if (!isColumnLabel(tableCellElement)) {
      // ignore mouse moving near borders on elements other than column labels
      return;
    }
    handleMouseMoveOnColumnLabel(tableCellElement, event);
  }
}

export function tableHeadOnMouseDown(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (isColumnLabel(tableCellElement)) {
    if (nearElementLeftBorder(tableCellElement) || nearElementRightBorder(tableCellElement)) {
      isResizing = true;
      resizeStartX = event.clientX;
      repositionResizeVisualCue(tableHeadAtMouseLeft, resizeStartX);
      activateResizeVisualCue();
    }
  }
}

export function tableHeadOnMouseUp(event: MouseEvent) {
  if (isResizing) {
    const resizeEndX = event.clientX;
    const resizeAmount = resizeEndX - resizeStartX;
    if (resizeAmount !== 0) {
      // resizing
      updateTableCellWidth(tableHeadAtMouseLeft, resizeAmount);
    }
  }
  deactivateResizeVisualCue();
  isResizing = false;
}
