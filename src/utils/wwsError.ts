import httpStatusCode from 'http-status-codes';

class wwsError extends Error {
  status: number;
  statusText: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.statusText = httpStatusCode.getStatusText(status);
    this.message = message;
  }
}

export { wwsError };
