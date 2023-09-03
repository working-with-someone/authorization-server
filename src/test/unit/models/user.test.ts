import 'dotenv/config';
import { userService } from '../../../services';
import { prismaMock } from './singleton';
import { mockReset } from 'jest-mock-extended';
import { wwsError } from '../../../utils/wwsError';
import HttpStatusCode from 'http-status-codes';

beforeEach(() => {
  mockReset(prismaMock);
});

jest.mock('../../../utils/mailer.ts');

describe('User_Service_Logic', () => {
  describe('create_Local_User', () => {
    const newUser = {
      username: 'latto',
      email: 'latto@gmail.com',
      password: 'password',
    };

    test('Create_New_User_If_User_Does_Not_Exist_With_Email', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);

      await expect(
        userService.createLocalUser({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
        })
      ).resolves.toBeUndefined();

      expect(
        prismaMock.user.create.mock.calls[0][0].data.local?.create?.email
      ).toBe(newUser.email);
    });

    test('Delete_Exist_User_And_Create_New_User_If_User_Already_Exist_But_Not_Verified', async () => {
      const existNotVerifiedUserGetResult = {
        id: 2,
        username: 'seungho-hub2',
        pfp: '/pfp.png',
        created_at: new Date(),
        updated_at: new Date(),
        local: {
          id: 1,
          email: 'kmc54320@gmail.com',
          email_verified: false,
          verify_token: '1234',
          encrypted_password: '1234',
          user_id: 2,
        },
      };

      prismaMock.user.findFirst.mockResolvedValueOnce(
        existNotVerifiedUserGetResult
      );

      prismaMock.user.delete.mockResolvedValueOnce(
        existNotVerifiedUserGetResult
      );

      await expect(
        userService.createLocalUser({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
        })
      ).resolves.toBeUndefined();

      //create new user
      expect(
        prismaMock.user.create.mock.calls[0][0].data.local?.create?.email
      ).toBe(newUser.email);

      //delete exist user
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: {
          id: existNotVerifiedUserGetResult.id,
        },
      });
    });

    test('Throw_WWSError_With_409_If_User_Already_Exist_With_Verified_Email', async () => {
      const existVerifiedUserGetResult = {
        id: 2,
        username: 'seungho-hub2',
        pfp: '/pfp.png',
        created_at: new Date(),
        updated_at: new Date(),
        local: {
          id: 1,
          email: 'kmc54320@gmail.com',
          email_verified: true,
          verify_token: '1234',
          encrypted_password: '1234',
          user_id: 2,
        },
      };

      prismaMock.user.findFirst.mockResolvedValueOnce(
        existVerifiedUserGetResult
      );

      await expect(
        userService.createLocalUser({
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
