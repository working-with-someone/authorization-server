declare namespace Express {
  interface Request {
    user: {
      id: number;
      username: string;
      pfp: string;
      email: string;
    };
  }
}
