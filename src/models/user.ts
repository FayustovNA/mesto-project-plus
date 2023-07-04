import { model, Model, Schema, Document, HydratedDocument } from 'mongoose';
import validator from 'validator';
import bcryptjs from 'bcryptjs';
import ApiError from '../errors/api-err';

interface IUser {
  name?: string;
  about?: string;
  avatar?: string;
  email: string;
  password: string;
}

interface UserModel extends Model<IUser> {
  findUserByCredentials: (email: string, password: string) => Promise<Document<unknown, any, IUser>>
}

const userSchema = new Schema<IUser, UserModel>({
  name: { // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    required: true, // обязательное поле
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String, // о пользователе — это строка
    required: true, // обязательное поле
    minlength: 2,
    maxlength: 200,
    default: 'Исследователь',
  },
  avatar: {
    type: String, // ссылка — это строка
    required: true, // обязательное полеs
    validate: {
      validator: (urlAvatar: any) => validator.isURL(urlAvatar),
      message: 'Неправильный формат ccылки',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String, // почта — это строка
    required: true, // обязательное поле
    unique: true,
    validate: {
      validator: (email: any) => validator.isEmail(email),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String, // пароль — это строка
    required: true, // обязательное поле
    select: false,
  }
});

// export default mongoose.model('user', userSchema);


userSchema.static('findUserByCredentials', function findUserByCredentials(email: string, password: string) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        // return Promise.reject(new Error('Неправильные почта или пароль'));
        throw ApiError.UnauthorizedError();
      }
      return bcryptjs.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw ApiError.IncorrectRequest('Incorrect password or e-mail');
        }
        return user;
      });
    });
});

export default model<IUser, UserModel>('user', userSchema);