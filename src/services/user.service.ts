import { Prisma } from '@prisma/client';
import prismaClient from '../database';
import { wwsError } from '../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import bcrypt from 'bcrypt';

interface UserCreateInput {
  username: string;
}

interface LocalUserCreateInput extends UserCreateInput {
  email: string;
  password: string;
}

interface OauthUserCreateInput extends UserCreateInput {
  pfp: string;

  provider: string;
  id: string;
  accessToken: string;
  refreshToken: string;
}

const publicUserSelect: Prisma.UserSelect = {
  username: true,
  pfp: true,
};

const publicLocalUserSelect: Prisma.UserSelect = {
  ...publicUserSelect,
  local: {
    select: {
      encrypted_password: true,
      email: true,
    },
  },
};

const publicOauthUserSelect: Prisma.UserSelect = {
  ...publicUserSelect,
  oauth: {
    select: {
      provider: true,
      id: true,
    },
  },
};

export const createLocalUser = async (data: LocalUserCreateInput) => {
  let user = await getUser({
    where: {
      local: {
        email: data.email,
      },
    },
    select: publicLocalUserSelect,
  });

  if (user) {
    throw new wwsError(
      HttpStatusCode.CONFLICT,
      'account already registered with email'
    );
  }

  const salt = await bcrypt.genSalt(10);

  const encrypted_password = await bcrypt.hash(data.password, salt);

  await prismaClient.user.create({
    data: {
      username: data.username,
      pfp: '',
      local: {
        create: {
          encrypted_password,
          email: data.email,
          email_verified: false,
          verify_token: null,
        },
      },
    },
    select: publicLocalUserSelect,
  });

  user = await getUser({
    where: {
      local: {
        email: data.email,
      },
    },
    select: publicLocalUserSelect,
  });

  return user;
};

export const createOrGetOauthUser = async (data: OauthUserCreateInput) => {
  let user = await getUser({
    where: {
      oauth: {
        id: data.id,
      },
    },
    select: publicOauthUserSelect,
  });

  if (!user) {
    await prismaClient.user.create({
      data: {
        username: data.username,
        pfp: data.pfp,
        oauth: {
          create: {
            provider: data.provider,
            id: data.id,
            access_token: data.accessToken,
            refresh_token: data.refreshToken,
          },
        },
      },
    });

    user = await getUser({
      where: {
        oauth: {
          id: data.id,
        },
      },
      select: publicOauthUserSelect,
    });
  }

  return user;
};

export const updateUser = async (data: Prisma.UserUpdateInput) => {
  return;
};

export const deleteUser = async (data: Prisma.UserSelect) => {
  return;
};

export const getUser = async (data: Prisma.UserFindFirstArgs) => {
  const user = await prismaClient.user.findFirst(data);

  return user;
};
