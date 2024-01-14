import prismaClient from '../../src/database';
import request from 'supertest';
import testUserData from '../data/user.json';
import testClientData from '../data/client.json';
import app from '../../src/app';
import fs from 'fs';

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

    const redirectURI = new URL(res.headers.location);
    currentUser.jwt = redirectURI.searchParams.get('jwt');

    expect(currentUser.jwt).not.toBeUndefined();

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
        .set('Authorization', 'Bearer ' + currentUser.jwt);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(testClientData.publicClientsInfo);
    });
  });

  describe('GET', () => {
    test('Response_Client_With_200', async () => {
      const res = await request(app)
        .get(`/app/${testClientData.clients[0].client_id}`)
        .set('Authorization', 'Bearer ' + currentUser.jwt);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(testClientData.publicClientsInfo[0]);
    });

    test('Response_404_If_Access_Other_Client', async () => {
      const res = await request(app)
        .get(`/app/${testClientData.clientsOfOtherUser[0].client_id}`)
        .set('Authorization', 'Bearer ' + currentUser.jwt);

      expect(res.statusCode).toEqual(404);
    });

    test('Response_404_If_Access_Does_Not_Exist_Client', async () => {
      const res = await request(app)
        .get('/app/doesnotExistClient')
        .set('Authorization', 'Bearer ' + currentUser.jwt);

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

    test('Response_Created_Client_With_200_Without_Logo', async () => {
      const res = await request(app)
        .post('/app')
        .set('Authorization', 'Bearer ' + currentUser.jwt)
        .set('Content-Type', 'multipart/form-data')
        .field('name', testClientData.newClient.client_name)
        .field('uri', testClientData.newClient.client_uri);

      expect(res.statusCode).toEqual(201);
      expect(res.body.client_name).toEqual(
        testClientData.newClient.client_name
      );
      expect(res.body.client_uri).toEqual(testClientData.newClient.client_uri);
    });

    test('Response_Created_Client_With_200_With_Logo', async () => {
      const res = await request(app)
        .post('/app')
        .set('Authorization', 'Bearer ' + currentUser.jwt)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'logo',
          //must be relative path from where test running
          fs.createReadStream('./tests/data/images/newClient.png')
        )
        .field('name', testClientData.newClient.client_name)
        .field('uri', testClientData.newClient.client_uri);

      expect(res.statusCode).toEqual(201);
      expect(res.body.client_name).toEqual(
        testClientData.newClient.client_name
      );
      expect(res.statusCode).toEqual(201);
    });

    test('Response_404_If_Client_Name_Does_Not_Provided', async () => {
      const res = await request(app)
        .post('/app')
        .set('Authorization', 'Bearer ' + currentUser.jwt)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'logo',
          //must be relative path from where test running
          fs.createReadStream('./tests/data/images/newClient.png')
        )
        .field('uri', testClientData.newClient.client_uri);

      expect(res.statusCode).toEqual(400);
    });

    test('Response_404_If_Client_Uri_Does_Not_Provided', async () => {
      const res = await request(app)
        .post('/app')
        .set('Authorization', 'Bearer ' + currentUser.jwt)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'logo',
          //must be relative path from where test running
          fs.createReadStream('./tests/data/images/newClient.png')
        )
        .field('name', testClientData.newClient.client_name);

      expect(res.statusCode).toEqual(400);
    });
  });
});
