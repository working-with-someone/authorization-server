import { generateURL } from '../url';
import ApiInterface, { ApiInfo, UserProfile, Tokens } from './apiInterface';
import axios, { AxiosRequestConfig } from 'axios';

interface kakaoAPIInfo extends ApiInfo {
  apiBaseUrl: string;
  authBaseUrl: string;
  redirectUrl: string;
  state: string;
}

class KakaoInterface extends ApiInterface {
  apiBaseUrl: string;
  authBaseUrl: string;
  redirectUrl: string;
  state: string;

  constructor(apiInfo: kakaoAPIInfo) {
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

  tokenURL(code: string) {
    return generateURL(`${this.authBaseUrl}/token`, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUrl,
      grant_type: 'authorization_code',
    });
  }

  async getTokens(code: string) {
    const endpoint = this.tokenURL(code);

    const reqConfig: AxiosRequestConfig = {
      url: endpoint,
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    };

    const response = await axios(reqConfig);

    const tokens: Tokens = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };

    return tokens;
  }

  async getUserProfile(accessToken: string) {
    const endpoint = generateURL(`${this.apiBaseUrl}/v2/user/me`);

    const reqConfig: AxiosRequestConfig = {
      url: endpoint,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    };

    const response = await axios(reqConfig);

    const data = response.data;

    const profile: UserProfile = {
      id: data.id,
      username: data.properties.nickname,
      pfp: data.properties.profile_image,
    };

    return profile;
  }
}

export default KakaoInterface;
