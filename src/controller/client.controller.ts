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
    client_name: req.body.client_name,
    client_uri: req.body.client_uri,
    file: req.file,
  });

  return res.status(201).json(client);
});

export const updateClient = asyncCatch(async (req: Request, res: Response) => {
  const updatedClient = await clientService.updateClient({
    userId: req.user.id,
    client_id: req.params.clientId,
    client_name: req.body.client_name,
    client_uri: req.body.client_uri,
    file: req.file,
    logo_update_option: req.body.logo_update_option,
    redirect_uri: [
      req.body?.redirect_uri1,
      req.body?.redirect_uri2,
      req.body?.redirect_uri3,
      req.body?.redirect_uri4,
      req.body?.redirect_uri5,
    ],
  });

  return res.json(updatedClient);
});

export const deleteClient = asyncCatch(async (req: Request, res: Response) => {
  await clientService.deleteClient(req.user.id, req.params.clientId);

  return res.status(204).end();
});

export const refreshClientSecret = asyncCatch(
  async (req: Request, res: Response) => {
    const updatedClient = await clientService.refreshClientSecret(
      req.user.id,
      req.params.clientId
    );

    // omitted response status code mean 200
    return res.json(updatedClient);
  }
);
