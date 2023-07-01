export interface ApiInfo {
  clientId: string;
  clientSecret: string;
}

abstract class ApiInterface {
  //properties
  clientId: string;
  clientSecret: string;

  //getter
  abstract authCodeURL: string;

  //methods
  abstract accessTokenURL(code: string): string;
  private abstract getAccessToken(code: string): Promise<string>;
  abstract getUserProfile(accessToken: string): Promise<string>;

  constructor(apiInfo: ApiInfo) {
    this.clientId = apiInfo.clientId;
    this.clientSecret = apiInfo.clientSecret;
  }
}

export default ApiInterface;
