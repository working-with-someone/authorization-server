import prismaClient from '../database';
import HttpStatusCode from 'http-status-codes';
import { wwsError } from '../error/wwsError';

export const getApp = async (userId: number, appId: string) => {
  const app = await prismaClient.oauth_client.findFirst({
    where: {
      user_id: userId,
      client_id: appId,
    },
  });

  if (!app) {
    throw new wwsError(
      HttpStatusCode.NOT_FOUND,
      HttpStatusCode.getStatusText(HttpStatusCode.NOT_FOUND)
    );
  }

  return app;
};

export const getApps = async (userId: number) => {
  const apps = await prismaClient.oauth_client.findMany({
    where: {
      user_id: userId,
    },
  });

  return apps;
};
