import mongoose from 'mongoose';
import { isUrlImg } from '../utils/config';

interface ICard {
  name: string;
  link: string;
  owner: mongoose.Schema.Types.ObjectId;
  likes: mongoose.Schema.Types.ObjectId[];
  createdAt: mongoose.Schema.Types.Date;
}

const cardSchema = new mongoose.Schema<ICard>({
  name: { // название карточки — опишем требования в схеме:
    type: String, // название — это строка
    required: true, // обязательное поле
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String, // ссылка — это строка
    required: true, // обязательное поле
    validate: {
      validator: (imgLink: any) => isUrlImg.test(imgLink),
      message: 'Неправильный формат ccылки',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId, // ссылка - это автор карточки
    ref: 'user',
    required: true, // обязательное поле
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId], // список лайкнувших пост пользователей
    ref: 'user',
    default: [],
  },
  createdAt: {
    type: Date, // дата создания
    default: Date.now,
  },
});

export default mongoose.model('card', cardSchema);
