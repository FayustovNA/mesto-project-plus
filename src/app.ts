import express from 'express';
import mongoose from 'mongoose';
import router from './routes/index';
import { Response } from 'express';
import { IRequest } from './types/type';
import { requestLogger, errorLogger } from './middlewares/logger';
import { errors } from 'celebrate';
import { login, createUser } from './controllers/users';
import auth from './middlewares/auth';
import helmet from "helmet";
import errorsMiddleware from './middlewares/error';
import { isUrlAvatar } from './utils/config';

const rateLimit = require('express-rate-limit');
const { celebrate, Joi, Segments } = require('celebrate');
const { PORT = 3000 } = process.env;

const app = express();
app.use(express.json());

app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // за 15 минут
  max: 100 // можно совершить максимум 100 запросов с одного IP
});

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(requestLogger); // подключаем логер запросов

// подключаем rate-limiter
app.use(limiter);

app.post('/signin', celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}),
  login);

app.post('/signup', celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(200),
    avatar: Joi.string().pattern(isUrlAvatar),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

app.use(auth);
app.use("/", router);
app.use(errorLogger); // подключаем логер ошибок
app.use(errors());
app.use(errorsMiddleware);

app.listen(PORT, () => console.log('start on port ' + PORT));



