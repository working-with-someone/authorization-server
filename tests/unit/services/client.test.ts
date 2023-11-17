import { clientService } from '../../../src/services';
import { prismaClientMock } from '../../jest/singleton';
import { mockReset } from 'jest-mock-extended';
import { wwsError } from '../../../src/error/wwsError';
import HttpStatusCode from 'http-status-codes';

beforeEach(() => {
  mockReset(prismaClientMock);
});

describe('Client_Service_Logic', () => {
  const existClient = {
    client_id: '1234',
    client_name: 'exist_client',
    client_secret: '1234',
    client_uri: 'http://example.com',
    contacts: [],
    logo_uri: 'http://www.example.com/example.png',
    tos_uri: '',
    policy_uri: '',
    jwks_uri: '',
    redirect_uri: [],
    token_endpoint_auth_method: 'client_secret_post',
    response_type: 'code',
    grant_types: [],
    scope: '',
    user_id: 1,
  };

  describe('getClient', () => {
    test('Get_Client_Successfully', async () => {
      prismaClientMock.oauth_client.findFirst.mockResolvedValueOnce(
        existClient
      );

      await expect(clientService.getClient(1, '1234')).resolves.toEqual(
        existClient
      );

      expect(
        prismaClientMock.oauth_client.findFirst.mock.results[0].value
      ).resolves.toEqual(existClient);
    });

    test('Throw_WWSError_With_404_If_Client_Does_Not_Exist', async () => {
      prismaClientMock.oauth_client.findFirst.mockResolvedValueOnce(null);

      await expect(clientService.getClient(1, '1234')).rejects.toThrowError(
        new wwsError(
          HttpStatusCode.NOT_FOUND,
          HttpStatusCode.getStatusText(HttpStatusCode.NOT_FOUND)
        )
      );

      expect(
        prismaClientMock.oauth_client.findFirst.mock.results[0].value
      ).resolves.toEqual(null);
    });
  });
});
