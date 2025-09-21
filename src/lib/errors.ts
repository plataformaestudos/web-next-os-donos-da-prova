export class HttpError extends Error {
  status: number;
  data?: unknown;
  errorCode?: string;

  constructor(message: string, status = 0, data?: unknown, errorCode?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
    this.errorCode = errorCode;
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}
