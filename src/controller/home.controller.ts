import { Request, Response } from 'express';
import asyncCatch from '../utils/asyncCatch';

export const renderHome = asyncCatch(async (req: Request, res: Response) => {
  return res.render('home');
});
