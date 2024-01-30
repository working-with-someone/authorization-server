import { Request, Response } from 'express';
import asyncCatch from '../utils/asyncCatch';
import { userService } from '../services';

export const renderLogin = asyncCatch((req: Request, res: Response) => {
  return res.render('login');
});

export const login = asyncCatch(async (req: Request, res: Response) => {
  const user = await userService.loginUser(req.body);

  req.session.userId = user.id;

  const continueURL = new URL(req.body.continue);

  return res.redirect(continueURL.toString());
});

export const renderSignup = asyncCatch((req: Request, res: Response) => {
  return res.render('signup');
});

export const signup = asyncCatch(async (req: Request, res: Response) => {
  await userService.createUser(req.body);

  return res.render('signup-success');
});

export const verify = asyncCatch(async (req: Request, res: Response) => {
  const { user_id, token } = req.query;

  await userService.verifyUser(parseInt(user_id as string), token as string);

  return res.render('verification-success');
});
