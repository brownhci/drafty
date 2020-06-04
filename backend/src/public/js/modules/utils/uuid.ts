/**
 * @module This module provides an implementation of UUID (aka Universally Unique IDentifier) copied from {@link https://stackoverflow.com/questions/105034/how-to-create-guid-uuid}
 */ 

export function uuidv4() {
  /* eslint-disable @typescript-eslint/ban-ts-ignore */
  // @ts-ignore
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
