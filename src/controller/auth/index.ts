import { Request, Response } from 'express';
import OAuth from '../../lib/oauth';

export const renderSignin = (req: Request, res: Response) =>
  res.render('auth/signin');
export const renderSignup = (req: Request, res: Response) =>
  res.render('auth/signup');
export const redirectToAuth = (req: Request, res: Response) => {
  return res.redirect(OAuth[req.params.provider].authURL);
};

export const codeCallback = async (req: Request, res: Response) => {
  const authCode = req.query.code as string;
  const accessToken = await OAuth[req.params.provider].getAccessToken(authCode);

  return res.send(accessToken);
};
