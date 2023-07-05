export interface ApiInfo {
  clientId: string;
  clientSecret: string;
}

export interface UserProfile {
  id: string;
  username: string;
  pfp: string;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

abstract class ApiInterface {
  //properties
  clientId: string;
  clientSecret: string;

  //getter
  abstract authCodeURL: string;

  //methods
  abstract tokenURL(code: string): string;
  abstract getTokens(code: string): Promise<Tokens>;
  abstract getUserProfile(accessToken: string): Promise<UserProfile>;

  constructor(apiInfo: ApiInfo) {
    this.clientId = apiInfo.clientId;
    this.clientSecret = apiInfo.clientSecret;
  }
}

export default ApiInterface;
