import {
  Request,
  Response,
  NextFunction,
} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import JWT_SECRET from '../utils/crypto';
import ApiError from '../errors/api-err';

interface SessionRequest extends Request {
  user?: string | JwtPayload;
}

const extractBearerToken = (header: string) => {
  return header.replace('Bearer ', '');
};

export default (req: SessionRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(ApiError.UnauthorizedError);
    return;
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    next(ApiError.UnauthorizedError());
  }

  req.user = payload as { _id: JwtPayload }; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
