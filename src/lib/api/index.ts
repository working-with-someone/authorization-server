import GithubInterface from './Github';

export const Github = new GithubInterface({
  clientId: process.env.GITHUB_CLIENT_ID as string,
  clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  apiBaseUrl: 'https://api.github.com',
  authBaseUrl: 'https://github.com/login/oauth/',
  redirectUrl: `${process.env.SERVER_URL}/auth/github/callback/code`,
  state: process.env.APP_SECRET as string,
});
