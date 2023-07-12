import { NextFunction, Request, Response } from 'express';

import OAuth from '../../lib/api';

import { wwsError } from '../../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import { Tokens } from '../../lib/api/apiInterface';
import jwt from 'jsonwebtoken';
import prisma from '../../database';

export const renderSignin = (req: Request, res: Response) =>
  res.render('signin');
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

export const codeCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiInterface = await OAuth[req.params.provider];

    const authCode = req.query.code as string;
    const tokens: Tokens = await apiInterface.getTokens(authCode);

    const profile = await apiInterface.getUserProfile(tokens.accessToken);

    let user = await prisma.user.findFirst({
      where: {
        oauth: {
          is: {
            id: profile.id,
          },
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
              id: profile.id,
              access_token: tokens.accessToken,
              refresh_token: tokens.refreshToken,
            },
          },
        },
      });
    }

    const userToken = jwt.sign(
      profile,
      process.env.TOKEN_USER_SECRET as string,
      {
        algorithm: 'HS512',
      }
    );

    res.cookie('user', userToken);

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
