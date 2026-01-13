type ErrorData = Record<string, unknown> & {
  error?: string;
  message?: string;
};

export class HttpError extends Error {
  status: number;
  data?: unknown;
  errorCode?: string;

  constructor(message: string, status = 0, data?: unknown, errorCode?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.errorCode = errorCode;
    
    // Garante que a mensagem sempre esteja em data.error para ser exibida em produção
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const dataObj = data as ErrorData;
      this.data = {
        ...data,
        error: dataObj.error || message,
        message: dataObj.message || message,
      };
    } else {
      this.data = {
        error: message,
        message: message,
        ...(data ? { originalData: data } : {}),
      };
    }
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * Classe de erro para Server Components que preserva a mensagem em produção.
 * Use esta classe ao invés de Error() em Server Components para garantir que
 * a mensagem seja exibida mesmo em produção.
 * 
 * @example
 * throw new ServerError("Mensagem de erro que será exibida em produção");
 */
export class ServerError extends Error {
  data: { error: string; message: string } & Record<string, unknown>;

  constructor(message: string, data?: Record<string, unknown>) {
    super(message);
    this.name = "ServerError";
    // Sempre inclui a mensagem em data.error para ser exibida em produção
    this.data = {
      error: message,
      message: message,
      ...(data || {}),
    };
  }
}
