/**
 * Executes the task at leisure: put the task in the event loop and wait for later execution.
 *
 * @param {() => void} task - An executable to be executed when JS thread is at leisure.
 */
export function executeAtLeisure(task: () => void) {
  window.setTimeout(task, 0);
}
