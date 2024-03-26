import prismaClient from '../../src/database';
import request from 'supertest';
import testUserData from '../data/user.json';
import testClientData from '../data/client.json';
import app from '../../src/app';
import fs from 'fs';
import cookie from 'cookie';
import { sessionIdName } from '../../src/config/session.config';
import { servingURL, uploadPath } from '../../src/config/path.config';

jest.unmock('../../src/database');

describe('Client API', () => {
  const currentUser: Record<string, any> = {
    ...testUserData.users[0],
    password: 'StrongPassword12!',
  };

  beforeAll(async () => {
    for (const user of testUserData.users) {
      await prismaClient.user.create({
        data: user,
      });
    }

    const res = await request(app)
      .post('/auth/login')
      .set({
        'Content-Type': 'application/x-www-form-urlencoded',
      })
      .send({
        email: currentUser.email,
        password: currentUser.password,
        continue: 'http://example.com',
      });

    expect(res.statusCode).toEqual(302);
    expect(res.redirect).toEqual(true);

    const cookieStrings = res.headers['set-cookie'];
    let sidCookie = '';

    for (const cookieString of cookieStrings) {
      const _cookie = cookie.parse(cookieString);
      if (Object.keys(_cookie).includes(sessionIdName)) {
        sidCookie = cookie.serialize(sessionIdName, _cookie._dev_sid);
      }
    }

    expect(sidCookie).not.toBe('');

    currentUser.sidCookie = sidCookie;

    for (const client of testClientData.clients) {
      await prismaClient.oauth_client.create({
        data: client,
      });
    }

    for (const otherClient of testClientData.clientsOfOtherUser) {
      await prismaClient.oauth_client.create({
        data: otherClient,
      });
    }
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({});
    await prismaClient.oauth_client.deleteMany({});
  });

  describe('GETS', () => {
    test('Response_Clients_With_200', async () => {
      const res = await request(app)
        .get('/app')
        .set('Cookie', currentUser.sidCookie);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(testClientData.publicClientsInfo);
    });
  });

  describe('GET', () => {
    test('Response_Client_With_200', async () => {
      const res = await request(app)
        .get(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(testClientData.clients[0]);
    });

    test('Response_404_clientId(not_authorized)', async () => {
      const res = await request(app)
        .get(`/app/${testClientData.clientsOfOtherUser[0].client_id}`)
        .set('Cookie', currentUser.sidCookie);

      expect(res.statusCode).toEqual(404);
    });

    test('Response_404_clientId(does_not_exist)', async () => {
      const res = await request(app)
        .get('/app/doesnotExistClient')
        .set('Cookie', currentUser.sidCookie);

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST', () => {
    beforeEach(() => {
      prismaClient.oauth_client.deleteMany({
        where: {
          client_name: testClientData.newClient.client_name,
        },
      });
    });

    test('Response_Created_Client_With_200', async () => {
      const res = await request(app)
        .post('/app')
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'logo',
          fs.createReadStream('./tests/data/images/newClient.png')
        )
        .field('client_name', testClientData.newClient.client_name)
        .field('client_uri', testClientData.newClient.client_uri);

      expect(res.statusCode).toEqual(201);
      expect(res.body.client_name).toEqual(
        testClientData.newClient.client_name
      );
      expect(res.statusCode).toEqual(201);
    });

    test('Response_Created_Client_With_200_Logo(x)', async () => {
      const res = await request(app)
        .post('/app')
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('client_name', testClientData.newClient.client_name)
        .field('client_uri', testClientData.newClient.client_uri);

      expect(res.statusCode).toEqual(201);
      expect(res.body.client_name).toEqual(
        testClientData.newClient.client_name
      );
      expect(res.body.client_uri).toEqual(testClientData.newClient.client_uri);
    });

    test('Response_400_Name(x)', async () => {
      const res = await request(app)
        .post('/app')
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'logo',
          //must be relative path from where test running
          fs.createReadStream('./tests/data/images/newClient.png')
        )
        .field('client_uri', testClientData.newClient.client_uri);

      expect(res.statusCode).toEqual(400);
    });

    test('Response_400_Uri(x)', async () => {
      const res = await request(app)
        .post('/app')
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'logo',
          //must be relative path from where test running
          fs.createReadStream('./tests/data/images/newClient.png')
        )
        .field('client_name', testClientData.newClient.client_name);

      expect(res.statusCode).toEqual(400);
    });

    test('Response_400_Name(?)', async () => {
      const res = await request(app)
        .post('/app')
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'logo',
          fs.createReadStream('./tests/data/images/newClient.png')
        )
        // invalid client_name
        .field('name', testClientData.invalidateField.client_name)
        .field('uri', testClientData.newClient.client_uri);

      expect(res.statusCode).toEqual(400);
    });

    test('Response_400_Uri(?)', async () => {
      const res = await request(app)
        .post('/app')
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'logo',
          fs.createReadStream('./tests/data/images/newClient.png')
        )
        .field('name', testClientData.newClient.client_name)
        // invalid client_uri
        .field('uri', testClientData.invalidateField.client_uri);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PUT', () => {
    // test 종료 후
    afterAll(() => {
      // update된 정보를 되돌린다.
      prismaClient.oauth_client.update({
        where: {
          client_id: testClientData.clients[0].client_id,
        },
        data: testClientData.clients[0],
      });
    });

    const updatedName = 'updatedClient1';
    const updatedUri = 'http://www.updated.com';
    const updatedRedirectUri1 = 'https://wws.updated.com/callback';

    test('Response_Logo_Updated_Client_With_200', async () => {
      const res = await request(app)
        .put(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('client_name', updatedName)
        .field('client_uri', updatedUri)
        .field('logo_update_option', 'update')
        .field('redirect_uri1', updatedRedirectUri1)
        .attach(
          'logo',
          //must be relative path from where test running
          fs.createReadStream('./tests/data/images/newClient.png')
        );

      expect(res.statusCode).toEqual(200);
      expect(res.body.client_name).toEqual(updatedName);
      expect(res.body.client_uri).toEqual(updatedUri);
    });

    test('Response_Logo_Removed_Client_With_200', async () => {
      const res = await request(app)
        .put(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('client_name', updatedName)
        .field('client_uri', updatedUri)
        .field('logo_update_option', 'delete')
        .field('redirect_uri1', updatedRedirectUri1);

      expect(res.statusCode).toEqual(200);
      expect(res.body.client_name).toEqual(updatedName);
      expect(res.body.client_uri).toEqual(updatedUri);
      expect(res.body.logo_uri).toEqual(
        new URL('default.png', servingURL.client.logo).toString()
      );
    });

    test('Response_404_clientId(does_not_exist)', async () => {
      const res = await request(app)
        .put(`/app/doesnotExistClientId`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('client_name', updatedName)
        .field('client_uri', updatedUri)
        .field('logo_update_option', 'update')
        .field('redirect_uri1', updatedRedirectUri1)
        .attach(
          'logo',
          //must be relative path from where test running
          fs.createReadStream('./tests/data/images/newClient.png')
        );

      expect(res.statusCode).toEqual(404);
    });

    test('Response_404_clientId(not_authorized)', async () => {
      const res = await request(app)
        .put(`/app/${testClientData.clientsOfOtherUser[0].client_id}`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('client_name', updatedName)
        .field('client_uri', updatedUri)
        .field('logo_update_option', 'update')
        .field('redirect_uri1', updatedRedirectUri1)
        .attach(
          'logo',
          //must be relative path from where test running
          fs.createReadStream('./tests/data/images/newClient.png')
        );

      expect(res.statusCode).toEqual(404);
    });

    test('Response_Updated_Client_With_200_Logo(x)', async () => {
      const res = await request(app)
        .put(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('client_name', updatedName)
        .field('client_uri', updatedUri)
        .field('logo_update_option', 'no-change');

      expect(res.statusCode).toEqual(200);
      expect(res.body.client_name).toEqual(updatedName);
      expect(res.body.client_uri).toEqual(updatedUri);
    });

    test('Response_Updated_Client_With_200_RedirectUri(x)', async () => {
      const res = await request(app)
        .put(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('client_name', updatedName)
        .field('client_uri', updatedUri)
        .field('logo_update_option', 'update')
        .attach(
          'logo',
          //must be relative path from where test running
          fs.createReadStream('./tests/data/images/newClient.png')
        );

      expect(res.statusCode).toEqual(200);
      expect(res.body.client_name).toEqual(updatedName);
      expect(res.body.client_uri).toEqual(updatedUri);
    });

    test('Response_400_Name(x)_Uri(x)', async () => {
      const res = await request(app)
        .put(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('logo_update_option', 'update')
        // missed client_name, client_uri
        .attach(
          'logo',
          //must be relative path from where test running
          fs.createReadStream('./tests/data/images/newClient.png')
        );

      expect(res.statusCode).toEqual(400);
    });

    test('Response_400_LogoUpdateOption(x)', async () => {
      const res = await request(app)
        .put(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('name', updatedUri)
        .field('uri', testClientData.invalidateField.client_uri)
        .field('redirect_uri', testClientData.invalidateField.redirect_uri)
        .attach(
          'logo',
          fs.createReadStream('./tests/data/images/newClient.png')
        );

      expect(res.statusCode).toEqual(400);
    });

    test('Response_400_Name(?)', async () => {
      const res = await request(app)
        .put(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        //invlalid client_name
        .field('name', testClientData.invalidateField.client_name)
        .field('uri', updatedUri)
        .field('logo_update_option', 'update')
        .attach(
          'logo',
          fs.createReadStream('./tests/data/images/newClient.png')
        );

      expect(res.statusCode).toEqual(400);
    });

    test('Response_400_Uri(?)', async () => {
      const res = await request(app)
        .put(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('name', updatedUri)
        //invalid client_uri
        .field('uri', testClientData.invalidateField.client_uri)
        .field('logo_update_option', 'update')
        .attach(
          'logo',
          fs.createReadStream('./tests/data/images/newClient.png')
        );

      expect(res.statusCode).toEqual(400);
    });

    test('Response_400_RedirectUri(?)', async () => {
      const res = await request(app)
        .put(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie)
        .set('Content-Type', 'multipart/form-data')
        .field('name', updatedUri)
        .field('uri', testClientData.invalidateField.client_uri)
        .field('redirect_uri', testClientData.invalidateField.redirect_uri)
        .field('logo_update_option', 'update')
        .attach(
          'logo',
          fs.createReadStream('./tests/data/images/newClient.png')
        );

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('DELETE', () => {
    afterAll(async () => {
      await prismaClient.oauth_client.create({
        data: testClientData.clients[0],
      });
    });

    test('Response_204', async () => {
      const res = await request(app)
        .delete(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie);

      expect(res.statusCode).toEqual(204);
    });

    test('Response_404_clientId(not_authorized)', async () => {
      const res = await request(app)
        .delete(`/app/${testClientData.clientsOfOtherUser[0].client_id}`)
        .set('Cookie', currentUser.sidCookie);

      expect(res.statusCode).toEqual(404);
    });

    test('Response_404_clientId(does_not_exist)', async () => {
      const res = await request(app)
        .delete(`/app/${testClientData.clients[0].client_id}`)
        .set('Cookie', currentUser.sidCookie);

      expect(res.statusCode).toEqual(404);
    });
  });
});
