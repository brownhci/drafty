type EventHandler = (event: Event) => void;


/**
 *
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
