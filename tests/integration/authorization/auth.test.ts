import prismaClient from '../../../src/database';
import request from 'supertest';
import testUserData from '../../seeds/user.json';
import app from '../../../src/app';
import moment from 'moment';

jest.unmock('../../../src/database');

jest.mock('../../../src/utils/mailer.ts');

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
  });

  describe('Signup', () => {
    test('Response_Signup_Page_With_200', (done) => {
      request(app).get('/auth/signup').expect(200).end(done);
    });

    test('Response_Signup_Success_Page_With_200_If_Signup_Success', (done) => {
      request(app)
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

    test('Response_Error_Page_With_409_If_Signup_Request_Include_Conflict_Input', (done) => {
      request(app)
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

    test('Response_Error_Page_With_400_If_Signup_Request_Doest_Not_Include_Username', (done) => {
      request(app)
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

    test('Response_Error_Page_With_400_If_Signup_Request_Doest_Not_Include_Email', (done) => {
      request(app)
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

    test('Response_Error_Page_With_400_If_Signup_Request_Doest_Not_Include_Password', (done) => {
      request(app)
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

    test('Response_Error_Page_With_400_If_Signup_Request_Include_Invalid_Username', (done) => {
      request(app)
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

    test('Response_Error_Page_With_400_If_Signup_Request_Include_Invalid_Email', (done) => {
      request(app)
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

    test('Response_Error_Page_With_400_If_Signin_Request_Include_Invalid_Password', (done) => {
      request(app)
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

      const res = await request(app).get(
        `/auth/signup/verify?user_id=${user?.id}&token=${user?.email_verification?.verify_token}`
      );

      expect(res.status).toEqual(200);
    });

    test('Response_Error_Page_With_400_If_Verify_Code_Expired', async () => {
      const user = await prismaClient.user.findFirst({
        where: {
          username: testUserData.expired_user.username,
          email: testUserData.expired_user.email,
        },
        include: {
          email_verification: true,
        },
      });

      const res = await request(app).get(
        `/auth/signup/verify?user_id=${user?.id}&token=${user?.email_verification?.verify_token}`
      );

      expect(res.status).toEqual(400);
    });
    test('Response_Error_Page_With_400_If_Verification_Request_Include_Invalid_Query_Parameters', (done) => {
      request(app).get('/auth/signup/verify').expect(400).end(done);
    });

    test('Response_Error_Page_With_404_If_Verification_Request_Is_Bad_Request', (done) => {
      request(app)
        .get(
          `/auth/signup/verify?user_id=1234&token=${testUserData.verifyQuery.invalid.token}`
        )
        .expect(400)
        .end(done);
    });
  });

  describe('Signin', () => {
    test('Response_Signin_Page_With_200', (done) => {
      request(app).get('/auth/signin').expect(200).end(done);
    });

    test('Response_Signin_Page_With_Cookie_With_200', (done) => {
      request(app)
        .get('/auth/signin')
        .query({
          redirect_uri: 'http://example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.headers['set-cookie'][0]).toBeDefined();
        })
        .end(done);
    });
    test('Redirect_To_Home_With_Cookie_With_302_If_Signin_Success_But_Redirect_Uri_Does_Not_Provided', (done) => {
      request(app)
        .post('/auth/signin')
        .send({
          email: testUserData.newUser.email,
          password: testUserData.newUser.password,
        })
        .set({
          'Content-Type': 'application/x-www-form-urlencoded',
        })
        .expect(302)
        .expect('Location', '/')
        .expect((res) => {
          expect(res.headers['set-cookie'][0]).toBeDefined();
        })
        .end(done);
    });

    test('Redirect_To_Redirect_Uri_With_QueryParam_With_302_If_Signin_Success_And_Redirect_Uri_Provided', (done) => {
      request(app)
        .post('/auth/signin')
        .set('Cookie', ['redirect_uri=https://example.com'])
        .send({
          email: testUserData.newUser.email,
          password: testUserData.newUser.password,
        })
        .set({
          'Content-Type': 'application/x-www-form-urlencoded',
        })
        .expect(302)
        .expect((res) => {
          const redirectUriRegex = /https:\/\/example.com\/\?jwt=*/;
          expect(res.headers.location).toMatch(redirectUriRegex);
        })
        .expect((res) => {
          expect(res.headers['set-cookie'][0]).toBeDefined;
        })
        .end(done);
    });

    test('Response_Error_Page_With_400_If_Signin_Failed', (done) => {
      request(app)
        .post('/auth/signin')
        .send({
          email: 'doesNotExist@example.com',
          password: 'strongPassword12!',
        })
        .expect(400)
        .end(done);
    });
  });
});
