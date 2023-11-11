import { Request, Response } from 'express';
import asyncCatch from '../utils/asyncCatch';
import { appService } from '../services';

export const getApps = asyncCatch(async (req: Request, res: Response) => {
  const apps = await appService.getApps(res.locals.user.id);

  return res.json(apps);
});
