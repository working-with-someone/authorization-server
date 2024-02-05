import prismaClient from '../database';
import HttpStatusCode from 'http-status-codes';
import { wwsError } from '../error/wwsError';
import { v4 } from 'uuid';
import { servingURL, uploadPath } from '../config/path.config';
import { ClientCreationInput, PublicClientInfo } from '../@types/client';
import pick from '../utils/pick';
import fs from 'fs';
import { generateCompleteFileName } from '../utils/fileHandler';
import path from 'path';
import crypto from 'node:crypto';

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

  return clients.map((client) => getPublicClientInfo(client));
};

export const createClient = async (
  input: ClientCreationInput
): Promise<PublicClientInfo> => {
  const clientId = v4();

  let completeFileName = 'default.png';
  let logoUri = new URL(completeFileName, servingURL.client.logo);

  if (input.file) {
    completeFileName = generateCompleteFileName({
      name: clientId,
      mimeType: input.file?.mimetype,
    });

    logoUri = new URL(completeFileName, servingURL.client.logo);
  }

  //generate client secret
  const clientSecret = crypto.randomBytes(15).toString('hex');

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

  if (input.file) {
    const fileUploadPath = path.join(uploadPath.client.logo, completeFileName);

    const logoWritableStream = fs.createWriteStream(fileUploadPath);

    input.file.stream.pipe(logoWritableStream);
  }

  return getPublicClientInfo(client);
};

const getPublicClientInfo = (
  client: Required<PublicClientInfo>
): PublicClientInfo =>
  pick(client, ['client_id', 'client_name', 'client_uri', 'logo_uri']);
