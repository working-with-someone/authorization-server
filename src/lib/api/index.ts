import GithubInterface from './Github';
import GoogleInterface from './Google';
import KakaoInterface from './Kakao';
import ApiInterface from './apiInterface';

type Oauths = {
  [key in string]: ApiInterface;
};

const Github = new GithubInterface({
  clientId: process.env.GITHUB_CLIENT_ID as string,
  clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  apiBaseUrl: 'https://api.github.com',
  authBaseUrl: 'https://github.com/login/oauth/',
  redirectUrl: `${process.env.SERVER_URL}/auth/github/callback/code`,
  state: process.env.APP_SECRET as string,
});

const Google = new GoogleInterface({
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  apiBaseUrl: 'https://www.googleapis.com',
  authBaseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  accessTokenBaseUrl: 'https://oauth2.googleapis.com/token',
  redirectUrl: `${process.env.SERVER_URL}/auth/google/callback/code`,
  state: process.env.APP_SECRET as string,
});

const Kakao = new KakaoInterface({
  clientId: process.env.kakao_CLIENT_ID as string,
  clientSecret: process.env.kakao_CLIENT_SECRET as string,
  apiBaseUrl: 'https://www.kakaoapis.com',
  authBaseUrl: 'https://kauth.kakao.com/oauth',
  redirectUrl: `${process.env.SERVER_URL}/auth/kakao/callback/code`,
  state: process.env.APP_SECRET as string,
});

const OAuths: Oauths = { github: Github, google: Google, kakao: Kakao };

export default OAuths;
