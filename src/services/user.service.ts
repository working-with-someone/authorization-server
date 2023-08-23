import { Prisma } from '@prisma/client';
import prismaClient from '../database';
import { wwsError } from '../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import bcrypt from 'bcrypt';
import getRandomString from '../lib/rs';
import mailer from '../utils/mailer';
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
  const registeredUser = await prismaClient.user.findFirst({
    where: {
      local: {
        email: data.email,
      },
    },
    //select only local
    include: {
      local: true,
    },
  });

  if (registeredUser) {
    //이미 존재하는 user가 email verified 상태 즉, user.
    //409 Conflict와 함께 Conflict msg를 응답한다.
    if (registeredUser.local?.email_verified) {
      throw new wwsError(
        HttpStatusCode.CONFLICT,
        'account already registered with email'
      );
    }
    //이미 존재하는 user가 email verified 되지 않은 상태
    //해당 user를 제거하고 local user creation으로 넘어간다.
    else {
      await prismaClient.user.delete({
        where: {
          id: registeredUser.id,
        },
      });
    }
  }

  //정상적인 local user creation을 수행한다.
  const salt = await bcrypt.genSalt(10);

  const encrypted_password = await bcrypt.hash(data.password, salt);

  const verify_token = await bcrypt.hash(getRandomString(10), salt);

  await prismaClient.user.create({
    data: {
      username: data.username,
      pfp: '',
      local: {
        create: {
          encrypted_password,
          email: data.email,
          email_verified: false,
          verify_token,
        },
      },
    },
    select: publicLocalUserSelect,
  });

  await mailer.sendVerificationMail({
    verificationLink: `${process.env.SERVER_URL}/auth/signup/verify?token=${verify_token}`,
    dst: data.email,
  });

  const user = await prismaClient.user.findFirst({
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
  let user = await prismaClient.user.findFirst({
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

    user = await prismaClient.user.findFirst({
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
