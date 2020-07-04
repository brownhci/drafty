/**
 * Implements a cache in Local Storage with expiry limit
 */
export class LocalStorageCache {
  static defaultTimestampKeyFunction(key: string) {
    return `timestamp-for-${key}`;
  }

  expiry: number;
  timestampKeyFunction: (key: string) => string;

  constructor(expiry: number = 60 * 1000 /* 1 minute */,
             timestampKeyFunction: (key: string) => string = LocalStorageCache.defaultTimestampKeyFunction) {
    this.expiry = expiry;
    this.timestampKeyFunction = timestampKeyFunction;
  }

  store(key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value));
    this.storeTimestamp(key);
  }

  /**
   * Stores current time in local storage with specified key.
   */
  storeTimestamp(key: string) {
    window.localStorage.setItem(this.timestampKeyFunction(key), Date.now().toString());
  }

  retrieve(key: string): any {
    const timestamp = this.retrieveTimestamp(key);
    if (!timestamp || this.hasExpired(timestamp)) {
      // delete value and tiemstamp associated with key
      this.remove(key);
      return null;
    }

    return JSON.parse(window.localStorage.getItem(key));
  }

  retrieveTimestamp(key: string): number {
    const timestamp: string = window.localStorage.getItem(this.timestampKeyFunction(key));
    if (!timestamp) {
      // no timestamp is stored under specified key
      return null;
    }

    return Number.parseInt(timestamp);
  }

  remove(key: string) {
    window.localStorage.removeItem(key);
    this.removeTimestamp(key);
  }

  removeTimestamp(key: string) {
    window.localStorage.removeItem(this.timestampKeyFunction(key));
  }

  hasExpired(timestamp: number): boolean {
    return (Date.now() - timestamp) > this.expiry;
  }
}
