import 'dotenv/config';
import { userService } from '../../../src/services';
import { prismaMock } from '../../jest/singleton';
import { mockReset } from 'jest-mock-extended';
import { wwsError } from '../../../src/utils/wwsError';
import HttpStatusCode from 'http-status-codes';
import bcrypt from 'bcrypt';

beforeEach(() => {
  mockReset(prismaMock);
});

jest.mock('../../../src/utils/mailer.ts');

jest.mock('../../../src/lib/api', () => ({
  __esModule: true,
  default: new Proxy(
    {},
    {
      get: function () {
        return {
          getTokens: jest.fn(() => 123),
          getUserProfile: jest.fn(() => 123),
        };
      },
    }
  ),
}));

jest.mock('bcrypt');

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('User_Service_Logic', () => {
  describe('createLocalUser', () => {
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

  describe('createOrGetOauthUser', () => {
    const OauthInfo = {
      provider: 'seungho.hub',
      code: 'authorization_code',
    };

    const newUser = {
      id: 1,
      username: 'seungho-hub2',
      pfp: '/pfp.png',
      created_at: new Date(),
      updated_at: new Date(),
      oauth: {
        id: '1234',
        provider: OauthInfo.provider,
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        user_id: 1,
      },
    };

    const hidedUserInfo = {
      id: newUser.id,
      username: newUser.username,
      pfp: newUser.pfp,
      oauth: {
        id: newUser.oauth.id,
        provider: newUser.oauth.provider,
      },
    };

    test('Create_New_User_If_User_Not_Registered', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);

      prismaMock.user.create.mockResolvedValueOnce(newUser);

      await expect(
        userService.createOrGetOauthUser(OauthInfo)
      ).resolves.toEqual(hidedUserInfo);

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });

    test('Does_Not_Create_New_User_If_User_Registered', async () => {
      //user registered
      prismaMock.user.findFirst.mockResolvedValueOnce(newUser);

      await expect(
        userService.createOrGetOauthUser(OauthInfo)
      ).resolves.toEqual(hidedUserInfo);

      expect(prismaMock.user.create).toHaveBeenCalledTimes(0);
    });
  });

  describe('verifyUser', () => {
    test('Resolve_If_There_Is_Updated_User', async () => {
      const notVerifiedLocal = {
        id: 1,
        email: 'kmc54320@gmail.com',
        email_verified: false,
        verify_token: '1234',
        encrypted_password: '1234',
        user_id: 2,
      };
      prismaMock.local.update.mockResolvedValueOnce(notVerifiedLocal);

      await expect(
        userService.verifyUser(1, 'verify_token')
      ).resolves.toBeUndefined();
    });

    test('Throw_WWSError_With_404_If_There_Is_Not_Updated_User', async () => {
      prismaMock.local.update.mockResolvedValueOnce(null as never);

      await expect(
        userService.verifyUser(1, 'verify_token')
      ).rejects.toThrowError(
        new wwsError(
          HttpStatusCode.NOT_FOUND,
          HttpStatusCode.getStatusText(HttpStatusCode.NOT_FOUND)
        )
      );
    });
  });

  describe('signinUser', () => {
    const user = {
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

    test('Throw_WWSError_With_400_If_There_is_Not_User_With_Email', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);

      await expect(
        userService.signinUser({
          email: user.local.email,
          password: 'StrongPassword!',
        })
      ).rejects.toThrowError(
        new wwsError(HttpStatusCode.BAD_REQUEST, 'account does not registered')
      );
    });

    test('Resolve_With_Hided_Local_User', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(user);
      bcryptMock.compare.mockResolvedValueOnce(true as never);

      await expect(
        userService.signinUser({
          email: user.local.email,
          password: 'StringPassword!',
        })
      ).resolves.toEqual({
        id: user.id,
        username: user.username,
        pfp: user.pfp,
        local: {
          email: user.local.email,
        },
      });
    });

    test('Throw_WWSError_With_400_If_Password_Doest_Not_Match', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(user);
      bcryptMock.compare.mockResolvedValueOnce(false as never);

      await expect(
        userService.signinUser({
          email: user.local.email,
          password: 'StrongPassword!',
        })
      ).rejects.toThrowError(
        new wwsError(HttpStatusCode.BAD_REQUEST, 'account does not registered')
      );
    });
  });
});
