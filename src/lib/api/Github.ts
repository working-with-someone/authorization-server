import { generateURL } from '../url';
import ApiInterface, { ApiInfo } from './apiInterface';
import axios, { AxiosRequestConfig } from 'axios';

interface githubAPIInfo extends ApiInfo {
  apiBaseUrl: string;
  authBaseUrl: string;
  redirectUrl: string;
  state: string;
}

class GithubInterface extends ApiInterface {
  apiBaseUrl: string;
  authBaseUrl: string;
  redirectUrl: string;
  state: string;

  constructor(apiInfo: githubAPIInfo) {
    super(apiInfo);
    this.apiBaseUrl = apiInfo.apiBaseUrl;
    this.authBaseUrl = apiInfo.authBaseUrl;
    this.redirectUrl = apiInfo.redirectUrl;
    this.state = apiInfo.state;
  }

  get authCodeURL() {
    return generateURL(`${this.authBaseUrl}/authorize`, {
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUrl,
      state: this.state,
    });
  }

  accessTokenURL(code: string) {
    return generateURL(`${this.authBaseUrl}/access_token`, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
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

export default GithubInterface;
