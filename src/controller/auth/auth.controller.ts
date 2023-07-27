import { NextFunction, Request, Response } from 'express';

import OAuth from '../../lib/api';

import { wwsError } from '../../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import { Tokens } from '../../lib/api/apiInterface';
import jwt from 'jsonwebtoken';
import prisma from '../../database';
import asyncCatch from '../../utils/asyncCatch';
import { isValidURL } from '../../lib/url';

export const renderSignin = (req: Request, res: Response) => {
  const redirectURL = req.query.redirect_uri;

  res.cookie('redirect_uri', redirectURL);

  return res.render('signin');
};
export const renderSignup = (req: Request, res: Response) =>
  res.render('signup');

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

export const codeCallback = asyncCatch(async (req: Request, res: Response) => {
  const apiInterface = await OAuth[req.params.provider];

  const authCode = req.query.code as string;
  const tokens: Tokens = await apiInterface.getTokens(authCode);

  const profile = await apiInterface.getUserProfile(tokens.accessToken);

  let user = await prisma.user.findFirst({
    where: {
      oauth: {
        id: profile.id.toString(),
      },
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: profile.username,
        pfp: profile.pfp,
        oauth: {
          create: {
            provider: req.params.provider,
            id: profile.id.toString(),
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
          },
        },
      },
    });
  }

  const userToken = jwt.sign(profile, process.env.TOKEN_USER_SECRET as string, {
    algorithm: 'HS512',
  });

  if (
    isValidURL(req.cookies.redirect_uri, ['http', 'https', 'wwsp', 'wwsp-dev'])
  ) {
    const redirectURL = new URL(req.cookies.redirect_uri);

    res.clearCookie('redirect_uri');

    redirectURL.searchParams.append('jwt', userToken);

    return res.redirect(redirectURL.toString());
  } else {
    return res.redirect('/');
  }
});

export const signout = asyncCatch(async (req: Request, res: Response) => {
  res.clearCookie('user');
  return res.redirect('/auth/signin');
});
