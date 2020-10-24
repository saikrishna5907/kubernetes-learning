import request from 'supertest';

import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'sai@gmail.com',
      password: '12345',
    })
    .expect(201);
});
it('return a 400 with invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'asdasdasdasd',
      password: '12345',
    })
    .expect(400);
});
it('return a 400 with invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'sai@gmail.com',
      password: '1',
    })
    .expect(400);
});
it('return a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: '',
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: '',
    })
    .expect(400);
});
it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'sai@gmail.com',
      password: '12345',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'sai@gmail.com',
      password: '12345',
    })
    .expect(400);
});
it('sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'sai@gmail.com',
      password: '12345',
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});
