import { Router, NextFunction, Request, Response } from 'express';
import ApiError from '../errors/api-err';
import usersRouter from './users';
import cardsRouter from './cards';

const router = Router();

router.use("/users", usersRouter);
router.use("/cards", cardsRouter);

router.use((req: Request, res: Response, next: NextFunction) => {
  next(ApiError.NotFoundError());
});

export default router;

