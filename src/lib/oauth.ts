import { generateURL } from './url';
import axios, { AxiosRequestConfig } from 'axios';

interface generator {
  authURL: () => string;
  accessTokenURL: (code: string) => string;
}

const oauthEndpointGenerator: Record<string, generator> = {
  github: {
    authURL: () =>
      generateURL('https://github.com/login/oauth/authorize', {
        client_id: process.env.GITHUB_CLIENT_ID,
        response_type: 'code',
        redirect_uri: `${process.env.SERVER_URL}/auth/github/callback/code`,
        state: process.env.APP_SECRET,
      }),
    accessTokenURL: (code) =>
      generateURL('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_SECRET_KEY,
        code,
        redirect_uri: `${process.env.SERVER_URL}/auth/github/callback/token`,
      }),
  },
  google: {
    authURL: () =>
      generateURL('https://accounts.google.com/o/oauth2/v2/auth', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        response_type: 'code',
        state: process.env.APP_SECRET,
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
        redirect_uri: `${process.env.SERVER_URL}/auth/google/callback/code`,
      }),

    accessTokenURL: (code) =>
      generateURL('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.SERVER_URL}/auth/google/callback/code`,
      }),
  },
  kakao: {
    authURL: () =>
      generateURL('https://kauth.kakao.com/oauth/authorize', {
        client_id: process.env.kAKAO_CLIENT_ID,
        response_type: 'code',
        redirect_uri: `${process.env.SERVER_URL}/auth/kakao/callback/code`,
        state: process.env.APP_SECRET,
      }),
    accessTokenURL: (code) =>
      generateURL('https://kauth.kakao.com/oauth/token', {
        client_id: process.env.kAKAO_CLIENT_ID,
        client_secret: process.env.kAKAO_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.SERVER_URL}/auth/kakao/callback/code`,
      }),
  },
};

interface OAuth {
  authURL: string;
  getAccessToken(code: string): Promise<any>;
}

const OAuthFactory = (provider: string): OAuth => {
  const p = provider;

  return {
    authURL: oauthEndpointGenerator[p].authURL(),
    getAccessToken: async (code: string) => {
      const endpoint = oauthEndpointGenerator[p].accessTokenURL(code);
      const reqConfig: AxiosRequestConfig = {
        url: endpoint,
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      };

      const response = await axios(reqConfig);

      const accessToken = response.data.access_token;
      return accessToken;
    },
  };
};

type OAuths = {
  [key in string]: OAuth;
};

const OAuths: OAuths = {
  github: OAuthFactory('github'),
  google: OAuthFactory('google'),
  kakao: OAuthFactory('kakao'),
};

export default OAuths;
