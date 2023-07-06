import { Request, Response, NextFunction } from 'express';
import cardModel from '../models/card';
import { IRequest } from '../types/type';
import ApiError from '../errors/api-err';
import { Error } from 'mongoose';

//Возвращаем все карточки
export const getCards = (req: Request, res: Response) => {
  return cardModel
    .find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'Server error' }));
};

//Создаем карточку
export const createCard = (req: IRequest, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  const owner = req.user?._id;
  return cardModel.create({ name, link, owner })
    .then((card) => res.send({
      data: card
    }))
    .catch((err) => {
      if (err instanceof Error.ValidationError) {
        next(ApiError.IncorrectRequest('Incorrect card data'));
      } else {
        next(err);
      }
    });
}

//Удаляем карточку по идентификатору
export const deleteCardById = async (req: IRequest, res: Response, next: NextFunction
) => {
  try {
    const { cardId } = req.params;
    const card = await cardModel.findById(cardId);
    if (!card) {
      return ApiError.NotFoundError();
    }
    await card.deleteOne();
    res.status(200).send({ data: card });
  } catch (err) {
    if (err instanceof Error.CastError) {
      next(ApiError.IncorrectRequest('Incorrect card data'));
    } else {
      next(err);
    }
  }
}

//Ставим лайк карточке
export const likeCard = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { cardId } = req.params;
  cardModel.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user?._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => ApiError.NotFoundError())
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err instanceof Error.CastError) {
        next(ApiError.IncorrectRequest('Incorrect card data'));
      } else {
        next(err);
      }
    });
};

//Убираем лайк карточке
export const dislikeCard = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { cardId } = req.params;
  cardModel.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user?._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => ApiError.NotFoundError())
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err instanceof Error.CastError) {
        next(ApiError.IncorrectRequest('Incorrect card data'));
      } else {
        next(err);
      }
    });
};