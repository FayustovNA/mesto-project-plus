
import { Request, Response } from 'express';

export interface IRequest extends Request { user?: { _id: string; }; }

export type Error = {
  status: number;
  message: string;
  errors: any;
};