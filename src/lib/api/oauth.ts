import apiEndpointGenerator from './endpoints';
import axios, { AxiosRequestConfig } from 'axios';

interface OAuth {
  authURL: string;
  getAccessToken(code: string): Promise<any>;
}

const OAuthFactory = (provider: string): OAuth => {
  const p = provider;

  return {
    authURL: apiEndpointGenerator[p].authURL(),
    getAccessToken: async (code: string) => {
      const endpoint = apiEndpointGenerator[p].accessTokenURL(code);
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
