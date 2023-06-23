import { Request, Response } from 'express';

export const renderHome = (req: Request, res: Response) =>
  res.sendFile(`${process.cwd()}/wws-client/public/index.html`);
