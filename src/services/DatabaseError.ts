export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends DatabaseError {
  constructor(message: string, public statusCode: number = 401, originalError?: any) {
    super(message, 'AUTH_ERROR', statusCode, originalError);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends DatabaseError {
  constructor(message: string, public statusCode: number = 403, originalError?: any) {
    super(message, 'AUTHORIZATION_ERROR', statusCode, originalError);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, 'VALIDATION_ERROR', 400, originalError);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, 'NOT_FOUND', 404, originalError);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, 'CONFLICT', 409, originalError);
    this.name = 'ConflictError';
  }
}

export type ErrorType = 
  | DatabaseError
  | AuthenticationError
  | AuthorizationError
  | ValidationError
  | NotFoundError
  | ConflictError;

export interface ErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
}

export function handlePocketBaseError(error: any): ErrorType {
  if (!error) {
    return new DatabaseError('Unknown error occurred');
  }

  const message = error.message || error.data?.message || 'An error occurred';
  const statusCode = error.status || error.statusCode;

  switch (statusCode) {
    case 400:
      return new ValidationError(message, error);
    case 401:
      return new AuthenticationError(message, 401, error);
    case 403:
      return new AuthorizationError(message, 403, error);
    case 404:
      return new NotFoundError(message, error);
    case 409:
      return new ConflictError(message, error);
    default:
      return new DatabaseError(message, 'DATABASE_ERROR', statusCode, error);
  }
}

export function isDatabaseError(error: any): error is ErrorType {
  return error instanceof DatabaseError;
}

export function getErrorMessage(error: any): string {
  if (isDatabaseError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function getErrorCode(error: any): string | undefined {
  if (isDatabaseError(error)) {
    return error.code;
  }
  return undefined;
}