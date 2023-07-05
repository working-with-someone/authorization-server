import { NextFunction, Request, Response } from 'express';

import OAuth from '../../lib/api';

import { wwsError } from '../../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import { User, Oauth, Local } from '../../database/models/User';
import sequelize from '../../database';
import { Tokens } from '../../lib/api/apiInterface';

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
  const transaction = await sequelize.transaction();
  try {
    const apiInterface = await OAuth[req.params.provider];

    const authCode = req.query.code as string;
    const tokens: Tokens = await apiInterface.getTokens(authCode);

    const profile = await apiInterface.getUserProfile(tokens.accessToken);

    let oauth = await Oauth.findOne({ where: { id: profile.id } });

    if (!oauth) {
      const user = await User.create(
        {
          username: profile.username,
          pfp: profile.pfp,
        },
        { transaction }
      );

      oauth = await user.createOauth(
        {
          provider: req.params.provider,
          id: profile.id,
          ...tokens,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const user = await User.findOne({ where: { id: oauth.userId } });

    return res.send(user);
  } catch (err) {
    await transaction.rollback();
    next(
      new wwsError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        'Problems processing Oauth',
        err
      )
    );
  }
};
