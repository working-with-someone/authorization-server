import prismaClient from '../database';

export const getApps = async (userId: number) => {
  const apps = await prismaClient.oauth_client.findMany({
    where: {
      user_id: userId,
    },
  });

  return apps;
};
