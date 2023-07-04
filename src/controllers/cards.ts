import { Request, Response } from 'express';
import cardModel from '../models/card';
import { IRequest } from '../types/type';
import ApiError from '../errors/api-err';

//Возвращаем все карточки
export const getCards = (req: Request, res: Response) => {
  return cardModel
    .find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'Server error' }));
};

//Создаем карточку
export const createCard = (req: IRequest, res: Response) => {
  const { name, link } = req.body;
  const owner = req.user?._id;
  return cardModel.create({ name, link, owner })
    .then((card) => res.send({
      data: card
    }))
    .catch(() => res.status(500).send({ message: 'Server error' }));
}

//Удаляем карточку по идентификатору
export const deleteCardById = async (req: IRequest, res: Response,
) => {
  try {
    const { cardId } = req.params;
    const card = await cardModel.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    await card.deleteOne();
    res.status(200).send({ data: card });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

//Ставим лайк карточке
export const likeCard = async (
  req: IRequest,
  res: Response
) => {
  const { cardId } = req.params;
  cardModel.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user?._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => res.status(500).send({ message: 'Error adding like', error: err.message }));
};

//Убираем лайк карточке
export const dislikeCard = async (
  req: IRequest,
  res: Response
) => {
  const { cardId } = req.params;
  cardModel.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user?._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => res.status(500).send({ message: 'Error dislike', error: err.message }));
};