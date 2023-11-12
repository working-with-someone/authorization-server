import { userService } from '../../../src/services';
import { prismaClientMock } from '../../jest/singleton';
import { mockReset } from 'jest-mock-extended';
import { wwsError } from '../../../src/error/wwsError';
import HttpStatusCode from 'http-status-codes';

beforeEach(() => {
  mockReset(prismaClientMock);
});

jest.mock('../../../src/utils/mailer.ts');

jest.mock('bcrypt');

describe('User_Service_Logic', () => {
  describe('createUser', () => {
    const newUser = {
      username: 'latto',
      email: 'latto@gmail.com',
      password: 'password',
    };

    test('Create_New_User_If_User_Does_Not_Exist_With_Email', async () => {
      prismaClientMock.user.findFirst.mockResolvedValueOnce(null);

      await expect(
        userService.createUser({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
        })
      ).resolves.toBeUndefined();

      expect(prismaClientMock.user.create.mock.calls[0][0].data.email).toBe(
        newUser.email
      );
    });

    test('Delete_Exist_User_And_Create_New_User_If_User_Already_Exist_But_Not_Verified', async () => {
      const existNotVerifiedUserGetResult = {
        id: 2,
        username: 'seungho-hub2',
        email: 'kmc54320@gmail.com',
        encrypted_password: '1234',
        pfp: '/pfp.png',
        created_at: new Date(),
        updated_at: new Date(),
        email_verification: {
          expired_at: '2023-09-22T12:34:56.789Z',
          email_verified: false,
          verify_token: '1234',
          user_id: 2,
        },
      };

      prismaClientMock.user.findFirst.mockResolvedValueOnce(
        existNotVerifiedUserGetResult
      );

      prismaClientMock.user.delete.mockResolvedValueOnce(
        existNotVerifiedUserGetResult
      );

      await expect(
        userService.createUser({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
        })
      ).resolves.toBeUndefined();

      //create new user
      expect(prismaClientMock.user.create.mock.calls[0][0].data.email).toBe(
        newUser.email
      );

      //delete exist user
      expect(prismaClientMock.user.delete).toHaveBeenCalledWith({
        where: {
          id: existNotVerifiedUserGetResult.id,
        },
      });
    });

    test('Throw_WWSError_With_409_If_User_Already_Exist_With_Verified_Email', async () => {
      const existVerifiedUserGetResult = {
        id: 2,
        username: 'seungho-hub2',
        email: 'kmc54320@gmail.com',
        encrypted_password: '1234',
        pfp: '/pfp.png',
        created_at: new Date(),
        updated_at: new Date(),
        email_verification: {
          expired_at: '2023-09-22T12:34:56.789Z',
          email_verified: true,
          verify_token: '1234',
          user_id: 2,
        },
      };

      prismaClientMock.user.findFirst.mockResolvedValueOnce(
        existVerifiedUserGetResult
      );

      await expect(
        userService.createUser({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
        })
      ).rejects.toThrowError(
        new wwsError(
          HttpStatusCode.CONFLICT,
          'account already registered with email'
        )
      );
    });
  });
});
