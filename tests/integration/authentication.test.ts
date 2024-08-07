import prismaClient from '../../src/database';
import request from 'supertest';
import testUserData from '../data/user.json';
import app from '../../src/app';
import moment from 'moment';
import cookie from 'cookie';
import { sessionIdName } from '../../src/config/session.config';
import server from '../../src/server';

jest.unmock('../../src/database');

jest.mock('../../src/utils/mailer.ts');

describe('Authentication', () => {
  beforeAll(async () => {
    testUserData.users.forEach(async (user) => {
      await prismaClient.user.create({
        data: user,
      });
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({});

    server.close();
  });

  describe('Signup', () => {
    describe('GET', () => {
      test('Response_200', (done) => {
        request(server).get('/auth/signup').expect(200).end(done);
      });
    });

    describe('POST', () => {
      test('Response_200', (done) => {
        request(server)
          .post('/auth/signup')
          .send({
            username: testUserData.newUser.username,
            password: testUserData.newUser.password,
            email: testUserData.newUser.email,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(200)
          .end(done);
      });

      test('Response_409_Email(!)', (done) => {
        request(server)
          .post('/auth/signup')
          .send({
            username: testUserData.users[0].username,
            email: testUserData.users[0].email,
            password: 'strongPassword12!',
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(409)
          .end(done);
      });

      test('Response_400_Username(x)', (done) => {
        request(server)
          .post('/auth/signup')
          .send({
            email: testUserData.signupInput.valid.username,
            password: testUserData.signupInput.valid.password,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      test('Response_400_Email(x)', (done) => {
        request(server)
          .post('/auth/signup')
          .send({
            username: testUserData.signupInput.valid.username,
            password: testUserData.signupInput.valid.password,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      test('Response_400_Password(x)', (done) => {
        request(server)
          .post('/auth/signup')
          .send({
            username: testUserData.signupInput.valid.username,
            email: testUserData.signupInput.valid.email,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      test('Response_400_Username(?)', (done) => {
        request(server)
          .post('/auth/signup')
          .send({
            username: testUserData.signupInput.invalid.username,
            password: testUserData.signupInput.valid.password,
            email: testUserData.signupInput.valid.email,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      test('Response_400_Email(?)', (done) => {
        request(server)
          .post('/auth/signup')
          .send({
            username: testUserData.signupInput.valid.username,
            password: testUserData.signupInput.valid.password,
            email: testUserData.signupInput.invalid.email,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      test('Response_400_Password(?)', (done) => {
        request(server)
          .post('/auth/signup')
          .send({
            username: testUserData.signupInput.valid.username,
            password: testUserData.signupInput.invalid.password,
            email: testUserData.signupInput.valid.email,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });
    });
  });

  describe('Verify', () => {
    beforeAll(async () => {
      testUserData.expired_user.email_verification.create.expired_at = moment()
        .subtract(16, 'minute')
        .toDate()
        .toISOString();

      await prismaClient.user.create({
        data: testUserData.expired_user,
      });
    });

    describe('GET', () => {
      test('Response_Verification_Success_Page_With_200_If_Verification_Success', async () => {
        const user = await prismaClient.user.findFirst({
          where: {
            username: testUserData.newUser.username,
            email: testUserData.newUser.email,
          },
          include: {
            email_verification: true,
          },
        });

        const res = await request(server).get(
          `/auth/signup/verify?user_id=${user?.id}&token=${user?.email_verification?.verify_token}`
        );

        expect(res.status).toEqual(200);
      });

      test('Response_400_Token(expired)', async () => {
        const user = await prismaClient.user.findFirst({
          where: {
            username: testUserData.expired_user.username,
            email: testUserData.expired_user.email,
          },
          include: {
            email_verification: true,
          },
        });

        const res = await request(server).get(
          `/auth/signup/verify?user_id=${user?.id}&token=${user?.email_verification?.verify_token}`
        );

        expect(res.status).toEqual(400);
      });
      test('Response_400_UserId(x)_Token(X)', (done) => {
        request(server).get('/auth/signup/verify').expect(400).end(done);
      });

      test('Response_404_Token(?)', (done) => {
        request(server)
          .get(
            `/auth/signup/verify?user_id=1234&token=${testUserData.verifyQuery.invalid.token}`
          )
          .expect(400)
          .end(done);
      });
    });
  });

  describe('Login', () => {
    describe('GET', () => {
      // continue uri와 함께 login page를 요청하면 200을 응답받아야한다.
      test('Response_Login_Page_With_200', (done) => {
        request(server)
          .get('/auth/login')
          .query({ continue: 'http://example.com' })
          .expect(200)
          .end(done);
      });

      // invalid continue uri와 함께 login page를 요청하면 200을 응답받아야한다.
      test('Response_400_Continue(?)', (done) => {
        request(server)
          .get('/auth/login')
          .query({ continue: 'invalid continue' })
          .expect(400)
          .end(done);
      });

      // continue uri없이 login page를 요청하면 200을 응답받아야한다.
      test('Response_Login_Page_With_200_Continue(x)', (done) => {
        request(server).get('/auth/login').expect(200).end(done);
      });
    });

    describe('POST', () => {
      // continue uri와 함께 로그인하면 session id cookie가 set되고, 302를 응답받아야한다.
      test('Redirect_To_Redirect_Uri_With_With_Sid_302', (done) => {
        request(server)
          .post('/auth/login')
          .send({
            email: testUserData.newUser.email,
            password: testUserData.newUser.password,
            continue: 'http://example.com',
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          // to redirect
          .expect(302)
          .expect((res) => {
            // with sid
            const cookieStrings = res.headers['set-cookie'];
            let sidCookie = '';

            for (const cookieString of cookieStrings) {
              if (
                Object.keys(cookie.parse(cookieString)).includes(sessionIdName)
              ) {
                sidCookie = cookieString;
              }
            }

            expect(sidCookie).toBeDefined();
          })
          .end(done);
      });

      // continue uri 없이 로그인하면 session id cookie가 set되고, 200을 응답받아야한다.
      test('Response_200_Continue(x)', (done) => {
        request(server)
          .post('/auth/login')
          .send({
            email: testUserData.newUser.email,
            password: testUserData.newUser.password,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(200)
          .expect((res) => {
            // with sid
            const cookieStrings = res.headers['set-cookie'];
            let sidCookie = '';

            for (const cookieString of cookieStrings) {
              if (
                Object.keys(cookie.parse(cookieString)).includes(sessionIdName)
              ) {
                sidCookie = cookieString;
              }
            }

            expect(sidCookie).toBeDefined();
          })
          .end(done);
      });

      // 존재하지 않는 credential로 로그인하면, 400을 응답받아야한다.
      test('Response_400_Credential_Does_Not_Exist', (done) => {
        request(server)
          .post('/auth/login')
          .send({
            // not registered credential
            email: 'doesNotExist@example.com',
            password: 'strongPassword12!',
          })
          .expect(400)
          .end(done);
      });
    });
  });
});
