import { Request, Response } from 'express';
import asyncCatch from '../utils/asyncCatch';
import { clientService } from '../services';

export const getClient = asyncCatch(async (req: Request, res: Response) => {
  const client = await clientService.getClient(
    res.locals.user.id,
    req.params.clientId
  );

  return res.json(client);
});

export const getClients = asyncCatch(async (req: Request, res: Response) => {
  const clients = await clientService.getClients(res.locals.user.id);

  return res.json(clients);
});
