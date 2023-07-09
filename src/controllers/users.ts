import {
  NextFunction,
  Request,
  Response,
} from 'express';
import { Error } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import userModel from '../models/user';
import { IRequest } from '../types/type';
import JWT_SECRET from '../utils/crypto';
import ApiError from '../errors/api-err';

// Создаём пользователя - регистрируемся
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcryptjs.hash(password, 10)
    .then((hash: string) => userModel.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        data: {
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          email: user.email,
          _id: user._id,
        },
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(ApiError.IncorrectRequest(err));
      } else if (err.code === 11000) {
        next(
          ApiError.ConflictError(),
        );
      } else {
        next(err);
      }
    });
};

// Логирование
export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  userModel.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' }),
        // user
      });
    })
    .catch(next);
};

// Возвращаем всех пользователей
export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  userModel
    .find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => next(err));
};

// Возвращаем пользователя по _id
export const getUserById = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) {
      return next(ApiError.NotFoundError());
    }
    return res.json({ data: user });
  } catch (err) {
    if (err instanceof Error.CastError) {
      return next(ApiError.IncorrectRequest('Incorrect user data'));
    }
    return next(err);
  }
};

// Возвращаем текущего пользователя
export const getActieveUsers = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const activeUserId = req.user?._id;
    const user = await userModel.findById(activeUserId);
    if (!user) {
      return next(ApiError.NotFoundError());
    }
    return res.json({ data: user });
  } catch (err) {
    if (err instanceof Error.CastError) {
      return next(ApiError.IncorrectRequest('Incorrect user data'));
    }
    return next(err);
  }
};

// Обновляем профиль
export const updateUser = async (req: IRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { name, about } = req.body;
  userModel.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .orFail(() => ApiError.NotFoundError())
    .then((user) => res.send({ data: { user } }))
    .catch((err) => {
      if (err instanceof Error.ValidationError) {
        next(ApiError.IncorrectRequest('Incorrect data for user update'));
      } else {
        next(err);
      }
    });
};

// Обновляем аватар
export const updateAvatar = async (req: IRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { avatar } = req.body;
  userModel.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .orFail(() => ApiError.NotFoundError())
    .then((user) => res.send({ data: { user } }))
    .catch((err) => {
      if (err instanceof Error.ValidationError) {
        next(ApiError.IncorrectRequest('Incorrect data for avatar of user update'));
      } else {
        next(err);
      }
    });
};
