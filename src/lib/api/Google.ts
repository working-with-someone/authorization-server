import { generateURL } from '../url';
import ApiInterface, { ApiInfo } from './apiInterface';
import axios, { AxiosRequestConfig } from 'axios';

interface googleAPIInfo extends ApiInfo {
  apiBaseUrl: string;
  authBaseUrl: string;
  accessTokenBaseUrl: string;
  redirectUrl: string;
  state: string;
}

class GoogleInterface extends ApiInterface {
  apiBaseUrl: string;
  authBaseUrl: string;
  accessTokenBaseUrl: string;
  redirectUrl: string;
  state: string;

  constructor(apiInfo: googleAPIInfo) {
    super(apiInfo);
    this.apiBaseUrl = apiInfo.apiBaseUrl;
    this.authBaseUrl = apiInfo.authBaseUrl;
    this.redirectUrl = apiInfo.redirectUrl;
    this.accessTokenBaseUrl = apiInfo.accessTokenBaseUrl;
    this.state = apiInfo.state;
  }

  get authCodeURL() {
    return generateURL(`${this.authBaseUrl}`, {
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUrl,
      scope: 'https://www.googleapis.com/auth/userinfo.profile',
      state: this.state,
    });
  }

  accessTokenURL(code: string) {
    return generateURL(this.accessTokenBaseUrl, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUrl,
    });
  }

  async getAccessToken(code: string) {
    const endpoint = this.accessTokenURL(code);

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
  }

  async getUserProfile(accessToken: string) {
    return 'ss';
  }
}

export default GoogleInterface;
