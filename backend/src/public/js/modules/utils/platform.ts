/* eslint-disable */

// platform
/**
 * Tells whether the browser runs on a Mac.
 *
 * @returns {boolean} Whether the browser runs on a Mac.
 */
function isMac() {
  const platform = window.navigator.platform;
  return platform.includes("Mac");
}

/** {@link https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser} */
// Firefox 1.0+
// @ts-ignore
export const isFirefox = typeof InstallTrigger !== 'undefined';

export const onMac: boolean = isMac();
