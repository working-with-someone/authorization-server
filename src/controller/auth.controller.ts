import { Request, Response } from 'express';

import OAuth from '../lib/api';
import { Tokens } from '../lib/api/apiInterface';
import jwt from 'jsonwebtoken';
import asyncCatch from '../utils/asyncCatch';
import { isValidURL } from '../lib/url';
import { userSerivce } from '../services';

export const renderSignin = asyncCatch((req: Request, res: Response) => {
  const redirectURL = req.query.redirect_uri;

  res.cookie('redirect_uri', redirectURL);

  return res.render('signin');
});

export const renderSignup = asyncCatch((req: Request, res: Response) => {
  return res.render('signup');
});

export const signup = asyncCatch(async (req: Request, res: Response) => {
  const { username, password, email } = req.body;

  const user = await userSerivce.createLocalUser({
    username,
    email,
    password,
  });

  return res.send(user);
});

export const redirectToAuth = asyncCatch((req: Request, res: Response) => {
  return res.redirect(OAuth[req.params.provider].authCodeURL);
});

export const codeCallback = asyncCatch(async (req: Request, res: Response) => {
  //get api interface
  const apiInterface = await OAuth[req.params.provider];

  //get authorization code from query parameters
  const authCode = req.query.code as string;

  //get access token from provider with authorization code
  const tokens: Tokens = await apiInterface.getTokens(authCode);

  //get profile from provider with acess token
  const profile = await apiInterface.getUserProfile(tokens.accessToken);

  const user = await userSerivce.createOrGetOauthUser({
    username: profile.username,
    pfp: profile.pfp,

    provider: req.params.provider,
    id: profile.id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });

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
