import request from 'supertest';

import { app } from '../../app';

it('fails when a email is supplied which does not exist', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'asdasdas',
      password: 'asdasdasd',
    })
    .expect(400);
});
it('fails when a an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'saikrishna@gmail.com',
      password: '123456',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'saikrishna@gmail.com',
      password: 'asdasdasda',
    })
    .expect(400);
});

it('response with a cookie when given credentials are valid', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'saikrishna@gmail.com',
      password: '123456',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'saikrishna@gmail.com',
      password: '123456',
    })
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});
