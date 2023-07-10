import { NextFunction, Request, Response } from 'express';

import OAuth from '../../lib/api';

import { wwsError } from '../../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import { User, Oauth, Local } from '../../database/models/User';
import sequelize from '../../database';
import { Tokens } from '../../lib/api/apiInterface';
import jwt from 'jsonwebtoken';

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

    const user = (await User.findOne({ where: { id: oauth.userId } })) as User;

    const userToken = jwt.sign(
      user.toJSON(),
      process.env.TOKEN_USER_SECRET as string,
      {
        algorithm: 'HS512',
      }
    );

    res.cookie('user', userToken);

    await transaction.commit();
    return res.redirect('/');
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
