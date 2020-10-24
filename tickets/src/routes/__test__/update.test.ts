import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { body } from 'express-validator';
it('returns a 404 if the provided id does not exists', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({ title: 'dasdas', price: 20 })
    .expect(404);
});
it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: 'dasdas', price: 20 })
    .expect(401);
});
it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'sadasd', price: 20 });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'asdasd',
      price: 21,
    })
    .expect(401);
});
it('returns a 400 if the user does not provide title or price', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'sadasd', price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'asdasd',
      price: -20,
    })
    .expect(400);
});
it('updates the tickets provided valid inputs', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'sadasd', price: 20 });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(200);

  const ticketResposne = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();
  expect(ticketResposne.body.title).toEqual('new title');
  expect(ticketResposne.body.price).toEqual(100);
});
it('rejects the update if ticket is reserved', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'sadasd', price: 20 });
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(400);
});
