import prismaClient from '../database';
import { wwsError } from '../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import bcrypt from 'bcrypt';
import getRandomString from '../lib/rs';
import mailer from '../utils/mailer';
import OAuths from '../lib/api';
import { Tokens } from '../lib/api/apiInterface';
import pick from '../utils/pick';

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

export const createLocalUser = async (data: LocalUserCreateInput) => {
  const registeredUser = await prismaClient.user.findFirst({
    where: {
      local: {
        email: data.email,
      },
    },
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

  const createdUser = await prismaClient.user.create({
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
  });

  await mailer.sendVerificationMail({
    verificationLink: `${process.env.SERVER_URL}/auth/signup/verify?user_id=${createdUser?.id}&token=${verify_token}`,
    dst: data.email,
  });
};

export const verifyUser = async (userId: number, verifyToken: string) => {
  const updatedUser = await prismaClient.local.update({
    data: {
      email_verified: true,
    },
    where: {
      user_id: userId,
      verify_token: verifyToken,
      email_verified: false,
    },
  });

  if (!updatedUser) {
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
    include: {
      oauth: true,
    },
  });

  if (!user) {
    user = await prismaClient.user.create({
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
      include: {
        oauth: true,
      },
    });
  }

  return hideOauthUserSensitiveInfo(user);
};

export const signinUser = async (body: UserSigninInput) => {
  const user = await prismaClient.user.findFirst({
    where: {
      local: {
        email: body.email,
        email_verified: true,
      },
    },
    include: {
      local: true,
    },
  });

  if (user?.local?.encrypted_password) {
    if (await bcrypt.compare(body.password, user?.local?.encrypted_password)) {
      return hideLocalUserSensitiveInfo(user);
    }
  }

  //if user does not exist or registered incorrectly respoonse with 400
  throw new wwsError(HttpStatusCode.BAD_REQUEST, 'account does not registered');
};

export const hideOauthUserSensitiveInfo = (user: Record<string, any>) => {
  return {
    ...pick(user, ['username', 'pfp', 'id']),
    oauth: pick(user.oauth, ['id', 'provider']),
  };
};

export const hideLocalUserSensitiveInfo = (user: Record<string, any>) => {
  return {
    ...pick(user, ['username', 'pfp', 'id']),
    local: pick(user.local, ['email']),
  };
};
