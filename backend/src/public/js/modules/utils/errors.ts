export class NotImplemented extends Error {
  constructor(message='') {
    super(message);
    this.name = 'NotImplementedError';
    this.message = message;
  }
}
