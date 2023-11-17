import prismaClient from '../database';
import HttpStatusCode from 'http-status-codes';
import { wwsError } from '../error/wwsError';

export const getClient = async (userId: number, clientId: string) => {
  const client = await prismaClient.oauth_client.findFirst({
    where: {
      user_id: userId,
      client_id: clientId,
    },
  });

  if (!client) {
    throw new wwsError(
      HttpStatusCode.NOT_FOUND,
      HttpStatusCode.getStatusText(HttpStatusCode.NOT_FOUND)
    );
  }

  return client;
};

export const getClients = async (userId: number) => {
  const clients = await prismaClient.oauth_client.findMany({
    where: {
      user_id: userId,
    },
  });

  return clients;
};
