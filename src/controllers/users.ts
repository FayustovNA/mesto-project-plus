import { NextFunction, Request, Response } from 'express';
import userModel from '../models/user';
import bcryptjs from 'bcryptjs';
import { IRequest } from '../types/type';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/crypto';
import ApiError from '../errors/api-err';

//Создаём пользователя - регистрируемся
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, about, avatar, email, password } = req.body;

  bcryptjs.hash(req.body.password, 10)
    .then((hash: string) => userModel.create({ name, about, avatar, email, password: hash }))
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
          ApiError.IncorrectRequest(`The user with this ${email} exists`),
        );
      } else {
        next(err);
      }
    });
};

//Логирование
export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  userModel.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' }),
        // user
      })
    })
    .catch(next);
};

//Возвращаем всех пользователей
export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  return userModel
    .find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Server error' }));
};

//Возвращаем пользователя по _id
export const getUserById = async (req: IRequest, res: Response, next: NextFunction
) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return next(ApiError.NotFoundError());
    }
    return res.json({ data: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//Возвращаем текущего пользователя
export const getActieveUsers = async (req: IRequest, res: Response, next: NextFunction) => {
  const activeUserId = req.user?._id;
  const user = await userModel.findById(activeUserId);
  if (!user) {
    return next(ApiError.NotFoundError());
  }
  return res.json({ data: user });
};

// Обновляем профиль
export const updateUser = async (req: IRequest, res: Response) => {
  const userId = req.user?._id;
  const { name, about } = req.body;
  userModel.findByIdAndUpdate(userId, { name: name, about: about }, { new: true })   // обновим имя и описание найденного по _id пользователя
    .then((user) => res.send({ data: { user } }))
    .catch(() => res.status(500).send({ message: 'Server error' }));
};

// Обновляем аватар
export const updateAvatar = async (req: IRequest, res: Response) => {
  const userId = req.user?._id;
  const { avatar } = req.body;
  userModel.findByIdAndUpdate(userId, { avatar: avatar }, { new: true })   // обновим аватар найденного по _id пользователя
    .then((user) => res.send({ data: { user } }))
    .catch(() => res.status(500).send({ message: 'Server error' }));
}