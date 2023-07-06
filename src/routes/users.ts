import { Router, NextFunction, Request, Response, } from 'express';
import { getUsers, getUserById, updateAvatar, updateUser, getActieveUsers } from '../controllers/users';
import { isUrlAvatar } from '../utils/config';

const { celebrate, Joi, Segments } = require('celebrate');
const usersRouter = Router();

usersRouter.get("/", getUsers);

usersRouter.get("/:userId", celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    userId: Joi.string().required(),
  }),
}), getUserById);

usersRouter.get("/me", getActieveUsers);

usersRouter.patch("/me", celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(200).required(),
  }),
}), updateUser);

usersRouter.patch("/me/avatar", celebrate({
  [Segments.BODY]: Joi.object().keys({
    avatar: Joi.string().pattern(isUrlAvatar).required(),
  }),
}),
  updateAvatar);

export default usersRouter;