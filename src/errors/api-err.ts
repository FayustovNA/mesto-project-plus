const {
  INCORRECT_DATA_ERROR,
  NOT_FOUND_ERROR,
  UNAUTHORIZED_ERROR,
  CONFLICT_ERROR,
  FORBIDDEN_ERROR,
} = require('./config-err');

class ApiError extends Error {
  public status: number;

  public errors: any;

  constructor(status: number, message: string, errors: any = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(UNAUTHORIZED_ERROR, 'The user is not logged in');
  }

  static IncorrectRequest(message: string, errors: any = []) {
    return new ApiError(INCORRECT_DATA_ERROR, message, errors);
  }

  static NotFoundError() {
    return new ApiError(NOT_FOUND_ERROR, 'Data or pages not found');
  }

  static ConflictError() {
    return new ApiError(CONFLICT_ERROR, 'E-mail is not unique');
  }

  static ForbiddenError() {
    return new ApiError(FORBIDDEN_ERROR, 'Deleting other peoples cards is not available');
  }
}

export default ApiError;
