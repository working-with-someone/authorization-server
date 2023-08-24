import { Prisma } from '@prisma/client';
import prismaClient from '../database';
import { wwsError } from '../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import bcrypt from 'bcrypt';
import getRandomString from '../lib/rs';
import mailer from '../utils/mailer';
import OAuths from '../lib/api';
import { Tokens } from '../lib/api/apiInterface';

interface LocalUserCreateInput {
  username: string;
  email: string;
  password: string;
}

interface OauthUserCreateInput {
  provider: string;
  code: string;
}

interface UserSigninInput {
  email: string;
  password: string;
}

const publicUserSelect: Prisma.UserSelect = {
  id: true,
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
      const deletedUser = await prismaClient.user.delete({
        where: {
          id: registeredUser.id,
        },
      });

      if (!deletedUser) {
        throw new wwsError(
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          HttpStatusCode.getStatusText(HttpStatusCode.INTERNAL_SERVER_ERROR)
        );
      }
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

  const user = await prismaClient.user.findFirst({
    where: {
      local: {
        email: data.email,
      },
    },
    select: publicLocalUserSelect,
  });

  await mailer.sendVerificationMail({
    verificationLink: `${process.env.SERVER_URL}/auth/signup/verify?user_id=${user?.id}&token=${verify_token}`,
    dst: data.email,
  });

  return user;
};

export const verifyUser = async (userId: number, verifyToken: string) => {
  const updated = await prismaClient.local.update({
    data: {
      email_verified: true,
    },
    where: {
      user_id: userId,
      verify_token: verifyToken,
    },
  });

  if (!updated) {
    throw new wwsError(
      HttpStatusCode.NOT_FOUND,
      HttpStatusCode.getStatusText(HttpStatusCode.NOT_FOUND)
    );
  }
};

export const createOrGetOauthUser = async (data: OauthUserCreateInput) => {
  const { provider, code } = data;

  //get api interface
  const apiInterface = OAuths[provider];

  //get access token from provider with authorization code
  const tokens: Tokens = await apiInterface.getTokens(code);

  //get profile from provider with acess token
  const profile = await apiInterface.getUserProfile(tokens.accessToken);

  let user = await prismaClient.user.findFirst({
    where: {
      oauth: {
        id: profile.id,
      },
    },
    select: publicOauthUserSelect,
  });

  if (!user) {
    await prismaClient.user.create({
      data: {
        username: profile.username,
        pfp: profile.pfp,
        oauth: {
          create: {
            provider: data.provider,
            id: profile.id,
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
          },
        },
      },
    });

    user = await prismaClient.user.findFirst({
      where: {
        oauth: {
          id: profile.id,
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

export const signinUser = async (data: UserSigninInput) => {
  const user = await prismaClient.user.findFirst({
    where: {
      local: {
        email: data.email,
        email_verified: true,
      },
    },
    include: {
      local: true,
    },
  });

  if (user?.local?.encrypted_password) {
    if (await bcrypt.compare(data.password, user?.local?.encrypted_password)) {
      return user;
    }
  }

  //if user does not exist or registered incorrectly respoonse with 400
  throw new wwsError(HttpStatusCode.BAD_REQUEST, 'account does not registered');
};
