import { NextFunction, Request, Response } from 'express';

import OAuth from '../lib/api';

import { wwsError } from '../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import { Tokens } from '../lib/api/apiInterface';
import jwt from 'jsonwebtoken';
import prismaClient from '../database';
import asyncCatch from '../utils/asyncCatch';
import { isValidURL } from '../lib/url';

export const renderSignin = (req: Request, res: Response) => {
  const redirectURL = req.query.redirect_uri;

  res.cookie('redirect_uri', redirectURL);

  return res.render('signin');
};
export const renderSignup = (req: Request, res: Response) =>
  res.render('signup');

export const signup = (req: Request, res: Response) => {
  return res.send('good!');
};

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
  //get api interface
  const apiInterface = await OAuth[req.params.provider];

  //get authorization code from query parameters
  const authCode = req.query.code as string;

  //get access token from provider with authorization code
  const tokens: Tokens = await apiInterface.getTokens(authCode);

  //get profile from provider with acess token
  const profile = await apiInterface.getUserProfile(tokens.accessToken);

  //find oauth user with id of oauth profile
  let user = await prismaClient.user.findFirst({
    where: {
      oauth: {
        id: profile.id.toString(),
      },
    },
  });

  //if oauth user does not exist, create oauth user
  if (!user) {
    user = await prismaClient.user.create({
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

  //generate JWT with user profile
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
