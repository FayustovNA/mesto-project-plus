import { Router } from 'express';
import { getCards, createCard, deleteCardById, likeCard, dislikeCard } from '../controllers/cards';
import { isUrlImg } from '../utils/config'

const { celebrate, Joi, Segments } = require('celebrate');
const cardsRouter = Router();

cardsRouter.get("/", getCards);

cardsRouter.post("/", celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().pattern(new RegExp(isUrlImg)).required(),
  }),
}), createCard);

cardsRouter.delete("/:cardId", celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    cardId: Joi.string().required(),
  }),
}), deleteCardById);

cardsRouter.put("/:cardId/likes", celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    cardId: Joi.string().required(),
  }),
}), likeCard);

cardsRouter.delete("/:cardId/likes", celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    cardId: Joi.string().required(),
  }),
}), dislikeCard);

export default cardsRouter;
