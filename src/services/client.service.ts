import prismaClient from '../database';
import HttpStatusCode from 'http-status-codes';
import { wwsError } from '../error/wwsError';
import SHA3 from 'sha3';
import { v4 } from 'uuid';
import { servingURL } from '../config/path.config';
import { ClientCreationInput, PublicClientInfo } from '../@types/client';
import pick from '../utils/pick';

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

  return getPublicClientInfo(client);
};

export const getClients = async (userId: number) => {
  const clients = await prismaClient.oauth_client.findMany({
    where: {
      user_id: userId,
    },
  });

  return clients.map((client) => getPublicClientInfo(client));
};

export const createClient = async (
  input: ClientCreationInput
): Promise<PublicClientInfo> => {
  let clientId;
  let logoUri;

  //if file uploaded
  if (input.file) {
    //clientId will be uuid which used in uploaded filename
    //clientId는 file의 name에 사용된 UUID를 사용하며
    clientId = input.file.filename.split('.')[0];
    //logo uri will be serving uri of uploaded file
    logoUri = new URL(input.file.filename, servingURL.client.logo);
  } else {
    clientId = v4();
    logoUri = new URL('default.png', servingURL.client.logo);
  }

  //generate client secret
  const hash = new SHA3(512);
  const clientSecret = hash.digest().toString();

  const client = await prismaClient.oauth_client.create({
    data: {
      client_id: clientId,
      client_secret: clientSecret,
      client_name: input.name,
      client_uri: input.uri,
      logo_uri: logoUri.toString(),
      scope: '',
      user_id: input.userId,
    },
  });

  return getPublicClientInfo(client);
};

const getPublicClientInfo = (
  client: Required<PublicClientInfo>
): PublicClientInfo =>
  pick(client, ['client_id', 'client_name', 'client_uri', 'logo_uri']);
