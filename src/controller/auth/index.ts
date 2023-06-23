import { Request, Response } from 'express';

export const renderSignin = (req: Request, res: Response) =>
  res.render('auth/signin');
export const renderSignup = (req: Request, res: Response) =>
  res.render('auth/signup');
