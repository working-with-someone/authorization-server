import { NextFunction, Request, Response } from 'express';

import OAuth from '../../lib/api';

import { wwsError } from '../../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import { User, Oauth, Local } from '../../database/models/User';

export const renderSignin = (req: Request, res: Response) =>
  res.render('auth/signin');
export const renderSignup = (req: Request, res: Response) =>
  res.render('auth/signup');

export const redirectToAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.redirect(OAuth[req.params.provider].authCodeURL);
  } catch (err) {
    next(
      new wwsError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        'Problems moving to the consent screen',
        err
      )
    );
  }
};

export const codeCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiInterface = await OAuth[req.params.provider];

    const authCode = req.query.code as string;
    const { access_token, refresh_token, expires_in } =
      await apiInterface.getTokens(authCode);

    const profile = await apiInterface.getUserProfile(access_token);

    return res.send(profile);
  } catch (err) {
    next(
      new wwsError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        'Problems processing Oauth',
        err
      )
    );
  }
};
