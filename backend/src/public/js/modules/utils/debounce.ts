type EventHandler = (event: Event) => void;


/**
 *
 * @function debounce
 * Debounces a callback function using {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame Window.requestAnimationFrame}
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
