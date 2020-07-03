type EventHandler = (event: Event) => void;


/**
 * Debounces a callback function using {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame Window.requestAnimationFrame}
 *
 * @this is resolved as in an arrow function
 *
 * @function debounce
 * @param {EventHandler} callback - The callback to be debounced.
 */
export const debounce = (callback: EventHandler): EventHandler => {
  let ticking = false;
  return (event: Event) => {
    if (!ticking) {
        ticking = true;

        window.requestAnimationFrame(() => {
          callback(event);
          ticking = false;
        });
      }
  };
};


/**
 * Executes a callback function after a `cooldown` timeout has expired since last event. In other words, the callback is executed when the event is not firing for some time.
 *
 * This debounce function is useful when a callback needs to execute as a cleanup (aftermath) handler. Often it does not matter how many times this function is executed as long as it is executed at least once.
 *
 * @this is resolved as in an arrow function
 *
 * @function debounceWithCooldown
 * @param {EventHandler} callback - The callback to be debounced.
 * @param {number} cooldown - Used to set a timeout that indicates inactiveness of event firing.
 */
export const debounceWithCooldown = (callback: EventHandler, cooldown: number): EventHandler => {
  let timeoutID: number = null;
  return (event: Event) => {
    window.clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => callback(event), cooldown);
  };
};
