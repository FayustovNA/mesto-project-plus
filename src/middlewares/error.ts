import { Response, NextFunction, Request } from 'express';
import { Error } from "../types/type";
import ApiError from '../errors/api-err';


export default (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err)
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors })
  }
  return res.status(500).json({ message: 'Server error' })
};
