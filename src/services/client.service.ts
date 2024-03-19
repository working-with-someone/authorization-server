import prismaClient from '../database';
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
import { File } from '../middleware/minions';

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

  const completeFileName = 'default.png';
  let logoUri = new URL(completeFileName, servingURL.client.logo);

  if (input.file) {
    logoUri = await uploadLogo(clientId, input.file);
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

  return getPublicClientInfo(client);
};

export const updateClient = async (input: ClientUpdateInput) => {
  const data = {
    client_name: input.client_name,
    client_uri: input.client_uri,
    redirect_uri: input.redirect_uri,
  };

  if (input.file) {
    await deleteLogo(input.client_id);

    const logoUri = await uploadLogo(input.client_id, input.file);

    Object.assign(data, { logo_uri: logoUri });
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

export const deleteClient = async (userId: number, clientId: string) => {
  await deleteLogo(clientId);

  const deletedClient = await prismaClient.oauth_client.delete({
    where: {
      user_id: userId,
      client_id: clientId,
    },
  });

  return deletedClient;
};

const getPublicClientInfo = (
  client: Required<PublicClientInfo>
): PublicClientInfo =>
  pick(client, ['client_id', 'client_name', 'client_uri', 'logo_uri']);

// logo를 upload한다.
// pipe processing이 모두 종료되면 resolve되는 promise를 return한다.
const uploadLogo = (clientId: string, file: File): Promise<URL> => {
  const completeFileName = generateCompleteFileName({
    name: clientId,
    mimeType: file.mimetype,
  });

  const fileUploadPath = path.join(uploadPath.client.logo, completeFileName);

  const logoWritableStream = fs.createWriteStream(fileUploadPath);

  const logoUri = new URL(completeFileName, servingURL.client.logo);

  return new Promise((resolve, reject) => {
    file.stream.pipe(logoWritableStream);

    file.stream.on('error', (err) => {
      // processing 중 readable에서 erorr가 발생해도 writable은 auto close되지 않는다.
      // 수동으로 close 해주지 않으면 writable은 open 상태로 유지되며 memory leak이 발생한다.
      logoWritableStream.end();

      reject(err);
    });

    file.stream.on('end', () => {
      resolve(logoUri);
    });
  });
};

// client의 logo가 default가 아니라면 upload된 logo를 제거한다.
// default logo를 사용한다면 아무런 동작도하지 않는다.
const deleteLogo = async (clientId: string) => {
  const client = await prismaClient.oauth_client.findFirst({
    where: { client_id: clientId },
  });

  const completeFileName = client?.logo_uri.split('/').pop() as string;

  const isDefault = completeFileName === 'default.png' ? true : false;

  if (!isDefault) {
    const logoUploadedPath = path.join(
      uploadPath.client.logo,
      completeFileName
    );

    if (fs.existsSync(logoUploadedPath)) fs.unlinkSync(logoUploadedPath);
  }
};
