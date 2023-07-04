export interface ApiInfo {
  clientId: string;
  clientSecret: string;
}

export interface UserProfile {
  id: string;
  username: string;
  pfp: string;
}

abstract class ApiInterface {
  //properties
  clientId: string;
  clientSecret: string;

  //getter
  abstract authCodeURL: string;

  //methods
  abstract accessTokenURL(code: string): string;
  abstract getAccessToken(code: string): Promise<string>;
  abstract getUserProfile(accessToken: string): Promise<UserProfile> | any;

  constructor(apiInfo: ApiInfo) {
    this.clientId = apiInfo.clientId;
    this.clientSecret = apiInfo.clientSecret;
  }
}

export default ApiInterface;
