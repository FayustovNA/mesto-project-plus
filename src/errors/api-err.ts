// import { Error } from "../types/type";

class ApiError extends Error {
  public status: number;
  public errors: any;

  constructor(status: number, message: string, errors: any = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(401, 'The user is not logged in')
  }

  static IncorrectRequest(message: string, errors: any = []) {
    return new ApiError(400, message, errors)
  }

  static NotFoundError() {
    return new ApiError(404, 'Data not found')
  }
}

export default ApiError;

