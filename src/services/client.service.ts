import prismaClient from '../database';
import HttpStatusCode from 'http-status-codes';
import { wwsError } from '../error/wwsError';
import { v4 } from 'uuid';
import { servingURL, uploadPath } from '../config/path.config';
import {
  ClientCreationInput,
  PublicClientInfo,
  ClientUpdateInput,
} from '../@types/client';
import pick from '../utils/pick';
import fs from 'fs';
import { generateCompleteFileName } from '../utils/fileHandler';
import path from 'path';
import crypto from 'node:crypto';

// not authprized client에 대한 정보를 숨기기 위해 userId 와 함께 clientId로 client의 존재 여부를 확인한다.
export const isClientExist = async (userId: number, clientId: string) => {
  const client = await prismaClient.oauth_client.findFirst({
    where: {
      user_id: userId,
      client_id: clientId,
    },
  });

  return client ? true : false;
};

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
      client_name: input.client_name,
      client_uri: input.client_uri,
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

export const updateClient = async (input: ClientUpdateInput) => {
  const data = {
    client_name: input.client_name,
    client_uri: input.client_uri,
    redirect_uri: input.redirect_uri,
  };

  if (input.file) {
    const completeFileName = generateCompleteFileName({
      name: input.client_id,
      mimeType: input.file?.mimetype,
    });
    const logoUri = new URL(completeFileName, servingURL.client.logo);

    const fileUploadPath = path.join(uploadPath.client.logo, completeFileName);

    const logoWritableStream = fs.createWriteStream(fileUploadPath);

    input.file.stream.pipe(logoWritableStream);

    Object.assign('logo_uri', logoUri);
  }

  const updatedClient = await prismaClient.oauth_client.update({
    data,
    where: {
      user_id: input.userId,
      client_id: input.client_id,
    },
  });

  return updatedClient;
};

const getPublicClientInfo = (
  client: Required<PublicClientInfo>
): PublicClientInfo =>
  pick(client, ['client_id', 'client_name', 'client_uri', 'logo_uri']);
