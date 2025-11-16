import { ErrorType, AppError } from '../types/error';

/**
 * Centralized Error Handler
 * Maps technical errors to user-friendly messages
 */
class ErrorHandler {
  /**
   * Parse any error and convert it to AppError
   */
  parseError(error: any, context?: string): AppError {
    // Network errors
    if (this.isNetworkError(error)) {
      return this.createNetworkError(error);
    }

    // Auth errors
    if (this.isAuthError(error)) {
      return this.createAuthError(error);
    }

    // Server errors
    if (this.isServerError(error)) {
      return this.createServerError(error);
    }

    // Validation errors
    if (this.isValidationError(error)) {
      return this.createValidationError(error);
    }

    // Default: Unknown error
    return this.createUnknownError(error, context);
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: any): boolean {
    const networkMessages = [
      'network request failed',
      'network error',
      'timeout',
      'failed to fetch',
      'cannot connect',
      'connection refused',
      'no internet',
    ];

    const errorMessage = this.getErrorMessage(error).toLowerCase();
    return networkMessages.some(msg => errorMessage.includes(msg));
  }

  /**
   * Check if error is auth-related
   */
  private isAuthError(error: any): boolean {
    const authMessages = [
      'unauthorized',
      'invalid credentials',
      'authentication failed',
      'invalid email',
      'invalid password',
      'email already exists',
      'session expired',
      'token expired',
    ];

    const errorMessage = this.getErrorMessage(error).toLowerCase();
    const statusCode = error?.response?.status || error?.status;

    return statusCode === 401 || statusCode === 403 || 
           authMessages.some(msg => errorMessage.includes(msg));
  }

  /**
   * Check if error is server-related
   */
  private isServerError(error: any): boolean {
    const statusCode = error?.response?.status || error?.status;
    return statusCode >= 500 && statusCode < 600;
  }

  /**
   * Check if error is validation-related
   */
  private isValidationError(error: any): boolean {
    const statusCode = error?.response?.status || error?.status;
    return statusCode === 400 || statusCode === 422;
  }

  /**
   * Create network error
   */
  private createNetworkError(error: any): AppError {
    const errorMessage = this.getErrorMessage(error).toLowerCase();

    if (errorMessage.includes('timeout')) {
      return {
        type: ErrorType.NETWORK_TIMEOUT,
        message: 'error.networkTimeout',
        details: 'error.networkTimeoutDetails',
        retryable: true,
        technicalDetails: error,
        timestamp: new Date(),
      };
    }

    if (errorMessage.includes('offline') || errorMessage.includes('no internet')) {
      return {
        type: ErrorType.NETWORK_OFFLINE,
        message: 'error.networkOffline',
        details: 'error.networkOfflineDetails',
        retryable: true,
        technicalDetails: error,
        timestamp: new Date(),
      };
    }

    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'error.networkError',
      details: 'error.networkErrorDetails',
      retryable: true,
      technicalDetails: error,
      timestamp: new Date(),
    };
  }

  /**
   * Create auth error
   */
  private createAuthError(error: any): AppError {
    const errorMessage = this.getErrorMessage(error).toLowerCase();

    if (errorMessage.includes('invalid credentials') || 
        errorMessage.includes('invalid email') || 
        errorMessage.includes('invalid password')) {
      return {
        type: ErrorType.AUTH_INVALID_CREDENTIALS,
        message: 'error.invalidCredentials',
        details: 'error.invalidCredentialsDetails',
        retryable: false,
        technicalDetails: error,
        timestamp: new Date(),
      };
    }

    if (errorMessage.includes('email already exists')) {
      return {
        type: ErrorType.AUTH_EMAIL_ALREADY_EXISTS,
        message: 'error.emailAlreadyExists',
        details: 'error.emailAlreadyExistsDetails',
        retryable: false,
        technicalDetails: error,
        timestamp: new Date(),
      };
    }

    if (errorMessage.includes('session expired') || errorMessage.includes('token expired')) {
      return {
        type: ErrorType.AUTH_SESSION_EXPIRED,
        message: 'error.sessionExpired',
        details: 'error.sessionExpiredDetails',
        retryable: false,
        technicalDetails: error,
        timestamp: new Date(),
      };
    }

    return {
      type: ErrorType.AUTH_UNAUTHORIZED,
      message: 'error.unauthorized',
      details: 'error.unauthorizedDetails',
      retryable: false,
      technicalDetails: error,
      timestamp: new Date(),
    };
  }

  /**
   * Create server error
   */
  private createServerError(error: any): AppError {
    const statusCode = error?.response?.status || error?.status;

    if (statusCode === 503) {
      return {
        type: ErrorType.SERVER_UNAVAILABLE,
        message: 'error.serverUnavailable',
        details: 'error.serverUnavailableDetails',
        retryable: true,
        technicalDetails: error,
        timestamp: new Date(),
      };
    }

    return {
      type: ErrorType.SERVER_ERROR,
      message: 'error.serverError',
      details: 'error.serverErrorDetails',
      retryable: true,
      technicalDetails: error,
      timestamp: new Date(),
    };
  }

  /**
   * Create validation error
   */
  private createValidationError(error: any): AppError {
    return {
      type: ErrorType.DATA_VALIDATION_FAILED,
      message: 'error.validationFailed',
      details: this.getErrorMessage(error),
      retryable: false,
      technicalDetails: error,
      timestamp: new Date(),
    };
  }

  /**
   * Create unknown error
   */
  private createUnknownError(error: any, context?: string): AppError {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: 'error.unknownError',
      details: context ? `${context}: ${this.getErrorMessage(error)}` : this.getErrorMessage(error),
      retryable: true,
      technicalDetails: error,
      timestamp: new Date(),
    };
  }

  /**
   * Extract error message from various error formats
   */
  private getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.response?.data?.error) {
      return error.response.data.error;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.error) {
      return error.error;
    }

    return 'An unexpected error occurred';
  }

  /**
   * Log error to console (production: could send to error tracking service)
   */
  logError(error: AppError, context?: string): void {
    const prefix = context ? `[${context}]` : '[ErrorHandler]';
    console.error(`${prefix} ${error.type}:`, {
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
      technical: error.technicalDetails,
    });
  }
}

export const errorHandler = new ErrorHandler();
