import {
  Response,
  Request,
} from 'express';
import { Error } from '../types/type';
import ApiError from '../errors/api-err';

const { SERVER_ERROR } = require('../errors/config-err');

export default (err: Error, req: Request, res: Response) => {
  console.log(err);
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }
  return res.status(SERVER_ERROR).json({ message: 'Server error' });
};
