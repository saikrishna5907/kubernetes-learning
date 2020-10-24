import request from 'supertest';

import { app } from '../../app';

it('clears the cookie after signing out', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'sai@gmail.com',
      password: '123456',
    })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);
  expect(response.get('Set-Cookie')[0]).toEqual(
    ' the string value that the Set-Cookie have after console log it '
  );
});
