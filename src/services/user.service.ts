import { Prisma } from '@prisma/client';
import prismaClient from '../database';
import { wwsError } from '../utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import bcrypt from 'bcrypt';

interface UserCreateInput {
  username: string;
  email: string;
  password: string;
}

export const createUser = async (data: UserCreateInput) => {
  const userAlreadyExist = await getUser({
    local: {
      email: data.email,
    },
  });

  if (userAlreadyExist) {
    throw new wwsError(
      HttpStatusCode.CONFLICT,
      'account already registered with email'
    );
  }

  const salt = await bcrypt.genSalt(10);

  const encrypted_password = await bcrypt.hash(data.password, salt);

  const user = await prismaClient.user.create({
    data: {
      username: data.username,
      pfp: '',
      local: {
        create: {
          encrypted_password,
          email: data.email,
          email_verified: false,
        },
      },
    },
  });

  return user;
};

export const updateUser = async (data: Prisma.UserUpdateInput) => {
  return;
};

export const deleteUser = async (data: Prisma.UserSelect) => {
  return;
};

export const getUser = async (data: Prisma.UserWhereInput) => {
  const user = await prismaClient.user.findFirst({
    where: data,
  });

  return user;
};
