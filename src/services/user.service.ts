import { Prisma } from '@prisma/client';
import prismaClient from '../database';

export const createUser = async (data: Prisma.UserCreateInput) => {
  return;
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
