import { Request, Response } from 'express';
import asyncCatch from '../utils/asyncCatch';
import { clientService } from '../services';

export const getClient = asyncCatch(async (req: Request, res: Response) => {
  const client = await clientService.getClient(
    req.user.id,
    req.params.clientId
  );

  return res.json(client);
});

export const getClients = asyncCatch(async (req: Request, res: Response) => {
  const clients = await clientService.getClients(req.user.id);

  return res.json(clients);
});

export const createClient = asyncCatch(async (req: Request, res: Response) => {
  const client = await clientService.createClient({
    userId: req.user.id,
    name: req.body.name,
    uri: req.body.uri,
    file: req.file,
  });

  return res.status(201).json(client);
});
