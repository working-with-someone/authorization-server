import prismaClient from '../../../src/database';
import request from 'supertest';
import testUserData from '../../seeds/user.json';
import app from '../../../src/app';

jest.unmock('../../../src/database');

describe('Authentication', () => {
  beforeAll(async () => {
    testUserData.localUsers.forEach(async (localUser) => {
      await prismaClient.user.create({
        data: localUser,
      });
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({});
  });

  describe('Local', () => {
    describe('Signup', () => {
      test('Response_Signup_Page_With_200', (done) => {
        request(app).get('/auth/signup').expect(200).end(done);
      });

      test('Response_Signup_Success_Page_With_200_If_Signup_Success', (done) => {
        request(app)
          .post('/auth/signup')
          .send(testUserData.newLocalUser)
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(200)
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
  });
});
